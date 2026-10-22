import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { revokeSessions } from '@inithium/api-auth';
import { connectTestRealtime, listenTestApi, testClient, type TestServer } from '@inithium/api-testing';
import { createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import { REALTIME_LIMITS, defineRealtimeChannel } from '@inithium/shared-contracts';
import { RealtimeError, serveRealtimeChannel } from './realtime-channels.service';
import { publishRealtime, startRealtime, stopRealtime } from './realtime-server.service';

// A game room anyone may join (guests too), with presence and messages, like a Jackbox-style game would use.
const roomChannel = defineRealtimeChannel({
  namespace: 'client-test',
  kind: 'room',
  params: ['code'],
  events: { 'round.started': z.object({ round: z.number() }) },
  messages: {
    'answer.submit': { payload: z.object({ answer: z.string().max(20) }), result: z.object({ accepted: z.boolean() }) },
    'answer.refuse': { payload: z.object({}) },
  },
  presence: { meta: z.object({ nickname: z.string().max(20) }) },
});
// Staff only.
const staffChannel = defineRealtimeChannel({ namespace: 'client-test', kind: 'staff', params: [], events: { 'note.added': z.object({ text: z.string() }) } });

const app = createTestApiWithAuth(() => undefined);
let server: TestServer;

beforeEach(async () => {
  server = await listenTestApi(app);
  startRealtime(server.server, {
    channels: [
      serveRealtimeChannel(roomChannel, {
        guests: true,
        canSubscribe: (_context, { code }) => code !== 'CLOSED',
        messages: {
          'answer.submit': ({ answer }) => ({ accepted: answer.length > 0 }),
          'answer.refuse': () => {
            throw new RealtimeError('FORBIDDEN', 'Not your turn');
          },
        },
      }),
      serveRealtimeChannel(staffChannel, { permission: 'pages.edit' }),
    ],
  });
});

afterEach(async () => {
  await stopRealtime();
  await server.close();
});

const room = roomChannel.name({ code: 'ABCD' });

describe('subscribing (decision 0121)', () => {
  it('lets guests into a guest channel and keeps them out of others', async () => {
    const guest = await connectTestRealtime(server);
    expect(await guest.subscribe(room, { nickname: 'Ada' })).toEqual({ ok: true });
    expect(await guest.subscribe(staffChannel.name())).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    guest.close();
  });

  it('checks the channel’s permission and its own test', async () => {
    const { client: editor } = await signedInClient(app, 'editor');
    const { client: member } = await signedInClient(app, 'user');
    const staff = await connectTestRealtime(server, editor);
    const user = await connectTestRealtime(server, member);
    expect(await staff.subscribe(staffChannel.name())).toEqual({ ok: true });
    expect(await user.subscribe(staffChannel.name())).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    expect(await user.subscribe(roomChannel.name({ code: 'CLOSED' }), { nickname: 'x' })).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    staff.close();
    user.close();
  });

  it('refuses unknown channels, bad names and presence details that don’t match', async () => {
    const guest = await connectTestRealtime(server);
    expect(await guest.subscribe('client-test:nothing')).toMatchObject({ ok: false, code: 'NOT_FOUND' });
    expect(await guest.subscribe('not a channel')).toMatchObject({ ok: false, code: 'INVALID' });
    expect(await guest.subscribe(room, { nickname: 42 })).toMatchObject({ ok: false, code: 'INVALID' });
    guest.close();
  });

  it('refuses connections from another site’s pages', async () => {
    await expect(connectTestRealtime(server, undefined, { origin: 'https://evil.example' })).rejects.toThrow();
    const same = await connectTestRealtime(server, undefined, { origin: server.url });
    same.close();
  });
});

describe('publishing', () => {
  it('reaches the channel’s subscribers only, checked against the channel’s schema', async () => {
    const inRoom = await connectTestRealtime(server);
    const elsewhere = await connectTestRealtime(server);
    await inRoom.subscribe(room, { nickname: 'Ada' });
    await elsewhere.subscribe(roomChannel.name({ code: 'WXYZ' }), { nickname: 'Bob' });

    publishRealtime(roomChannel, { code: 'ABCD' }, 'round.started', { round: 2 });
    expect(await inRoom.nextEvent()).toEqual({ channel: room, type: 'round.started', payload: { round: 2 } });
    await expect(elsewhere.nextEvent(undefined, 200)).rejects.toThrow('Timed out');
    expect(() => publishRealtime(roomChannel, { code: 'ABCD' }, 'round.started', { round: 'two' } as never)).toThrow();

    await inRoom.unsubscribe(room);
    publishRealtime(roomChannel, { code: 'ABCD' }, 'round.started', { round: 3 });
    await expect(inRoom.nextEvent(undefined, 200)).rejects.toThrow('Timed out');
    inRoom.close();
    elsewhere.close();
  });
});

describe('messages', () => {
  it('runs the channel’s handler and answers with its result', async () => {
    const guest = await connectTestRealtime(server);
    expect(await guest.send(room, 'answer.submit', { answer: 'yes' })).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    await guest.subscribe(room, { nickname: 'Ada' });
    expect(await guest.send(room, 'answer.submit', { answer: 'yes' })).toEqual({ ok: true, result: { accepted: true } });
    expect(await guest.send(room, 'answer.submit', { answer: 7 })).toMatchObject({ ok: false, code: 'INVALID' });
    expect(await guest.send(room, 'answer.unknown', {})).toMatchObject({ ok: false, code: 'NOT_FOUND' });
    expect(await guest.send(room, 'answer.refuse', {})).toEqual({ ok: false, code: 'FORBIDDEN', message: 'Not your turn' });
    guest.close();
  });

  it('limits how fast a connection may send', async () => {
    const guest = await connectTestRealtime(server);
    await guest.subscribe(room, { nickname: 'Ada' });
    const answers = await Promise.all(Array.from({ length: REALTIME_LIMITS.messagesPerSecond * 4 }, () => guest.send(room, 'answer.submit', { answer: 'a' })));
    expect(answers.some((answer) => !answer.ok && answer.code === 'LIMITED')).toBe(true);
    guest.close();
  });
});

describe('presence', () => {
  it('syncs the members on subscribing, then sends joins, activity and leaves', async () => {
    const { client, account } = await signedInClient(app, 'user');
    const host = await connectTestRealtime(server, client);
    await host.subscribe(room, { nickname: 'Host' });
    expect(await host.nextPresence()).toEqual({
      channel: room,
      kind: 'sync',
      members: [{ key: account.id, userId: account.id, guest: false, activity: 'active', meta: { nickname: 'Host' } }],
    });

    const phone = await connectTestRealtime(server);
    await phone.subscribe(room, { nickname: 'Phone' });
    const joined = await host.nextPresence((message) => message.kind === 'join');
    expect(joined).toMatchObject({ kind: 'join', member: { guest: true, meta: { nickname: 'Phone' } } });

    phone.activity('idle');
    expect(await host.nextPresence((message) => message.kind === 'update')).toMatchObject({ member: { guest: true, activity: 'idle' } });

    phone.close();
    expect(await host.nextPresence((message) => message.kind === 'leave')).toMatchObject({ kind: 'leave' });
    host.close();
  });
});

describe('sessions', () => {
  it('ends a user’s connections when their sessions are revoked', async () => {
    const { client, account } = await signedInClient(app, 'editor');
    const realtime = await connectTestRealtime(server, client);
    await revokeSessions(account.id);
    await realtime.disconnected();
    expect(realtime.reauths).toBe(1);
  });

  it('treats a connection without a valid session as a guest', async () => {
    const stranger = testClient(app);
    stranger.setCookie('inithium_access', 'not-a-token');
    const realtime = await connectTestRealtime(server, stranger);
    expect(await realtime.subscribe(staffChannel.name())).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    realtime.close();
  });
});
