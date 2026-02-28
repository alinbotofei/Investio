export const smoothScrollToBottom = (
  element: HTMLElement | null,
  force = false
) => {
  if (!element) return;

  const isNearBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight < 100;

  if (force || isNearBottom) {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      requestAnimationFrame(() => {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: "smooth",
        });
      });
    }, 0);
  }
};
