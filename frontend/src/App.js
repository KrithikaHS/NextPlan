import React, { useEffect, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./components/Login";
import Onlogin from "./components/Onlogin";
import Signup from "./components/Signup";

const App = () => {
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/csrf/", { credentials: "include" })
      .then(response => response.json())
      .then(data => {
        if (data.csrfToken) {
          document.cookie = `csrftoken=${data.csrfToken}; path=/`;  
        }
      })
      .catch(error => console.error("CSRF Fetch Error:", error)); 
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex items-center justify-center h-screen rgb(243 244 246 / 0%)">
              {isLogin ? (
                <Login switchToSignup={() => setIsLogin(false)} />
              ) : (
                <Signup switchToLogin={() => setIsLogin(true)} />
              )}
            </div>
          }
        />

        <Route path="/Onlogin" element={<Onlogin />} /> 

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
