/**
 * Mutex para refresh de tokens.
 *
 * Evita que multiples requests fallidas con 401 disparen refresh en paralelo.
 * La primera dispara el refresh y las demas se suscriben para ser reintentadas
 * con el nuevo token cuando el refresh termine.
 */

type Subscriber = (newToken: string) => void;

let isRefreshing = false;
let subscribers: Subscriber[] = [];

export const refreshMutex = {
  isLocked: () => isRefreshing,

  lock: () => {
    isRefreshing = true;
  },

  unlock: () => {
    isRefreshing = false;
  },

  subscribe: (cb: Subscriber) => {
    subscribers.push(cb);
  },

  notify: (newToken: string) => {
    const current = subscribers;
    subscribers = [];
    current.forEach((cb) => cb(newToken));
  },

  reject: () => {
    subscribers = [];
  },
};
