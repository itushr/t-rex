export function navigateTo(url: string): void {
  if (window.location.pathname === url) return;
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
