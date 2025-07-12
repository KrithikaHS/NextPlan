import axios from "axios";
import React, { useState } from "react";
import "./Onlogin.css";

const Signup = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register/", formData);
      alert("Signup Successful! Please log in.");
      switchToLogin();
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.username) {
          setError(error.response.data.username[0]); 
        } else if (error.response.data.password) {
          setError(error.response.data.password[0]); 
        } else if (error.response.data.email) {
          setError(error.response.data.email[0]); 
        }else {
          setError("Signup failed. Please try again.");
        }
      }
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center h-screen rgb(243 244 246 / 0%)">
      <div className="login">
        <h2 >Create Account ✨</h2>
        <p>Sign up to get started</p>
        
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have an account?{" "}
          <span onClick={switchToLogin} className="backto">
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;