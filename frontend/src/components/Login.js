import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Onlogin.css";


const Login = ({ switchToSignup }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { access, refresh, user } = response.data;

      if (!access || !user?.username) {
        throw new Error("Invalid login response.");
      }

      const userInfoResponse = await axios.get("http://127.0.0.1:8000/api/user/me/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const userInfo = userInfoResponse.data;

      if (!userInfo?.id) {
        throw new Error("User ID not found in profile response.");
      }

      const fullUser = {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        access,
        refresh,
      };

      localStorage.setItem("user", JSON.stringify(fullUser));
      console.log("Login successful:", fullUser);

      navigate("/Onlogin");

    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login">
      <h2 className="loginhead">Welcome Back 👋</h2>
      <p>Please login to continue</p>

      {error && <p className="text-red-500 text-center mb-2">{error}</p>}

      <input
        className="border p-2 w-full mb-3 rounded"
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <input
        className="border p-2 w-full mb-3 rounded"
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <button
        className={`bg-blue-500 text-white p-2 w-full rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="mt-3 text-sm text-center">
        Don't have an account?{" "}
        <span className="backto" onClick={switchToSignup}>
          Sign Up
        </span>
      </p>
    </form>
  );
};

export default Login;
