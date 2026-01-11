export const smoothScrollToBottom = (
  element: HTMLElement | null,
  force = false
) => {
  if (!element) return;

  const isNearBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight < 100;

  if (force || isNearBottom) {
    requestAnimationFrame(() => {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth",
      });
    });
  }
};
