import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isAdmin } from "../../utils/adminUtils";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts"); // posts, users, stats
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const adminStatus = await isAdmin(auth.currentUser?.uid);
      
      if (!adminStatus) {
        toast.error("Access denied! Admin only.");
        navigate("/dashboard");
        return;
      }

      // Fetch all items
      const itemsRef = collection(db, "items");
      const itemsQuery = query(itemsRef, orderBy("timestamp", "desc"));
      const itemsSnap = await getDocs(itemsQuery);
      const itemsData = itemsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsData);

      // Fetch all users
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);

      setLoading(false);
    };

    checkAdminAndFetch();
  }, [navigate]);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Delete this item permanently?")) return;

    try {
      await deleteDoc(doc(db, "items", itemId));
      setItems(items.filter((item) => item.id !== itemId));
      toast.success("Item deleted successfully!");
    } catch (error) {
      toast.error("Error deleting item: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    );
  }

  const stats = {
    totalPosts: items.length,
    lostItems: items.filter((i) => i.type === "Lost").length,
    foundItems: items.filter((i) => i.type === "Found").length,
    totalUsers: users.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-xl font-semibold text-purple-600">
          🔒 Admin Dashboard
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
        >
          Back to Dashboard
        </button>
      </nav>

      {/* Tabs */}
      <div className="flex justify-center gap-4 p-4">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-6 py-2 rounded-lg transition ${
            activeTab === "stats"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-700 hover:bg-purple-100"
          }`}
        >
          📊 Statistics
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-6 py-2 rounded-lg transition ${
            activeTab === "posts"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-700 hover:bg-purple-100"
          }`}
        >
          📝 All Posts ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-2 rounded-lg transition ${
            activeTab === "users"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-700 hover:bg-purple-100"
          }`}
        >
          👥 Users ({users.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.totalPosts}</p>
              <p className="text-gray-600 mt-2">Total Posts</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-3xl font-bold text-red-600">{stats.lostItems}</p>
              <p className="text-gray-600 mt-2">Lost Items</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-3xl font-bold text-green-600">{stats.foundItems}</p>
              <p className="text-gray-600 mt-2">Found Items</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
              <p className="text-gray-600 mt-2">Total Users</p>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-purple-100">
                <tr>
                  <th className="p-4 text-left">Image</th>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Station</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-4">{item.title}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.type === "Lost"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{item.station}</td>
                    <td className="p-4 text-sm">{item.date}</td>
                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/item/${item.id}`)}
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 text-sm hover:bg-blue-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-purple-100">
                <tr>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{user.email || "N/A"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}