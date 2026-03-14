export const smoothScrollToBottom = (
  element: HTMLElement | null,
  force = false,
  smooth = true
) => {
  if (!element) return;
  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;
  if (force || distanceFromBottom < 200) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }
};
