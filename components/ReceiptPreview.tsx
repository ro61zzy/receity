"use client";

import { formatCurrency } from "@/lib/currency";
import { calculateItemTotal } from "@/lib/receipt-calculations";
import { formatSocialHandle } from "@/lib/receipt-print-styles";
import { MIN_RECEIPT_ROWS, RECEIPT_THEME } from "@/lib/receipt-theme";
import { useReceiptStore, useReceiptTotals } from "@/lib/store/receipt-store";

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FieldRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        borderBottom: `1px solid ${RECEIPT_THEME.blueLine}`,
        paddingBottom: 4,
        marginBottom: 6,
        fontSize: 11,
      }}
    >
      <span
        style={{
          color: RECEIPT_THEME.blue,
          fontWeight: 700,
          minWidth: 72,
          fontFamily: "var(--font-receipt-serif), Georgia, serif",
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          color: RECEIPT_THEME.ink,
          fontFamily: "var(--font-receipt-mono), monospace",
        }}
      >
        {value || "\u00A0"}
      </span>
    </div>
  );
}

export function ReceiptPreview() {
  const business = useReceiptStore((state) => state.business);
  const receipt = useReceiptStore((state) => state.receipt);
  const { subtotal, total } = useReceiptTotals();

  const validItems = receipt.items.filter((item) => item.name.trim());
  const emptyRowCount = Math.max(0, MIN_RECEIPT_ROWS - validItems.length);

  const paperStyle: React.CSSProperties = {
    fontFamily: "var(--font-receipt-serif), Georgia, serif",
    color: RECEIPT_THEME.ink,
    backgroundColor: RECEIPT_THEME.paper,
    backgroundImage: `
      radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.55) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(200,180,150,0.12) 0%, transparent 50%),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 27px,
        rgba(142, 180, 212, 0.07) 27px,
        rgba(142, 180, 212, 0.07) 28px
      )
    `,
    border: `2px solid ${RECEIPT_THEME.blue}`,
    boxShadow: `
      inset 0 0 0 4px ${RECEIPT_THEME.paper},
      inset 0 0 0 5px ${RECEIPT_THEME.blueLine},
      0 4px 20px rgba(30, 77, 123, 0.12)
    `,
    padding: "20px 22px 24px",
    maxWidth: 400,
    width: "100%",
    margin: "0 auto",
    position: "relative",
  };

  return (
    <div id="receipt-preview" style={paperStyle}>
      {/* Perforated top edge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 12,
          right: 12,
          borderTop: `2px dashed ${RECEIPT_THEME.paperEdge}`,
        }}
      />

      {/* Header row: logo + business + serial stamp */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 14,
          paddingTop: 4,
        }}
      >
        <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 0 }}>
          {business.logo && (
            <img
              src={business.logo}
              alt=""
              style={{
                width: 52,
                height: 52,
                objectFit: "contain",
                border: `1px solid ${RECEIPT_THEME.gridLine}`,
                borderRadius: 4,
                background: "#fff",
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: RECEIPT_THEME.blue,
                lineHeight: 1.25,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}
            >
              {business.name || "Your Business Name"}
            </div>
            {business.address && (
              <div
                style={{
                  fontSize: 9,
                  color: RECEIPT_THEME.inkMuted,
                  marginTop: 3,
                  lineHeight: 1.4,
                }}
              >
                {business.address}
              </div>
            )}
            {business.phone && (
              <div style={{ fontSize: 9, color: RECEIPT_THEME.inkMuted, marginTop: 2 }}>
                Tel: {business.phone}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            border: `2px solid ${RECEIPT_THEME.red}`,
            background: RECEIPT_THEME.redStamp,
            padding: "4px 8px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 7,
              fontWeight: 700,
              color: RECEIPT_THEME.red,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Receipt No.
          </div>
          <div
            style={{
              fontFamily: "var(--font-receipt-mono), monospace",
              fontSize: 13,
              fontWeight: 600,
              color: RECEIPT_THEME.red,
              marginTop: 2,
            }}
          >
            {receipt.receiptNumber}
          </div>
        </div>
      </div>

      {/* Title banner */}
      <div
        style={{
          textAlign: "center",
          borderTop: `2px solid ${RECEIPT_THEME.blue}`,
          borderBottom: `2px solid ${RECEIPT_THEME.blue}`,
          padding: "6px 0",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: RECEIPT_THEME.blue,
            letterSpacing: "0.25em",
          }}
        >
          R E C E I P T
        </span>
      </div>

      {/* Customer fields — book-style ruled lines */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 16px",
          marginBottom: 14,
        }}
      >
        <FieldRow label="Customer" value={receipt.customerName} />
        <FieldRow label="Date" value={formatDisplayDate(receipt.date)} />
        <FieldRow label="Phone" value={receipt.customerPhone} />
        <FieldRow label="Issued" value={formatDisplayDate(receipt.date)} />
      </div>

      {/* Star divider */}
      <div
        style={{
          textAlign: "center",
          color: RECEIPT_THEME.blueLine,
          fontSize: 10,
          letterSpacing: 4,
          marginBottom: 10,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {"* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *"}
      </div>

      {/* Items table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 10,
          marginBottom: 12,
        }}
      >
        <thead>
          <tr style={{ background: RECEIPT_THEME.tableHeader, color: "#fff" }}>
            <th
              style={{
                padding: "5px 6px",
                textAlign: "center",
                fontWeight: 700,
                width: 32,
                borderRight: `1px solid ${RECEIPT_THEME.blueLight}`,
              }}
            >
              No.
            </th>
            <th
              style={{
                padding: "5px 8px",
                textAlign: "left",
                fontWeight: 700,
                borderRight: `1px solid ${RECEIPT_THEME.blueLight}`,
              }}
            >
              Item / Description
            </th>
            <th
              style={{
                padding: "5px 6px",
                textAlign: "center",
                fontWeight: 700,
                width: 36,
                borderRight: `1px solid ${RECEIPT_THEME.blueLight}`,
              }}
            >
              Qty
            </th>
            <th
              style={{
                padding: "5px 6px",
                textAlign: "right",
                fontWeight: 700,
                width: 58,
                borderRight: `1px solid ${RECEIPT_THEME.blueLight}`,
              }}
            >
              Price
            </th>
            <th
              style={{
                padding: "5px 6px",
                textAlign: "right",
                fontWeight: 700,
                width: 62,
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {validItems.map((item, index) => (
            <tr key={item.id}>
              <td
                style={{
                  padding: "7px 6px",
                  textAlign: "center",
                  borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
                  borderRight: `1px solid ${RECEIPT_THEME.gridLine}`,
                  fontFamily: "var(--font-receipt-mono), monospace",
                  color: RECEIPT_THEME.inkMuted,
                }}
              >
                {index + 1}
              </td>
              <td
                style={{
                  padding: "7px 8px",
                  borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
                  borderRight: `1px solid ${RECEIPT_THEME.gridLine}`,
                }}
              >
                {item.name}
              </td>
              <td
                style={{
                  padding: "7px 6px",
                  textAlign: "center",
                  borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
                  borderRight: `1px solid ${RECEIPT_THEME.gridLine}`,
                  fontFamily: "var(--font-receipt-mono), monospace",
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  padding: "7px 6px",
                  textAlign: "right",
                  borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
                  borderRight: `1px solid ${RECEIPT_THEME.gridLine}`,
                  fontFamily: "var(--font-receipt-mono), monospace",
                  fontSize: 9,
                }}
              >
                {formatCurrency(item.unitPrice)}
              </td>
              <td
                style={{
                  padding: "7px 6px",
                  textAlign: "right",
                  borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
                  fontFamily: "var(--font-receipt-mono), monospace",
                  fontWeight: 600,
                  fontSize: 9,
                }}
              >
                {formatCurrency(calculateItemTotal(item))}
              </td>
            </tr>
          ))}
          {Array.from({ length: emptyRowCount }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td
                style={{
                  padding: "7px 6px",
                  borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
                  borderRight: `1px solid ${RECEIPT_THEME.gridLine}`,
                  height: 28,
                }}
              />
              <td
                style={{
                  borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
                  borderRight: `1px solid ${RECEIPT_THEME.gridLine}`,
                }}
              />
              <td
                style={{
                  borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
                  borderRight: `1px solid ${RECEIPT_THEME.gridLine}`,
                }}
              />
              <td
                style={{
                  borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
                  borderRight: `1px solid ${RECEIPT_THEME.gridLine}`,
                }}
              />
              <td
                style={{
                  borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
                }}
              />
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <div style={{ width: 160, fontSize: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
            }}
          >
            <span style={{ color: RECEIPT_THEME.inkMuted }}>Subtotal</span>
            <span style={{ fontFamily: "var(--font-receipt-mono), monospace" }}>
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0 2px",
              fontWeight: 700,
              fontSize: 12,
              color: RECEIPT_THEME.blue,
            }}
          >
            <span>TOTAL</span>
            <span style={{ fontFamily: "var(--font-receipt-mono), monospace" }}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `2px double ${RECEIPT_THEME.blueLine}`,
          paddingTop: 12,
        }}
      >
        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            fontStyle: "italic",
            color: RECEIPT_THEME.ink,
            marginBottom: 10,
          }}
        >
          Thank you for shopping with us
        </p>

        <div
          style={{
            fontSize: 9,
            color: RECEIPT_THEME.inkMuted,
            lineHeight: 1.7,
            textAlign: "center",
          }}
        >
          {business.whatsapp && (
            <div>
              <strong style={{ color: RECEIPT_THEME.blue }}>WhatsApp:</strong>{" "}
              {business.whatsapp}
            </div>
          )}
          {business.phone && (
            <div>
              <strong style={{ color: RECEIPT_THEME.blue }}>Phone:</strong>{" "}
              {business.phone}
            </div>
          )}
          {business.tiktok && (
            <div>
              <strong style={{ color: RECEIPT_THEME.blue }}>TikTok:</strong>{" "}
              {formatSocialHandle(business.tiktok)}
            </div>
          )}
          {business.instagram && (
            <div>
              <strong style={{ color: RECEIPT_THEME.blue }}>Instagram:</strong>{" "}
              {formatSocialHandle(business.instagram)}
            </div>
          )}
          {business.address && (
            <div>
              <strong style={{ color: RECEIPT_THEME.blue }}>Location:</strong>{" "}
              {business.address}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            fontSize: 8,
            color: RECEIPT_THEME.blueLine,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          — Original Copy —
        </div>
      </div>
    </div>
  );
}
