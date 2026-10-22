import { io, type Socket } from 'socket.io-client';
import {
  REALTIME_IDLE_AFTER_MS,
  REALTIME_PATH,
  REALTIME_WIRE,
  realtimeEventSchema,
  realtimePresenceSchema,
  type PresenceActivity,
  type PresenceMember,
  type RealtimeAck,
  type RealtimeErrorCode,
} from '@inithium/shared-contracts';

/** Where the connection stands: not opened yet, opening, open, or lost (it keeps trying). */
export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'offline';

/** Where one channel subscription stands. Refused subscriptions aren't retried until the connection reopens. */
export type SubscriptionState = { status: 'subscribing' } | { status: 'subscribed' } | { status: 'refused'; code: RealtimeErrorCode; message: string };

/** What a subscriber is told about its channel. */
export type ChannelListener = {
  onEvent?(type: string, payload: unknown): void;
  onPresence?(members: PresenceMember[]): void;
  onState?(state: SubscriptionState): void;
  /** Subscribed again after the connection dropped: events published meanwhile were missed, so refetch. */
  onResubscribed?(): void;
};

/** A message the api refused, or one that got no answer. */
export class RealtimeRequestError extends Error {
  constructor(
    readonly code: RealtimeErrorCode | 'TIMEOUT',
    message: string,
  ) {
    super(message);
    this.name = 'RealtimeRequestError';
  }
}

type Subscription = { meta: unknown; listeners: Set<ChannelListener>; members: Map<string, PresenceMember>; state: SubscriptionState; subscribedOnce: boolean };

export type RealtimeConnectionOptions = {
  /** Refreshes the session when the api says it ended or expired (true if still signed in). */
  refreshSession(): Promise<boolean>;
  /** Makes the Socket.IO client; tests pass a stand-in. */
  createSocket?(): Socket;
};

/** How long a message waits for the api's answer. */
const SEND_TIMEOUT_MS = 10_000;

/**
 * The browser's one realtime connection (decision 0121), shared by every subscriber in the app: opened on the first
 * subscription, it subscribes each channel once however many components listen, subscribes them all again when
 * it reconnects, and reports the person active or idle. When the api ends the session's connection (expiry or
 * revocation) it refreshes the session and reconnects, signed in or as a guest.
 */
export class RealtimeConnection {
  private socket: Socket | undefined;
  private readonly subscriptions = new Map<string, Subscription>();
  private readonly statusListeners = new Set<() => void>();
  private currentStatus: RealtimeStatus = 'idle';
  private activity: PresenceActivity = 'active';
  private stopTracking: (() => void) | undefined;
  private reauthPending = false;

  constructor(private readonly options: RealtimeConnectionOptions) {}

  get status(): RealtimeStatus {
    return this.currentStatus;
  }

  /** Calls the listener whenever `status` changes; returns a function that stops it. */
  onStatusChange = (listener: () => void): (() => void) => {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  };

  /** Subscribes to a channel by name; returns a function that unsubscribes. `meta` is presence metadata. */
  subscribe(channel: string, listener: ChannelListener, meta?: unknown): () => void {
    let subscription = this.subscriptions.get(channel);
    if (!subscription) {
      subscription = { meta, listeners: new Set(), members: new Map(), state: { status: 'subscribing' }, subscribedOnce: false };
      this.subscriptions.set(channel, subscription);
      if (this.socket?.connected) this.join(this.socket, channel, subscription);
    }
    const current = subscription;
    current.listeners.add(listener);
    listener.onState?.(current.state);
    if (current.members.size) listener.onPresence?.([...current.members.values()]);
    this.open();

    return () => {
      current.listeners.delete(listener);
      if (current.listeners.size || this.subscriptions.get(channel) !== current) return;
      this.subscriptions.delete(channel);
      if (this.socket?.connected) this.socket.emit(REALTIME_WIRE.unsubscribe, { channel }, () => undefined);
    };
  }

  /** Sends a message on a subscribed channel and resolves with the api's result, or rejects with its refusal. */
  async send(channel: string, type: string, payload: unknown): Promise<unknown> {
    const socket = this.open();
    let ack: RealtimeAck;
    try {
      ack = await socket.timeout(SEND_TIMEOUT_MS).emitWithAck(REALTIME_WIRE.send, { channel, type, payload });
    } catch {
      throw new RealtimeRequestError('TIMEOUT', 'No answer from the server');
    }
    if (!ack.ok) throw new RealtimeRequestError(ack.code, ack.message);
    return ack.result;
  }

  /** Reopens the connection, e.g. after signing in or out, so the api sees the new session. */
  reconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket.connect();
  }

  /** Closes the connection; a later subscription opens it again. */
  close(): void {
    this.stopTracking?.();
    this.stopTracking = undefined;
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = undefined;
    this.setStatus('idle');
  }

  private open(): Socket {
    if (this.socket) return this.socket;
    const socket = this.options.createSocket?.() ?? io({ path: REALTIME_PATH, autoConnect: false });
    this.socket = socket;

    socket.on('connect', () => {
      this.setStatus('connected');
      if (this.activity === 'idle') socket.emit(REALTIME_WIRE.activity, { activity: 'idle' });
      for (const [channel, subscription] of this.subscriptions) this.join(socket, channel, subscription);
    });
    socket.on('connect_error', () => this.setStatus('offline'));
    socket.on('disconnect', () => {
      this.setStatus('offline');
      for (const subscription of this.subscriptions.values()) {
        subscription.members.clear();
        this.setState(subscription, { status: 'subscribing' });
      }
      // The api closed it because the session ended or expired: refresh, then reconnect as whoever we are now.
      // Otherwise Socket.IO reconnects by itself after a dropped connection, and stays closed after one closed on
      // purpose (by us, or by the api for too many connections).
      if (this.reauthPending) {
        this.reauthPending = false;
        void this.options.refreshSession().finally(() => {
          if (this.socket === socket) socket.connect();
        });
      }
    });
    socket.on(REALTIME_WIRE.reauth, () => {
      this.reauthPending = true;
    });
    socket.on(REALTIME_WIRE.event, (raw: unknown) => {
      const event = realtimeEventSchema.safeParse(raw).data;
      const subscription = event && this.subscriptions.get(event.channel);
      if (!event || !subscription) return;
      for (const listener of subscription.listeners) listener.onEvent?.(event.type, event.payload);
    });
    socket.on(REALTIME_WIRE.presence, (raw: unknown) => {
      const message = realtimePresenceSchema.safeParse(raw).data;
      const subscription = message && this.subscriptions.get(message.channel);
      if (!message || !subscription) return;
      const { members } = subscription;
      if (message.kind === 'sync') {
        members.clear();
        for (const member of message.members) members.set(member.key, member);
      } else if (message.kind === 'leave') members.delete(message.key);
      else members.set(message.member.key, message.member);
      for (const listener of subscription.listeners) listener.onPresence?.([...members.values()]);
    });

    this.stopTracking = this.trackActivity();
    this.setStatus('connecting');
    socket.connect();
    return socket;
  }

  private join(socket: Socket, channel: string, subscription: Subscription): void {
    const request = subscription.meta === undefined ? { channel } : { channel, meta: subscription.meta };
    socket.emit(REALTIME_WIRE.subscribe, request, (ack: RealtimeAck) => {
      if (this.subscriptions.get(channel) !== subscription) return;
      const again = subscription.subscribedOnce;
      if (ack.ok) subscription.subscribedOnce = true;
      this.setState(subscription, ack.ok ? { status: 'subscribed' } : { status: 'refused', code: ack.code, message: ack.message });
      if (ack.ok && again) for (const listener of subscription.listeners) listener.onResubscribed?.();
    });
  }

  private setState(subscription: Subscription, state: SubscriptionState): void {
    subscription.state = state;
    for (const listener of subscription.listeners) listener.onState?.(state);
  }

  private setStatus(status: RealtimeStatus): void {
    if (status === this.currentStatus) return;
    this.currentStatus = status;
    for (const listener of this.statusListeners) listener();
  }

  /** Reports idle after REALTIME_IDLE_AFTER_MS without input or as soon as the tab is hidden, and active again on input. */
  private trackActivity(): (() => void) | undefined {
    if (typeof document === 'undefined') return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastInput = 0;
    const report = (activity: PresenceActivity) => {
      if (activity === this.activity) return;
      this.activity = activity;
      if (this.socket?.connected) this.socket.emit(REALTIME_WIRE.activity, { activity });
    };
    const input = () => {
      if (document.hidden) return;
      const now = Date.now();
      // Input comes in floods (pointer moves); look at it at most once a second while active.
      if (this.activity === 'active' && now - lastInput < 1000) return;
      lastInput = now;
      report('active');
      clearTimeout(timer);
      timer = setTimeout(() => report('idle'), REALTIME_IDLE_AFTER_MS);
    };
    const visibility = () => (document.hidden ? report('idle') : input());
    const inputs = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const;
    for (const name of inputs) window.addEventListener(name, input, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    input();
    return () => {
      clearTimeout(timer);
      for (const name of inputs) window.removeEventListener(name, input);
      document.removeEventListener('visibilitychange', visibility);
    };
  }
}
