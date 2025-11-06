import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function UserProfile() {
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const itemsRef = collection(db, "items");
        const q = query(
          itemsRef,
          where("postedBy", "==", auth.currentUser?.uid)
        );
        const querySnap = await getDocs(q);
        const data = querySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort manually in JavaScript instead
        data.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });
        
        setMyItems(data);
      } catch (error) {
        toast.error("Error fetching your posts: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, []);

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this post permanently?")) return;

    try {
      await deleteDoc(doc(db, "items", itemId));
      setMyItems(myItems.filter((item) => item.id !== itemId));
      toast.success("Post deleted successfully!");
    } catch (error) {
      toast.error("Error deleting post: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-xl font-semibold text-indigo-600">
          My Profile
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
        >
          Back to Dashboard
        </button>
      </nav>

      <div className="p-6 max-w-5xl mx-auto">
        {/* User Info */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            👤 {auth.currentUser?.email}
          </h2>
          <p className="text-gray-600">
            Total Posts: <span className="font-semibold">{myItems.length}</span>
          </p>
        </div>

        {/* My Posts */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">My Posts</h3>

          {loading ? (
            <p className="text-gray-500 text-center">Loading your posts...</p>
          ) : myItems.length > 0 ? (
            <div className="space-y-4">
              {myItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <img
                    src={item.photoUrl}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === "Lost"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status === "resolved" ? "✅ Resolved" : "🔄 Active"}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {item.station} • 🚆 {item.trainNumber} • 📅 {item.date}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/item/${item.id}`)}
                      className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              You haven't posted any items yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}