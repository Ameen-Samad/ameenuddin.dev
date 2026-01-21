const SCROLL_KEY = "scroll-position";

export function saveScrollPosition() {
	const scrollY = window.scrollY;
	sessionStorage.setItem(SCROLL_KEY, scrollY.toString());
}

export function restoreScrollPosition() {
	const savedScroll = sessionStorage.getItem(SCROLL_KEY);
	if (savedScroll !== null) {
		window.scrollTo(0, parseInt(savedScroll, 10));
		sessionStorage.removeItem(SCROLL_KEY);
	}
}

export function clearScrollPosition() {
	sessionStorage.removeItem(SCROLL_KEY);
}
