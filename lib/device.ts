export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

/** Mac, iOS Simulator, and iPad-on-Mac */
export function isDesktopLikeDevice(): boolean {
  if (typeof navigator === "undefined") return true;

  const ua = navigator.userAgent;

  if (/Simulator/i.test(ua)) return true;

  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return true;
  }

  if (/Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPad|iPod|Android/i.test(ua)) {
    return true;
  }

  return false;
}

export function isRealMobileDevice(): boolean {
  return isMobileDevice() && !isDesktopLikeDevice();
}
