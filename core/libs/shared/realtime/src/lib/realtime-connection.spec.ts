import { describe, expect, it, vi } from 'vitest';
import type { Socket } from 'socket.io-client';
import { REALTIME_WIRE, type RealtimeAck } from '@inithium/shared-contracts';
import { RealtimeConnection, type ChannelListener } from './realtime-connection.service';

type Handler = (...args: unknown[]) => void;

/** A stand-in for the Socket.IO client: records what's sent and lets the test play the api. */
function fakeSocket() {
  const handlers = new Map<string, Handler[]>();
  const sent: { event: string; data: unknown; ack?: (answer: RealtimeAck) => void }[] = [];
  const socket = {
    connected: false,
    connects: 0,
    on(event: string, handler: Handler) {
      handlers.set(event, [...(handlers.get(event) ?? []), handler]);
      return socket;
    },
    emit(event: string, data: unknown, ack?: (answer: RealtimeAck) => void) {
      sent.push({ event, data, ack });
      return socket;
    },
    connect() {
      socket.connects += 1;
      return socket;
    },
    disconnect() {
      return socket;
    },
    removeAllListeners() {
      handlers.clear();
      return socket;
    },
    /** The api's side: fire an event at the client. */
    fire(event: string, ...args: unknown[]) {
      if (event === 'connect') socket.connected = true;
      if (event === 'disconnect') socket.connected = false;
      for (const handler of handlers.get(event) ?? []) handler(...args);
    },
    sent,
    subscribes: () => sent.filter((entry) => entry.event === REALTIME_WIRE.subscribe),
  };
  return socket;
}

function setup() {
  const socket = fakeSocket();
  const refreshSession = vi.fn(async () => true);
  const connection = new RealtimeConnection({ refreshSession, createSocket: () => socket as unknown as Socket });
  return { socket, connection, refreshSession };
}

const listener = (): Required<ChannelListener> => ({ onEvent: vi.fn(), onPresence: vi.fn(), onState: vi.fn(), onResubscribed: vi.fn() });

describe('RealtimeConnection (decision 0121)', () => {
  it('opens on the first subscription and subscribes each channel once, however many listen', () => {
    const { socket, connection } = setup();
    expect(socket.connects).toBe(0);
    const first = listener();
    const second = listener();
    const stopFirst = connection.subscribe('core:pages', first);
    const stopSecond = connection.subscribe('core:pages', second);
    expect(socket.connects).toBe(1);
    socket.fire('connect');
    expect(socket.subscribes()).toHaveLength(1);
    socket.subscribes()[0]?.ack?.({ ok: true });
    expect(second.onState).toHaveBeenLastCalledWith({ status: 'subscribed' });

    socket.fire(REALTIME_WIRE.event, { channel: 'core:pages', type: 'editing.changed', payload: { pageId: 'p' } });
    expect(first.onEvent).toHaveBeenCalledWith('editing.changed', { pageId: 'p' });
    expect(second.onEvent).toHaveBeenCalledTimes(1);

    stopFirst();
    expect(socket.sent.some((entry) => entry.event === REALTIME_WIRE.unsubscribe)).toBe(false);
    stopSecond();
    expect(socket.sent.filter((entry) => entry.event === REALTIME_WIRE.unsubscribe)).toHaveLength(1);
  });

  it('subscribes again after reconnecting and says events may have been missed', () => {
    const { socket, connection } = setup();
    const watcher = listener();
    connection.subscribe('core:pages', watcher);
    socket.fire('connect');
    socket.subscribes()[0]?.ack?.({ ok: true });
    socket.fire('disconnect', 'transport close');
    expect(connection.status).toBe('offline');
    socket.fire('connect');
    socket.subscribes()[1]?.ack?.({ ok: true });
    expect(watcher.onResubscribed).toHaveBeenCalledTimes(1);
  });

  it('reports a refused subscription', () => {
    const { socket, connection } = setup();
    const watcher = listener();
    connection.subscribe('core:pages', watcher);
    socket.fire('connect');
    socket.subscribes()[0]?.ack?.({ ok: false, code: 'FORBIDDEN', message: 'No' });
    expect(watcher.onState).toHaveBeenLastCalledWith({ status: 'refused', code: 'FORBIDDEN', message: 'No' });
  });

  it('keeps the members list from presence messages', () => {
    const { socket, connection } = setup();
    const watcher = listener();
    connection.subscribe('client-x:room/a', watcher);
    socket.fire('connect');
    const member = (key: string) => ({ key, guest: true, activity: 'active' as const });
    socket.fire(REALTIME_WIRE.presence, { channel: 'client-x:room/a', kind: 'sync', members: [member('a')] });
    socket.fire(REALTIME_WIRE.presence, { channel: 'client-x:room/a', kind: 'join', member: member('b') });
    socket.fire(REALTIME_WIRE.presence, { channel: 'client-x:room/a', kind: 'leave', key: 'a' });
    expect(watcher.onPresence).toHaveBeenLastCalledWith([member('b')]);
  });

  it('refreshes the session and reconnects when the api ends it', async () => {
    const { socket, connection, refreshSession } = setup();
    connection.subscribe('core:pages', listener());
    socket.fire('connect');
    socket.fire(REALTIME_WIRE.reauth);
    socket.fire('disconnect', 'io server disconnect');
    await vi.waitFor(() => expect(socket.connects).toBe(2));
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });
});
