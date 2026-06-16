# Receity

**Receity** is a simple business management tool for small businesses. Version 1 focuses on professional receipt generation — with future support for inventory, customers, expenses, and analytics.

The name comes from **risiti**, the Swahili word for receipt. *Receity* is just the pronunciation, spelled in a way that's easy to remember and search for online.

Built for real shops — TikTok sellers, Instagram businesses, market stalls, and anyone who needs to give customers a proper receipt in seconds.

---

## Features (V1)

- **Receipt generator** with live preview
- **Business profile** — logo, name, phone, WhatsApp, location, TikTok & Instagram
- **Auto receipt numbers** — `RC-2026-0001` (year resets each January)
- **Payment method** — M-Pesa, Cash, Bank Transfer, Card
- **Item table** with automatic totals (KES)
- **Export** — Download PDF, print, or start a new receipt
- **Customer-named PDFs** — e.g. `salome receipt.pdf`
- **Vintage receipt-book design** — looks like a real paper receipt
- **Dark mode**
- **No backend** — everything saves in the browser via `localStorage`

---

## Tech Stack

- [Next.js 15+](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- [shadcn/ui](https://ui.shadcn.com)
- Zustand (state + persistence)
- jsPDF + html2canvas (PDF export)

---

## Getting Started

```bash
git clone https://github.com/ro61zzy/receity.git
cd receity
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

---

## How to Use

1. **Set up once** — Add your logo, business name, contact details, and social links. These persist automatically.
2. **Create a receipt** — Enter customer name, payment method, and items.
3. **Preview live** — The receipt on the right updates as you type.
4. **Export** — Download PDF or print. Click **New Receipt** for the next sale.

Receipt numbers increment automatically so you always have a clean paper trail.

---

## Deploy (Free)

The easiest way to put Receity online:

1. Push this repo to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Deploy — no environment variables needed for V1

Each deployment is a standalone instance. Data stays in the user's browser (localStorage), not on a server.

---

## Scaling for Other Small Businesses

Right now Receity is a **single-business, client-side app**. That's intentional for V1 — it's fast, free to run, and works offline after the first load. Here's how you can grow it:

### Option 1 — Share the app as-is (today)

**Best for:** Letting other businesses use Receity immediately with zero backend work.

- Deploy once on Vercel → share the link
- Each user opens the app in their browser
- Their business settings and receipts live in **their** browser only
- No accounts, no database, no monthly costs

**Limitation:** Data doesn't sync across devices. Clearing browser data loses saved settings.

---

### Option 2 — One deployment per business

**Best for:** Giving a few trusted businesses their own branded copy.

- Fork the repo for each business
- Customize defaults in `lib/constants.ts` (social links, slogan, business name)
- Deploy each fork to its own Vercel URL (e.g. `random-convenience.receity.app`)

**Limitation:** You maintain multiple repos or branches manually.

---

### Option 3 — Multi-tenant SaaS (next big step)

**Best for:** Many businesses signing up on one platform.

Add:

| Layer | Suggested tools |
|-------|-----------------|
| Auth | Clerk, Supabase Auth, or NextAuth |
| Database | Supabase or PlanetScale |
| File storage | Supabase Storage (logos) |
| Hosting | Vercel |

Each business gets an account. Their settings, receipt counter, and saved receipts move from `localStorage` to the database. One URL serves everyone: `receity.app`.

The current code is structured for this — Zustand store, typed models, and separate components make it straightforward to swap persistence later.

---

### Option 4 — Full product (Receity V2+)

The architecture already plans for:

- **Inventory** — products, stock, low-stock alerts
- **Customers** — history, search
- **Expenses** — tracking
- **Analytics** — daily/weekly/monthly sales, best sellers
- **Dashboard** — revenue at a glance

These become paid tiers or premium features once the receipt generator proves useful in the wild.

---

## Recommended Path

```
V1 (now)     →  Deploy & use yourself + share link
V1.5         →  Custom defaults per business (fork or env config)
V2           →  Accounts + cloud sync (Supabase)
V3           →  Inventory, customers, analytics
```

Start with **Option 1** — deploy, share, get feedback from other sellers. Build backend only when people ask for sync, multiple devices, or team access.

---

## Project Structure

```
app/           → Pages & layout
components/    → UI (BusinessInfoCard, ReceiptPreview, etc.)
lib/           → Store, PDF export, currency, receipt logic
types/         → TypeScript interfaces
hooks/         → (ready for future modules)
```

---

## License

Private project — update this section if you open-source it later.

---

## Author

Built by [@ro61zzy](https://github.com/ro61zzy) for **Random Convenience** and other small businesses that deserve proper receipts.
