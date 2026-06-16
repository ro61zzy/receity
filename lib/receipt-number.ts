import { RECEIPT_PREFIX } from "./constants";

export function formatReceiptNumber(counter: number): string {
  return `${RECEIPT_PREFIX}-${String(counter).padStart(4, "0")}`;
}

export function getNextReceiptNumber(currentCounter: number): {
  number: string;
  nextCounter: number;
} {
  const nextCounter = currentCounter + 1;
  return {
    number: formatReceiptNumber(nextCounter),
    nextCounter,
  };
}
