"use client";

import { formatCurrency } from "@/lib/currency";
import { calculateItemTotal } from "@/lib/receipt-calculations";
import { formatSocialHandle } from "@/lib/receipt-print-styles";
import { RECEIPT_THEME } from "@/lib/receipt-theme";
import { BUSINESS_SLOGAN } from "@/lib/constants";
import { useReceiptStore, useReceiptTotals } from "@/lib/store/receipt-store";
import {
  InstagramIcon,
  LocationIcon,
  PhoneIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/receipt-social-icons";

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function HeaderInfoLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 6,
        marginTop: 4,
        fontSize: 8.5,
        color: RECEIPT_THEME.inkMuted,
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 11,
          height: 11,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {icon}
      </span>
      <span style={{ wordBreak: "break-word", overflowWrap: "anywhere", flex: 1 }}>
        <strong style={{ color: RECEIPT_THEME.blue, fontWeight: 700 }}>
          {label}:
        </strong>{" "}
        {value}
      </span>
    </div>
  );
}

function FooterSocialLine({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div
      className="receipt-social-row"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        height: 16,
        gap: 8,
      }}
    >
      <div
        className="receipt-social-icon"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 14,
          height: 14,
          lineHeight: 0,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <span
        className="receipt-social-text"
        style={{
          display: "flex",
          alignItems: "center",
          height: 14,
          fontFamily: "var(--font-receipt-mono), monospace",
          fontSize: 9,
          color: RECEIPT_THEME.inkMuted,
          lineHeight: 1,
        }}
      >
        {text}
      </span>
    </div>
  );
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
  const emptyRowCount =
    validItems.length === 0 ? 2 : validItems.length === 1 ? 1 : 0;

  const paperStyle: React.CSSProperties = {
    fontFamily: "var(--font-receipt-serif), Georgia, serif",
    color: RECEIPT_THEME.ink,
    backgroundColor: RECEIPT_THEME.paper,
    backgroundImage: `
      radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.55) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(200,180,150,0.12) 0%, transparent 50%)
    `,
    border: `2px solid ${RECEIPT_THEME.blue}`,
    boxShadow: `
      inset 0 0 0 4px ${RECEIPT_THEME.paper},
      inset 0 0 0 5px ${RECEIPT_THEME.blueLine},
      0 4px 20px rgba(30, 77, 123, 0.12)
    `,
    padding: "20px 22px 24px",
    width: 400,
    maxWidth: "100%",
    margin: "0 auto",
    position: "relative",
    boxSizing: "border-box",
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
          gap: 10,
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
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: RECEIPT_THEME.blue,
                lineHeight: 1.3,
                textTransform: "uppercase",
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                paddingRight: 4,
              }}
            >
              {business.name || "Your Business Name"}
            </div>
            {business.address && (
              <HeaderInfoLine
                icon={<LocationIcon />}
                label="Location"
                value={business.address}
              />
            )}
            {business.phone && (
              <HeaderInfoLine
                icon={<PhoneIcon />}
                label="Tel"
                value={business.phone}
              />
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
            minWidth: 88,
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
              fontSize: 11,
              fontWeight: 600,
              color: RECEIPT_THEME.red,
              marginTop: 2,
              letterSpacing: "-0.02em",
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
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldRow label="Payment Method" value={receipt.paymentMethod} />
        </div>
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
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          <col style={{ width: "8%" }} />
          <col style={{ width: "42%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <thead>
          <tr style={{ background: RECEIPT_THEME.tableHeader, color: "#fff" }}>
            <th
              style={{
                padding: "6px 4px",
                textAlign: "center",
                fontWeight: 700,
                fontSize: 9,
                borderRight: `1px solid ${RECEIPT_THEME.blueLight}`,
              }}
            >
              No.
            </th>
            <th
              style={{
                padding: "6px 6px",
                textAlign: "left",
                fontWeight: 700,
                fontSize: 9,
                borderRight: `1px solid ${RECEIPT_THEME.blueLight}`,
              }}
            >
              Item
            </th>
            <th
              style={{
                padding: "6px 4px",
                textAlign: "center",
                fontWeight: 700,
                fontSize: 9,
                borderRight: `1px solid ${RECEIPT_THEME.blueLight}`,
              }}
            >
              Qty
            </th>
            <th
              style={{
                padding: "6px 4px",
                textAlign: "right",
                fontWeight: 700,
                fontSize: 9,
                borderRight: `1px solid ${RECEIPT_THEME.blueLight}`,
              }}
            >
              Price
            </th>
            <th
              style={{
                padding: "6px 4px",
                textAlign: "right",
                fontWeight: 700,
                fontSize: 9,
              }}
            >
              Amt
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
                  padding: "7px 6px",
                  borderBottom: `1px solid ${RECEIPT_THEME.gridLine}`,
                  borderRight: `1px solid ${RECEIPT_THEME.gridLine}`,
                  wordBreak: "break-word",
                  lineHeight: 1.35,
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
            marginBottom: 6,
          }}
        >
          Thank you for shopping with us
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: 7.5,
            fontStyle: "italic",
            color: RECEIPT_THEME.blueLine,
            marginBottom: 12,
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          {BUSINESS_SLOGAN}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            {business.whatsapp && (
              <FooterSocialLine
                icon={<WhatsAppIcon size={12} />}
                text={business.whatsapp}
              />
            )}
            {business.tiktok && (
              <FooterSocialLine
                icon={<TikTokIcon size={12} />}
                text={formatSocialHandle(business.tiktok)}
              />
            )}
            {business.instagram && (
              <FooterSocialLine
                icon={<InstagramIcon size={12} />}
                text={formatSocialHandle(business.instagram)}
              />
            )}
          </div>
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
