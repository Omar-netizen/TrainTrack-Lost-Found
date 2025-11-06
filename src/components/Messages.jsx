import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("received"); // received or sent
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where(filter === "received" ? "receiverId" : "senderId", "==", auth.currentUser?.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      const data = querySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
    } catch (error) {
      toast.error("Error fetching messages: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await updateDoc(doc(db, "messages", messageId), { read: true });
      setMessages(
        messages.map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const unreadCount = messages.filter((msg) => !msg.read && filter === "received").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-xl font-semibold text-indigo-600">
          💬 Messages {unreadCount > 0 && `(${unreadCount} new)`}
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
        >
          Back to Dashboard
        </button>
      </nav>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-4 p-4">
        <button
          onClick={() => setFilter("received")}
          className={`px-6 py-2 rounded-lg transition ${
            filter === "received"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 hover:bg-indigo-100"
          }`}
        >
          📥 Received
        </button>
        <button
          onClick={() => setFilter("sent")}
          className={`px-6 py-2 rounded-lg transition ${
            filter === "sent"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 hover:bg-indigo-100"
          }`}
        >
          📤 Sent
        </button>
      </div>

      {/* Messages List */}
      <div className="p-6 max-w-4xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white rounded-lg shadow p-4 ${
                  !msg.read && filter === "received" ? "border-l-4 border-indigo-600" : ""
                }`}
                onClick={() => {
                  if (!msg.read && filter === "received") markAsRead(msg.id);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-600">
                      {filter === "received" ? "From" : "To"}: {" "}
                      <span className="font-semibold">
                        {filter === "received" ? msg.senderEmail : "Item Owner"}
                      </span>
                    </p>
                    <p
                      className="text-sm text-indigo-600 cursor-pointer hover:underline"
                      onClick={() => navigate(`/item/${msg.itemId}`)}
                    >
                      Re: {msg.itemTitle}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {msg.timestamp
                      ? new Date(msg.timestamp.seconds * 1000).toLocaleDateString()
                      : "Just now"}
                  </span>
                </div>
                <p className="text-gray-800 mt-2">{msg.message}</p>
                {!msg.read && filter === "received" && (
                  <span className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    NEW
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            {filter === "received" ? "No messages received yet." : "No messages sent yet."}
          </p>
        )}
      </div>
    </div>
  );
}