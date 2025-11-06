import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export default function ContactModal({ item, onClose }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);
    try {
      // Get sender's details
      const senderDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const senderData = senderDoc.data();

      // Create message document in Firestore
      await addDoc(collection(db, "messages"), {
        itemId: item.id,
        itemTitle: item.title,
        senderId: auth.currentUser.uid,
        senderEmail: senderData?.email || auth.currentUser.email,
        receiverId: item.postedBy,
        message: message.trim(),
        read: false,
        timestamp: serverTimestamp(),
      });

      toast.success("✉️ Message sent successfully!");
      setMessage("");
      onClose(); // Close modal after sending
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    // Modal backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Close when clicking outside
    >
      {/* Modal content */}
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Contact Item Owner</h2>
            <p className="text-sm text-gray-600 mt-1">About: {item.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I think I found your item..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
              rows="6"
              required
            />
          </div>

          {/* Item Info */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p className="text-gray-600">
              <strong>Item:</strong> {item.title}
            </p>
            <p className="text-gray-600">
              <strong>Station:</strong> {item.station}
            </p>
            <p className="text-gray-600">
              <strong>Type:</strong>{" "}
              <span
                className={`${
                  item.type === "Lost" ? "text-red-600" : "text-green-600"
                } font-semibold`}
              >
                {item.type}
              </span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg transition"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className={`flex-1 text-white py-3 rounded-lg transition ${
                sending
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {sending ? "Sending..." : "📧 Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}