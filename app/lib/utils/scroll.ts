export const smoothScrollToBottom = (
  element: HTMLElement | null,
  force = false
) => {
  if (!element) return;

  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;
  const isNearBottom = distanceFromBottom < 100;

  if (force || isNearBottom) {
    requestAnimationFrame(() => {
      // Use instant scroll during streaming to prevent competing smooth animations
      // Only use smooth when explicitly near bottom (user-visible transition)
      element.scrollTo({
        top: element.scrollHeight,
        behavior: isNearBottom ? "smooth" : "instant",
      });
    });
  }
};
