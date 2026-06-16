export function getReceiptPdfFilename(
  customerName: string,
  receiptNumber: string,
): string {
  const firstName = customerName.trim().split(/\s+/)[0]?.toLowerCase() ?? "";

  if (firstName) {
    const safeName = firstName.replace(/[^a-z0-9-]/gi, "");
    if (safeName) return `${safeName} receipt.pdf`;
  }

  return `${receiptNumber}.pdf`;
}
