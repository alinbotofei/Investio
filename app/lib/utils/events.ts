export const WATCHLIST_UPDATED_EVENT = "watchlist-updated";

export function emitWatchlistUpdate() {
  window.dispatchEvent(new Event(WATCHLIST_UPDATED_EVENT));
}

export function onWatchlistUpdate(callback: () => void) {
  window.addEventListener(WATCHLIST_UPDATED_EVENT, callback);
  return () => window.removeEventListener(WATCHLIST_UPDATED_EVENT, callback);
}
