import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// Check if user is admin
export const isAdmin = async (userId) => {
  if (!userId) return false;
  
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() && userDoc.data().role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// Get user data
export const getUserData = async (userId) => {
  if (!userId) return null;
  
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};