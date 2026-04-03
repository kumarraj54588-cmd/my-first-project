const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'transactions.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function readTransactions() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]');
      return [];
    }
    throw error;
  }
}

async function writeTransactions(transactions) {
  await fs.writeFile(DATA_FILE, JSON.stringify(transactions, null, 2));
}

function validateTransaction(payload) {
  const { type, description, amount } = payload;

  if (!['income', 'expense'].includes(type)) {
    return 'Type must be either "income" or "expense".';
  }

  if (typeof description !== 'string' || !description.trim()) {
    return 'Description is required.';
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return 'Amount must be a positive number.';
  }

  return null;
}

app.get('/api/transactions', async (_req, res) => {
  const transactions = await readTransactions();
  res.json(transactions);
});

app.get('/api/transactions/:id', async (req, res) => {
  const transactions = await readTransactions();
  const transaction = transactions.find((item) => item.id === req.params.id);

  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found.' });
  }

  res.json(transaction);
});

app.post('/api/transactions', async (req, res) => {
  const error = validateTransaction(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const transactions = await readTransactions();
  const transaction = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: req.body.type,
    description: req.body.description.trim(),
    amount: Number(req.body.amount),
    createdAt: new Date().toISOString()
  };

  transactions.unshift(transaction);
  await writeTransactions(transactions);

  res.status(201).json(transaction);
});

app.put('/api/transactions/:id', async (req, res) => {
  const error = validateTransaction(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const transactions = await readTransactions();
  const index = transactions.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Transaction not found.' });
  }

  const updatedTransaction = {
    ...transactions[index],
    type: req.body.type,
    description: req.body.description.trim(),
    amount: Number(req.body.amount)
  };

  transactions[index] = updatedTransaction;
  await writeTransactions(transactions);

  res.json(updatedTransaction);
});

app.delete('/api/transactions/:id', async (req, res) => {
  const transactions = await readTransactions();
  const filtered = transactions.filter((item) => item.id !== req.params.id);

  if (filtered.length === transactions.length) {
    return res.status(404).json({ message: 'Transaction not found.' });
  }

  await writeTransactions(filtered);
  res.status(204).send();
});

app.get('/api/summary', async (_req, res) => {
  const transactions = await readTransactions();

  const summary = transactions.reduce(
    (acc, item) => {
      if (item.type === 'income') {
        acc.income += item.amount;
      } else {
        acc.expense += item.amount;
      }
      acc.balance = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, balance: 0 }
  );

  res.json(summary);
});

app.listen(PORT, () => {
  console.log(`Expense tracker running at http://localhost:${PORT}`);
});
