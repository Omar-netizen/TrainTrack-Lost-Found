import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PostItem from "./components/PostItem";
import ItemDetails from "./components/ItemDetails";
import AdminDashboard from "./components/Admin/AdminDashboard";
import UserProfile from "./components/UserProfile";
import Messages from "./components/Messages";
import { AuthProvider } from './contexts/AuthContext';


function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
  path="/post"
  element={
    <PrivateRoute>
      <PostItem />
    </PrivateRoute>
  }
/>
         
<Route
  path="/item/:id"
  element={
    <PrivateRoute>
      <ItemDetails />
    </PrivateRoute>
  }
/>
<Route
 path="/admin" 
 element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
<Route
  path="/profile"
  element={
    <PrivateRoute>
      <UserProfile />
    </PrivateRoute>
  }
/>
<Route
  path="/messages"
  element={
    <PrivateRoute>
      <Messages />
    </PrivateRoute>
  }
/> 

      </Routes>

      {/* Toast container should be outside Routes */}
      <ToastContainer position="top-center" autoClose={2500} />
    </Router>
    </AuthProvider>
  );
}

export default App;
