This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Bulk employee import

Use the **Bulk import** card at the top of the dashboard to load large employee lists:

1. Click **Download template** to get a CSV with the required columns (`dni`, `firstName`, `lastName`, `email`, `taxStatus`, `status`, `hiredAt`).
2. Fill one row per employee. Supported values:
   - `taxStatus`: `registered`, `withholding`, `exempt`, `unknown`
   - `status`: `active`, `inactive`, `terminated`
   - `hiredAt`: ISO date or `YYYY-MM-DD`
3. Upload the CSV back through the same card and click **Import employees**.

The API validates every row, creates the valid employees, and returns row/column level errors for anything that needs fixing. The UI surfaces those errors so you can correct the original CSV and retry immediately.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
