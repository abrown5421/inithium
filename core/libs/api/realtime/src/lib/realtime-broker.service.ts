/** An event on its way to a channel's subscribers, wherever they're connected. */
export type BrokerMessage = { channel: string; type: string; payload: unknown };

/**
 * Carries published events to every api instance, each of which delivers them to its own connections (decision
 * 0121). Every client runs one instance today, so core ships only the in-memory broker; when a client first needs
 * more, a MongoDB change-streams broker implements this (never Redis, which would add a paid service).
 */
export interface RealtimeBroker {
  /** Sends an event to every instance, this one included. */
  publish(message: BrokerMessage): void;
  /** Receives every published event; returns a function that stops it. */
  subscribe(listener: (message: BrokerMessage) => void): () => void;
}

/** The broker for a single api instance: published events go straight to this instance's listeners. */
export function createMemoryBroker(): RealtimeBroker {
  const listeners = new Set<(message: BrokerMessage) => void>();
  return {
    publish(message) {
      for (const listener of listeners) listener(message);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
