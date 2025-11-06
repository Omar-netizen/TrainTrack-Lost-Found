import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ItemCard from "./ItemCard";
import { toast } from "react-toastify";
import { isAdmin } from "../utils/adminUtils";

// Enhanced Helper for Drive links
const getDriveImageUrl = (link) => {
  if (!link) return "";
  
  link = link.trim();
  
  // Pattern 1: /file/d/FILE_ID/view
  let match = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  
  // Pattern 2: ?id=FILE_ID
  match = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  
  // Pattern 3: Just file ID
  if (/^[a-zA-Z0-9_-]{25,}$/.test(link)) {
    return `https://drive.google.com/thumbnail?id=${link}&sz=w1000`;
  }
  
  return link;
};

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await isAdmin(auth.currentUser?.uid);
      setIsUserAdmin(adminStatus);
    };
    checkAdmin();
  }, []);

  // Fetch all items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsRef = collection(db, "items");
        const q = query(itemsRef, orderBy("timestamp", "desc"));
        const querySnap = await getDocs(q);

        const data = querySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          photoUrl: getDriveImageUrl(doc.data().photoUrl), // Normalize Drive URLs
        }));

        setItems(data);
      } catch (error) {
        toast.error("Error fetching items: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Filter + search logic
  const filteredItems = items.filter((item) => {
    const matchesType =
      filter === "All" ||
      item.type === filter ||
      (filter === "MyPosts" && item.postedBy === auth.currentUser?.uid);
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-white shadow">
        <h1
          className="text-xl font-semibold text-indigo-600 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          TrainTrack
        </h1>
        <div className="flex gap-3">
          {isUserAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
            >
              🔒 Admin
            </button>
          )}
          <button
            onClick={() => navigate("/messages")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            💬 Messages
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
          >
            👤 Profile
          </button>
          <button
            onClick={() => navigate("/post")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            + New Post
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Filters + Search */}
      <div className="p-4 flex flex-wrap gap-3 justify-center">
        <select
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded-md focus:ring-2 focus:ring-indigo-400"
        >
          <option value="All">All Items</option>
          <option value="Lost">Lost Items</option>
          <option value="Found">Found Items</option>
          <option value="MyPosts">My Posts</option>
        </select>
        <input
          type="text"
          placeholder="Search by title or description..."
          className="p-2 border rounded-md w-60 focus:ring-2 focus:ring-indigo-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Item Feed */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-center col-span-full text-gray-500">
            Loading items...
          </p>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => <ItemCard key={item.id} item={item} />)
        ) : (
          <p className="text-center col-span-full text-gray-500">
            No items found.
          </p>
        )}
      </div>
    </div>
  );
}