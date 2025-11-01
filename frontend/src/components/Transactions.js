import React, { useEffect, useState, useMemo } from 'react';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactions';
import { getUserData } from '../utils/auth'; // from Day 7

// Get today's date in YYYY-MM-DD format for the form default
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ 
    title: '', 
    amount: '', 
    type: 'expense',
    category: '', 
    date: getTodayDate() 
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const userData = useMemo(() => getUserData(), []); // Get user data once

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchTransactions(); 
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateTransaction(editingId, form);
        setEditingId(null);
      } else {
        await createTransaction(form);
      }
      setForm({ title: '', amount: '', type: 'expense', category: '', date: getTodayDate() });
      fetchTransactions();
    } catch (err) {
      console.error(err.response?.data || err.message);
      // Show specific backend error if available
      const errMsg =
        err.response?.data?.amount ||
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to save transaction.';
      setError(errMsg);
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setForm({ title: tx.title, amount: tx.amount, type: tx.type, category: tx.category, date: tx.date });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    setError('');
    try {
      await deleteTransaction(id);
      fetchTransactions();
    } catch (err) {
      console.error(err);
      setError('Failed to delete transaction.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', amount: '', type: 'expense', category: '', date: getTodayDate() });
  };

  return (
    <div className="transactions-page crud-page">
      <h2>Transactions</h2>
      {error && <p className="error-message">{error}</p>}

      {/* Form for Adding/Editing Transactions */}
      <form onSubmit={handleSubmit} className="crud-form transaction-form">
        <h3>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</h3>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title (e.g., Coffee)" required />
        <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount (e.g., 150.50)" type="number" step="0.01" required />
        <select name="type" value={form.type} onChange={handleChange} required>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category (e.g., Food)" required />
        <label>
          Date: 
          <input name="date" value={form.date} onChange={handleChange} type="date" required />
        </label>

        <div className="form-actions">
          <button type="submit">{editingId ? 'Update' : 'Add'} Transaction</button>
          {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      {/* Table to Display Transactions */}
      <h3>Your Transactions</h3>
      {isLoading ? <p>Loading transactions...</p> : (
        <table className="crud-table transaction-table">
          <thead>
            <tr>
              {userData?.role === 'admin' && <th>User</th>}
              <th>Title</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className={t.type === 'income' ? 'income-row' : 'expense-row'}>
                {userData?.role === 'admin' && <td>{t.username}</td>}
                <td>{t.title}</td>
                <td>₹{t.amount}</td>
                <td>{t.type}</td>
                <td>{t.category}</td>
                <td>{t.date}</td>
                <td className="actions-cell">
                  <button onClick={() => handleEdit(t)}>Edit</button>
                  <button onClick={() => handleDelete(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan={userData?.role === 'admin' ? 7 : 6}>No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Transactions;
