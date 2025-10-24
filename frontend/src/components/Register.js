import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    income: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- START FIX ---
    // Create a new object for the data we're sending
    const dataToSend = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    // Only add phone and income to the request if they are not empty
    if (formData.phone) {
      dataToSend.phone = formData.phone;
    }
    if (formData.income) {
      dataToSend.income = formData.income;
    }
    // --- END FIX ---

    try {
      // Send the cleaned 'dataToSend' object
      await api.post("register/", dataToSend);

      alert("Registration successful! You can now log in.");
      // (You can add 'navigate("/login")' here if you did the pro upgrade)
    } catch (err) {
      // This will show you the *exact* error from Django in your browser console
      console.error(err.response.data);

      if (err.response.data.username) {
        alert("Error: " + err.response.data.username[0]);
      } else if (err.response.data.email) {
        alert("Error: " + err.response.data.email[0]);
      } else {
        alert("Error during registration!");
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {["username", "email", "password", "phone", "income"].map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : "text"}
            name={field}
            placeholder={field}
            value={formData[field]}
            onChange={handleChange}
            required={["username", "email", "password"].includes(field)}
          />
        ))}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
