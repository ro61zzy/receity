"use client";

import { useEffect, useRef, useState } from "react";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { RECEIPT_WIDTH_PX } from "@/lib/pdf";

export function ReceiptPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const width = container.clientWidth;
      setScale(Math.min(1, width / RECEIPT_WIDTH_PX));
      if (innerRef.current) {
        setHeight(innerRef.current.offsetHeight);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="mx-auto overflow-hidden"
        style={{
          width: RECEIPT_WIDTH_PX * scale,
          height: height ? height * scale : undefined,
        }}
      >
        <div
          ref={innerRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: RECEIPT_WIDTH_PX,
          }}
        >
          <ReceiptPreview />
        </div>
      </div>
    </div>
  );
}
