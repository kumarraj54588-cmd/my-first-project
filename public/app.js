const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const listEl = document.getElementById('transaction-list');
const formEl = document.getElementById('transaction-form');

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

async function fetchTransactions() {
  const response = await fetch('/api/transactions');
  if (!response.ok) {
    throw new Error('Failed to load transactions.');
  }
  return response.json();
}

async function fetchSummary() {
  const response = await fetch('/api/summary');
  if (!response.ok) {
    throw new Error('Failed to load summary.');
  }
  return response.json();
}

function renderSummary(summary) {
  balanceEl.textContent = formatter.format(summary.balance);
  incomeEl.textContent = formatter.format(summary.income);
  expenseEl.textContent = formatter.format(summary.expense);
}

function transactionTemplate(transaction) {
  const sign = transaction.type === 'income' ? '+' : '-';
  const created = new Date(transaction.createdAt).toLocaleString();

  return `
    <li class="transaction-item">
      <div>
        <strong>${transaction.description}</strong>
        <div class="meta">${created}</div>
      </div>
      <span class="amount ${transaction.type}">${sign}${formatter.format(transaction.amount)}</span>
      <button data-id="${transaction.id}">Delete</button>
    </li>
  `;
}

function renderTransactions(transactions) {
  if (!transactions.length) {
    listEl.innerHTML = '<li class="empty">No transactions yet.</li>';
    return;
  }

  listEl.innerHTML = transactions.map(transactionTemplate).join('');
}

async function refreshUI() {
  const [transactions, summary] = await Promise.all([
    fetchTransactions(),
    fetchSummary()
  ]);
  renderTransactions(transactions);
  renderSummary(summary);
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    type: document.getElementById('type').value,
    description: document.getElementById('description').value,
    amount: Number(document.getElementById('amount').value)
  };

  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    alert(error.message || 'Unable to save transaction.');
    return;
  }

  formEl.reset();
  await refreshUI();
});

listEl.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) {
    return;
  }

  const id = button.dataset.id;
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    alert('Unable to delete transaction.');
    return;
  }

  await refreshUI();
});

refreshUI().catch((error) => {
  console.error(error);
  listEl.innerHTML = '<li class="empty">Failed to load data.</li>';
});
