export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

/** Mac, iOS Simulator, and iPad-on-Mac — share sheet won't include WhatsApp */
export function isDesktopLikeDevice(): boolean {
  if (typeof navigator === "undefined") return true;

  const ua = navigator.userAgent;

  if (/Simulator/i.test(ua)) return true;

  // Safari/iOS simulator on Mac reports iPhone/iPad with MacIntel platform
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

/** Share sheet with PDF only on real phones — not Mac/desktop/simulator */
export function canShareReceiptPdfOnMobile(): boolean {
  if (!isRealMobileDevice()) return false;
  if (typeof navigator === "undefined" || !navigator.canShare) return false;

  try {
    const testFile = new File(["test"], "test.pdf", { type: "application/pdf" });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}
