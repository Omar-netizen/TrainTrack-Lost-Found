import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, getDocs, query, orderBy, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { findSimilarItems } from "../utils/imageEmbeddings";
import ContactModal from "./ContactModal";

// Enhanced Drive helper
const getDriveImageUrl = (link) => {
  if (!link) return "";
  
  link = link.trim();
  
  let match = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  
  match = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  
  if (/^[a-zA-Z0-9_-]{25,}$/.test(link)) {
    return `https://drive.google.com/thumbnail?id=${link}&sz=w1000`;
  }
  
  return link;
};

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false); // NEW: Modal state
  const [ownerEmail, setOwnerEmail] = useState(null); // NEW: Store owner's email
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItemAndMatches = async () => {
      try {
        // Fetch current item
        const docRef = doc(db, "items", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const currentItem = { id: docSnap.id, ...docSnap.data() };
          setItem(currentItem);

          // NEW: Fetch owner's email from users collection
          try {
            const ownerDoc = await getDoc(doc(db, "users", currentItem.postedBy));
            if (ownerDoc.exists()) {
              setOwnerEmail(ownerDoc.data().email);
            }
          } catch (error) {
            console.error("Error fetching owner email:", error);
          }

          // Find similar items
          if (currentItem.imageEmbedding && currentItem.imageEmbedding.length > 0) {
            setLoadingSimilar(true);
            
            try {
              // Fetch all items from opposite type
              const itemsRef = collection(db, "items");
              const q = query(itemsRef, orderBy("timestamp", "desc"));
              const querySnap = await getDocs(q);
              
              const allItems = querySnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              // Filter: show opposite type items (Lost → Found matches, Found → Lost matches)
              const oppositeTypeItems = allItems.filter(
                (item) => item.type !== currentItem.type && item.id !== id
              );

              // Find similar items
              const matches = findSimilarItems(
                currentItem.imageEmbedding,
                oppositeTypeItems
              );

              setSimilarItems(matches);
            } catch (error) {
              console.error("Error finding similar items:", error);
            } finally {
              setLoadingSimilar(false);
            }
          }
        } else {
          toast.error("Item not found");
          navigate("/dashboard");
        }
      } catch (error) {
        toast.error("Error fetching item details");
        navigate("/dashboard");
      }
    };

    fetchItemAndMatches();
  }, [id, navigate]);

  if (!item) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-500">
        Loading item details...
      </div>
    );
  }

  const imageUrl = getDriveImageUrl(item.photoUrl);
  const isMyPost = auth.currentUser?.uid === item.postedBy;

  const handleMarkResolved = async () => {
    if (!window.confirm("Mark this item as resolved?")) return;

    try {
      await updateDoc(doc(db, "items", id), {
        status: "resolved",
      });
      setItem({ ...item, status: "resolved" });
      toast.success("✅ Item marked as resolved!");
    } catch (error) {
      toast.error("Error updating status: " + error.message);
    }
  };

  // NEW: Function to handle email button click
const handleEmailOwner = () => {
  // Use posterEmail from item directly instead of state
  const emailToUse = item.posterEmail || ownerEmail;
  
  if (!emailToUse) {
    toast.error("Owner's email is not available. Please use the 💬 Send Message option instead.");
    return;
  }
  
  const subject = `Regarding ${item.type} Item: ${item.title}`;
  const body = `Hi,\n\nI saw your ${item.type.toLowerCase()} item post:\n\nTitle: ${item.title}\nStation: ${item.station}\nDate: ${item.date}\n\nI would like to contact you about this item.\n\nThank you!`;
  
  window.location.href = `mailto:${emailToUse}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
      >
        ← Back
      </button>

      <div className="bg-white max-w-3xl mx-auto shadow-lg rounded-xl overflow-hidden">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-96 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">Image unavailable</p>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.type === "Lost"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {item.type}
            </span>
            <span className="text-gray-400 text-sm">{item.date || "No date"}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            {item.title}
          </h1>
          <p className="text-gray-600 mb-4">{item.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
            <p>
              <strong>Category:</strong> {item.category}
            </p>
            <p>
              <strong>Station:</strong> {item.station}
            </p>
            <p>
              <strong>Train Number:</strong> {item.trainNumber}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`capitalize ${item.status === "resolved" ? "text-green-600 font-semibold" : ""}`}>
                {item.status || "Active"}
              </span>
            </p>
          </div>

          {isMyPost && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              ℹ️ This is your post
              {item.status !== "resolved" && (
                <button
                  onClick={handleMarkResolved}
                  className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  ✅ Mark as Resolved
                </button>
              )}
            </div>
          )}

          {/* MODIFIED: Two buttons - In-app message and Email */}
          {!isMyPost && (
            <div className="mt-6 flex justify-center gap-4">
              {/* In-app messaging button */}
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition"
              >
                💬 Send Message
              </button>
              
              {/* Email button - opens user's email client */}
              <button
                onClick={handleEmailOwner}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
              >
                📧 Email Owner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🔍 AI Similar Items Section */}
      {similarItems.length > 0 && (
        <div className="max-w-3xl mx-auto mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🔍 Possible Matches
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similarItems.map((match) => (
              <div
                key={match.id}
                onClick={() => navigate(`/item/${match.id}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={getDriveImageUrl(match.photoUrl)}
                    alt={match.title}
                    className="w-full h-40 object-cover"
                  />
                  {/* Similarity Badge */}
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {match.similarity}% Match
                  </div>
                </div>
                
                <div className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium inline-block mb-2 ${
                      match.type === "Lost"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {match.type}
                  </span>
                  
                  <h3 className="font-semibold text-sm text-gray-800 truncate">
                    {match.title}
                  </h3>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {match.station}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingSimilar && (
        <div className="max-w-3xl mx-auto mt-8 text-center">
          <p className="text-gray-500">🔍 Finding similar items...</p>
        </div>
      )}

      {similarItems.length === 0 && !loadingSimilar && item.imageEmbedding && (
        <div className="max-w-3xl mx-auto mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-yellow-700">
          ℹ️ No similar items found yet. Check back later as more items are posted!
        </div>
      )}

      {/* Render ContactModal when isContactModalOpen is true */}
      {isContactModalOpen && (
        <ContactModal
          item={item}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </div>
  );
}