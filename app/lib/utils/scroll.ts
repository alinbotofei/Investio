export const smoothScrollToBottom = (
  element: HTMLElement | null,
  force = false
) => {
  if (!element) return;

  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;
  const isNearBottom = distanceFromBottom < 150;

  // Synchronous scroll (no RAF) — prevents race condition where user scrolls
  // up during streaming and the queued RAF overrides the user's position.
  if (force || isNearBottom) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });
  }
};
