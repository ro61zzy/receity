import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getReceiptPrintStyles } from "@/lib/receipt-print-styles";
import { RECEIPT_THEME } from "@/lib/receipt-theme";

export const RECEIPT_WIDTH_PX = 400;
const CAPTURE_SCALE = 2;
const MM_PER_PX = 25.4 / 96;
const RECEIPT_SERIF = "'Libre Baskerville', Georgia, 'Times New Roman', serif";
const RECEIPT_MONO = "'IBM Plex Mono', 'Courier New', monospace";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@500;600&display=swap";

function applyCaptureStyles(root: HTMLElement): void {
  root.style.boxShadow = "none";
  root.style.margin = "0";
  root.style.width = `${RECEIPT_WIDTH_PX}px`;
  root.style.maxWidth = `${RECEIPT_WIDTH_PX}px`;
  root.style.minWidth = `${RECEIPT_WIDTH_PX}px`;
  root.style.fontFamily = RECEIPT_SERIF;

  root.querySelectorAll("*").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;

    const style = node.style;
    if (style.fontFamily.includes("var(--font-receipt-serif)")) {
      style.fontFamily = RECEIPT_SERIF;
    }
    if (style.fontFamily.includes("var(--font-receipt-mono)")) {
      style.fontFamily = RECEIPT_MONO;
    }
  });

  root.querySelectorAll(".receipt-social-row").forEach((row) => {
    if (!(row instanceof HTMLElement)) return;
    row.style.display = "flex";
    row.style.flexDirection = "row";
    row.style.alignItems = "center";
    row.style.height = "16px";
  });

  root.querySelectorAll(".receipt-social-icon").forEach((slot) => {
    if (!(slot instanceof HTMLElement)) return;
    slot.style.display = "flex";
    slot.style.alignItems = "center";
    slot.style.justifyContent = "center";
    slot.style.lineHeight = "0";
    slot.style.width = "14px";
    slot.style.height = "14px";
  });

  root.querySelectorAll(".receipt-social-icon svg").forEach((svg) => {
    if (!(svg instanceof SVGElement)) return;
    svg.setAttribute("width", "12");
    svg.setAttribute("height", "12");
    svg.style.display = "block";
    svg.style.margin = "0";
    svg.style.padding = "0";
  });

  root.querySelectorAll(".receipt-social-text").forEach((text) => {
    if (!(text instanceof HTMLElement)) return;
    text.style.display = "flex";
    text.style.alignItems = "center";
    text.style.height = "14px";
    text.style.lineHeight = "1";
    text.style.fontFamily = RECEIPT_MONO;
  });
}

function getIframeShell(): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="${FONT_URL}" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        background: ${RECEIPT_THEME.paper};
        color: ${RECEIPT_THEME.ink};
        width: ${RECEIPT_WIDTH_PX}px;
      }
      .receipt-social-row {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        height: 16px !important;
      }
      .receipt-social-icon {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 14px !important;
        height: 14px !important;
        line-height: 0 !important;
        flex-shrink: 0 !important;
      }
      .receipt-social-icon svg {
        display: block !important;
        width: 12px !important;
        height: 12px !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .receipt-social-text {
        display: flex !important;
        align-items: center !important;
        height: 14px !important;
        line-height: 1 !important;
        font-family: ${RECEIPT_MONO} !important;
      }
    </style>
  </head>
  <body></body>
</html>`;
}

async function waitForIframe(iframe: HTMLIFrameElement): Promise<Document> {
  await new Promise<void>((resolve) => {
    if (iframe.contentDocument?.readyState === "complete") {
      resolve();
    } else {
      iframe.onload = () => resolve();
    }
  });

  const doc = iframe.contentDocument;
  if (!doc) throw new Error("Could not access capture iframe");

  if (doc.fonts?.ready) {
    await doc.fonts.ready;
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  return doc;
}

/**
 * html2canvas cannot parse Tailwind v4 lab()/oklch() colors from the main page.
 * Capture inside an isolated iframe whose document has only hex colors.
 */
async function captureReceiptCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-9999px;top:0;border:0;width:0;height:0;visibility:hidden;";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    if (!doc) throw new Error("Could not create capture iframe");

    doc.open();
    doc.write(getIframeShell());
    doc.close();

    await waitForIframe(iframe);

    const clone = element.cloneNode(true) as HTMLElement;
    applyCaptureStyles(clone);
    doc.body.appendChild(clone);

    const captureHeight = clone.offsetHeight;

    return await html2canvas(clone, {
      scale: CAPTURE_SCALE,
      useCORS: true,
      allowTaint: true,
      backgroundColor: RECEIPT_THEME.paper,
      logging: false,
      width: RECEIPT_WIDTH_PX,
      height: captureHeight,
      windowWidth: RECEIPT_WIDTH_PX,
      windowHeight: captureHeight,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        clonedDoc
          .querySelectorAll('link[rel="stylesheet"]:not([href*="fonts.googleapis"])')
          .forEach((el) => el.remove());
      },
    });
  } finally {
    iframe.remove();
  }
}

async function buildReceiptPdfBlob(element: HTMLElement): Promise<Blob> {
  const canvas = await captureReceiptCanvas(element);

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error("Receipt capture produced an empty canvas");
  }

  const imgData = canvas.toDataURL("image/png");
  const widthMm = RECEIPT_WIDTH_PX * MM_PER_PX;
  const heightMm = (canvas.height / CAPTURE_SCALE) * MM_PER_PX;

  const pdf = new jsPDF({
    unit: "mm",
    format: [widthMm, heightMm],
    compress: true,
  });

  pdf.addImage(imgData, "PNG", 0, 0, widthMm, heightMm, undefined, "FAST");
  return pdf.output("blob");
}

export async function generateReceiptPdfBlob(
  element: HTMLElement,
): Promise<Blob> {
  return buildReceiptPdfBlob(element);
}

export async function downloadReceiptPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const blob = await buildReceiptPdfBlob(element);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function printReceipt(element: HTMLElement): void {
  const existingRoot = document.getElementById("receipt-print-root");
  const existingStyles = document.getElementById("receipt-print-styles");
  existingRoot?.remove();
  existingStyles?.remove();

  const clone = element.cloneNode(true) as HTMLElement;
  applyCaptureStyles(clone);

  const printRoot = document.createElement("div");
  printRoot.id = "receipt-print-root";
  printRoot.appendChild(clone);

  const styleEl = document.createElement("style");
  styleEl.id = "receipt-print-styles";
  styleEl.textContent = `
    ${getReceiptPrintStyles()}

    @page {
      margin: 0;
      size: ${RECEIPT_WIDTH_PX}px ${clone.offsetHeight}px;
    }

    @media screen {
      #receipt-print-root { display: none !important; }
    }

    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: ${RECEIPT_THEME.paper} !important;
        width: ${RECEIPT_WIDTH_PX}px !important;
      }

      body > *:not(#receipt-print-root):not(#receipt-print-styles) {
        display: none !important;
      }

      #receipt-print-root {
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      #receipt-print-root #receipt-preview {
        box-shadow: none !important;
        margin: 0 !important;
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  `;

  document.head.appendChild(styleEl);
  document.body.appendChild(printRoot);

  const cleanup = () => {
    styleEl.remove();
    printRoot.remove();
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);
  window.print();
}
