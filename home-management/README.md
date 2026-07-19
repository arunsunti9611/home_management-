# Home Management Dashboard

A static, browser-only home management app for bills, income, investments, assessments, and loans.

## Features
- Dashboard summary cards for bills, income, balance, and completed bills.
- Monthly bills entry with planned/completed dates, repeat options, status, receipts, and remarks.
- Income source tracking and net balance calculation.
- Investment planning tab.
- Assessment planning tab.
- Loan management derived from bills marked as `Loan`.
- Data persisted in browser `localStorage`.

## Run locally
You can run this without a backend using a simple static server.

### Option 1: Using Python
1. Open a terminal in `home-management`.
2. Run:
   ```sh
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.

### Option 2: Using VS Code Live Server
1. Install the Live Server extension.
2. Open `index.html` and click "Go Live".

## Notes
- No backend is required; all data is stored in the browser.
- For production or multi-user use, add a backend API and database.
