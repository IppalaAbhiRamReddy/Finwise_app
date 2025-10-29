import React, { useEffect, useState } from "react";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../api/budgets"; // Import API functions

function Budgets() {
  const [budgets, setBudgets] = useState([]); // State for the list of budgets
  // State for the form inputs
  const [form, setForm] = useState({
    category: "",
    limit: "",
    start_date: "",
    end_date: "",
  });
  const [editingId, setEditingId] = useState(null); // State to track if we are editing
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to fetch budgets from the API
  const fetchBudgets = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await getBudgets();
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load budgets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch budgets when the component mounts
  useEffect(() => {
    fetchBudgets();
  }, []);

  // Update form state when input fields change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        // If editingId is set, update existing budget
        await updateBudget(editingId, form);
        setEditingId(null); // Exit editing mode
      } else {
        // Otherwise, create a new budget
        await createBudget(form);
      }
      // Reset form and refresh the budget list
      setForm({ category: "", limit: "", start_date: "", end_date: "" });
      fetchBudgets();
    } catch (err) {
      console.error(err);
      setError("Failed to save budget. Check inputs or try again.");
    }
  };

  // Set up the form for editing when Edit button is clicked
  const handleEdit = (budget) => {
    setEditingId(budget.id);
    // Pre-fill the form with the budget's data
    setForm({
      category: budget.category,
      limit: budget.limit,
      start_date: budget.start_date,
      end_date: budget.end_date,
    });
  };

  // Handle budget deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    setError("");
    try {
      await deleteBudget(id);
      fetchBudgets(); // Refresh the list
    } catch (err) {
      console.error(err);
      setError("Failed to delete budget.");
    }
  };

  // Function to clear the form and exit editing mode
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ category: "", limit: "", start_date: "", end_date: "" });
  };

  return (
    <div className="budgets-page crud-page">
      <h2>Budgets</h2>
      {error && <p className="error-message">{error}</p>}

      {/* Form for Adding/Editing Budgets */}
      <form onSubmit={handleSubmit} className="crud-form budget-form">
        <h3>{editingId ? "Edit Budget" : "Add New Budget"}</h3>
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category (e.g., Groceries)"
          required
        />
        <input
          name="limit"
          value={form.limit}
          onChange={handleChange}
          placeholder="Limit (e.g., 5000)"
          type="number"
          step="0.01"
          required
        />
        <label>
          Start Date:{" "}
          <input
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            type="date"
            required
          />
        </label>
        <label>
          End Date:{" "}
          <input
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            type="date"
            required
          />
        </label>
        <div className="form-actions">
          <button type="submit">
            {editingId ? "Update Budget" : "Add Budget"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table to Display Budgets */}
      <h3>Existing Budgets</h3>
      {isLoading ? (
        <p>Loading budgets...</p>
      ) : (
        <table className="crud-table budget-table">
          <thead>
            <tr>
              {/* Add User column header */}
              <th>User</th>
              <th>Category</th>
              <th>Limit</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => (
              <tr key={b.id}>
                {/* Add cell to display username */}
                <td>{b.username}</td>
                <td>{b.category}</td>
                <td>₹{b.limit}</td>
                <td>{b.start_date}</td>
                <td>{b.end_date}</td>
                <td className="actions-cell">
                  <button onClick={() => handleEdit(b)}>Edit</button>
                  <button onClick={() => handleDelete(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {/* Update colspan if no budgets */}
            {budgets.length === 0 && (
              <tr>
                <td colSpan="6">No budgets created yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Budgets;
