import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Set session persistence for independent tab sessions
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("✅ Logged in successfully!");
      // Navigation happens automatically
    } catch (error) {
      toast.error("⚠️ " + error.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      // Set session persistence for independent tab sessions
      await setPersistence(auth, browserSessionPersistence);
      await signInWithPopup(auth, provider);
      toast.success("✅ Logged in with Google!");
      // Navigation happens automatically
    } catch (error) {
      toast.error("⚠️ " + error.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back">
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-3 rounded-lg transition ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 border py-3 rounded-lg transition ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
