import { RECEIPT_THEME } from "./receipt-theme";

export function getReceiptPrintStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      margin: 0;
      padding: 24px;
      background: #e5e0d8;
      font-family: 'Libre Baskerville', Georgia, serif;
    }

    #receipt-preview {
      font-family: 'Libre Baskerville', Georgia, serif;
      color: ${RECEIPT_THEME.ink};
      background-color: ${RECEIPT_THEME.paper};
      background-image:
        radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.6) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(200,180,150,0.15) 0%, transparent 50%),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 27px,
          rgba(142, 180, 212, 0.08) 27px,
          rgba(142, 180, 212, 0.08) 28px
        );
    }

    @media print {
      body { padding: 0; background: ${RECEIPT_THEME.paper}; }
    }
  `;
}

export function formatSocialHandle(url: string): string {
  if (!url.trim()) return "";
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const path = parsed.pathname.replace(/^\//, "");
    return path.startsWith("@") ? path : `@${path}`;
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}
