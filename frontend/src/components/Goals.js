import React, { useEffect, useState } from "react";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../api/goals"; // Import API functions

function Goals() {
  const [goals, setGoals] = useState([]); // State for the list of goals
  // State for the form inputs
  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    saved_amount: "",
    deadline: "",
  });
  const [editingId, setEditingId] = useState(null); // State to track if editing
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to fetch goals
  const fetchGoals = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await getGoals();
      setGoals(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load goals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  // Update form state on input change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Prepare data, ensuring saved_amount defaults to 0 if empty
    const payload = {
      ...form,
      saved_amount: form.saved_amount || "0.00",
    };
    try {
      if (editingId) {
        // Update existing goal
        await updateGoal(editingId, payload);
        setEditingId(null);
      } else {
        // Create new goal
        await createGoal(payload);
      }
      // Reset form and refresh list
      setForm({ name: "", target_amount: "", saved_amount: "", deadline: "" });
      fetchGoals();
    } catch (err) {
      console.error(err);
      setError("Failed to save goal. Check inputs or try again.");
    }
  };

  // Set up form for editing
  const handleEdit = (goal) => {
    setEditingId(goal.id);
    // Pre-fill form (make sure deadline format matches input type="date")
    setForm({
      name: goal.name,
      target_amount: goal.target_amount,
      saved_amount: goal.saved_amount,
      deadline: goal.deadline,
    });
  };

  // Handle goal deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    setError("");
    try {
      await deleteGoal(id);
      fetchGoals(); // Refresh list
    } catch (err) {
      console.error(err);
      setError("Failed to delete goal.");
    }
  };

  // Cancel editing mode
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", target_amount: "", saved_amount: "", deadline: "" });
  };

  return (
    <div className="goals-page crud-page">
      <h2>Financial Goals</h2>
      {error && <p className="error-message">{error}</p>}

      {/* Form for Adding/Editing Goals */}
      <form onSubmit={handleSubmit} className="crud-form goal-form">
        <h3>{editingId ? "Edit Goal" : "Add New Goal"}</h3>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Goal Name (e.g., Vacation Fund)"
          required
        />
        <input
          name="target_amount"
          value={form.target_amount}
          onChange={handleChange}
          placeholder="Target Amount (e.g., 50000)"
          type="number"
          step="0.01"
          required
        />
        <input
          name="saved_amount"
          value={form.saved_amount}
          onChange={handleChange}
          placeholder="Amount Saved So Far (e.g., 5000)"
          type="number"
          step="0.01"
        />
        <label>
          Deadline:{" "}
          <input
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            type="date"
            required
          />
        </label>
        <div className="form-actions">
          <button type="submit">
            {editingId ? "Update Goal" : "Add Goal"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table to Display Goals */}
      <h3>Existing Goals</h3>
      {isLoading ? (
        <p>Loading goals...</p>
      ) : (
        <table className="crud-table goal-table">
          <thead>
            <tr>
              {/* Add User column header */}
              <th>User</th>
              <th>Name</th>
              <th>Target</th>
              <th>Saved</th>
              <th>Deadline</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => (
              <tr key={g.id}>
                {/* Add cell to display username */}
                <td>{g.username}</td>
                <td>{g.name}</td>
                <td>₹{g.target_amount}</td>
                <td>₹{g.saved_amount}</td>
                <td>{g.deadline}</td>
                <td>{g.progress}%</td>
                <td className="actions-cell">
                  <button onClick={() => handleEdit(g)}>Edit</button>
                  <button onClick={() => handleDelete(g.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {/* Update colspan if no goals */}
            {goals.length === 0 && (
              <tr>
                <td colSpan="7">No goals created yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Goals;
