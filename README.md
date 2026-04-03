# Expense Tracker App

A full-stack expense tracker built with:

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **Storage:** Local JSON file (`data/transactions.json`)

## Features

- Add income and expense transactions
- Show total balance, income, and expenses in a dashboard
- Persist data in JSON storage
- REST API endpoints for CRUD operations
- Clean and responsive UI

## Run locally

```bash
npm install
npm start
```

Open: `http://localhost:3000`

## API Endpoints

- `GET /api/transactions` - List all transactions
- `GET /api/transactions/:id` - Get one transaction
- `POST /api/transactions` - Create a transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction
- `GET /api/summary` - Get income, expense, and balance totals

### Create/Update payload

```json
{
  "type": "income",
  "description": "Salary",
  "amount": 2500
}
```
