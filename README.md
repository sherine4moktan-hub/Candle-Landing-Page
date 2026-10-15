# Arinz Candles — Cash on Delivery funnel

A production-oriented Next.js App Router funnel for the Arinz Sandalwood Scented Candle. It includes the product landing page, region-aware checkout, server-side order validation, Google Sheets storage, two HTML email notifications, and the thank-you page.

## Tech stack and order flow

- Next.js App Router + TypeScript
- Tailwind CSS
- Google Sheets API via a Google service account
- Nodemailer with Gmail SMTP (or another compatible SMTP provider)
- Zod validation on the server

The landing page passes only the selected quantity and delivery region to `/checkout`. The checkout displays the product and totals automatically. When submitted, `/api/order` validates the customer fields and recalculates all prices from server-owned product settings. It then appends the order to Google Sheets, emails the business, emails the customer, and returns the order summary. The browser redirects to `/thank-you` only after all required steps succeed.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add the credentials described below.
3. Run `npm run dev` and open `http://localhost:3000`.
4. Run `npm run build` before deployment.

Until Google and SMTP credentials are configured, the storefront and validation work normally, but a valid order intentionally returns a clear error instead of pretending that it was saved.

## Google Spreadsheet setup

1. Create a Google Spreadsheet and name the order tab `Orders` (or any name you put in `GOOGLE_SHEET_TAB_NAME`).
2. Add these exact headers in row 1, columns A–M:

   ```text
   Order ID | Date & Time | Customer Name | Phone Number | Email Address | Exact Location | Product Name | Quantity | Price Per Piece | Total Price | Payment Method | Order Status | Notes
   ```

3. Freeze row 1: **View → Freeze → 1 row**.
4. Add a filter: select row 1, then **Data → Create a filter**.
5. Add the order-status dropdown: select column L from row 2 downward, choose **Data → Data validation → Dropdown**, then add:
   - New Order
   - Order Confirmed
   - Order Ongoing
   - Delivered
   - Cancelled
6. Create or select a Google Cloud project. Enable the **Google Sheets API**.
7. Create a service account under **IAM & Admin → Service Accounts**, then create and download a JSON key.
8. Copy `client_email` to `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
9. Copy `private_key` to `GOOGLE_PRIVATE_KEY`, retaining `\n` line breaks as shown in `.env.example`.
10. Find the Sheet ID between `/d/` and `/edit` in the spreadsheet URL and add it as `GOOGLE_SHEET_ID`.
11. Share the spreadsheet with the service account email and grant **Editor** access.

On the first successful connection, the API also safeguards this structure automatically: it creates the configured tab if it is missing, adds the exact headers to an empty tab, freezes and styles the header row, adds filters, auto-sizes the columns, and applies the five Order Status dropdown choices. If a non-empty tab has different headers, submission stops with a server error instead of writing into the wrong columns.

## Gmail SMTP setup

1. Enable two-step verification for the Gmail account.
2. Create a Gmail App Password and use it as `SMTP_PASS`. Do not use the normal Gmail password.
3. Keep `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, and set `SMTP_USER` to the Gmail address.
4. Set `BUSINESS_EMAIL` to the inbox that receives new orders.
5. For Gmail, `EMAIL_FROM` should normally use the authenticated Gmail account, for example `Arinz Candles <sherine4moktan@gmail.com>`.

`EMAIL_SERVICE_API_KEY` is included for a future API-based provider but is not required by the current SMTP implementation.

## Required environment variables

Use `.env.example` as the complete template. Never commit `.env.local`. All Sheets IDs, service-account credentials and SMTP secrets are imported only by server-side modules.

## Test the complete submission

1. Confirm that the spreadsheet is shared with the service account.
2. Confirm the SMTP App Password and sender address.
3. Start the app with `npm run dev`.
4. Choose a quantity and delivery region on the landing page.
5. Submit the checkout form using a real email address.
6. Verify all four outcomes:
   - a new row appears in Google Sheets;
   - the business inbox receives the new-order email;
   - the customer inbox receives the order-received email;
   - the browser opens the thank-you page with the correct order details.
7. Test invalid email, phone and blank location values to confirm inline errors.

If Sheets succeeds but an email fails, the API returns an error and logs the server-side reason. The deterministic order ID and Sheets lookup prevent the same browser submission from adding a duplicate row when retried.

## Deploy to Vercel later

1. Push the project to a private Git repository.
2. Import it into Vercel as a Next.js project.
3. Add every variable from `.env.example` in **Project Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` to the final HTTPS site URL.
5. Keep private keys server-side; never prefix them with `NEXT_PUBLIC_`.
6. Deploy, place one test order, and verify Sheets plus both emails.

## Editing product details

Product name, prices, delivery fees, image paths and core description live in `lib/product.ts`. Changing prices there updates the landing page, checkout and secure server calculation together.
