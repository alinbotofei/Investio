export const WATCHLIST_UPDATED_EVENT = "watchlist-updated";

export function emitWatchlistUpdate() {
  window.dispatchEvent(new Event(WATCHLIST_UPDATED_EVENT));
}

export function onWatchlistUpdate(callback: () => void) {
  window.addEventListener(WATCHLIST_UPDATED_EVENT, callback);
  return () => window.removeEventListener(WATCHLIST_UPDATED_EVENT, callback);
}

export const CHAT_RESET_EVENT = "chat:reset";

export function emitChatReset() {
  window.dispatchEvent(new Event(CHAT_RESET_EVENT));
}

export function onChatReset(callback: () => void) {
  window.addEventListener(CHAT_RESET_EVENT, callback);
  return () => window.removeEventListener(CHAT_RESET_EVENT, callback);
}
