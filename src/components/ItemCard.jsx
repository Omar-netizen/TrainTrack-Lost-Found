import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ItemCard({ item }) {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Convert Google Drive URL to embeddable format
  const getDriveImageUrl = (link) => {
    if (!link) return "";
    
    link = link.trim();
    
    // Pattern 1: https://drive.google.com/file/d/FILE_ID/view
    let match = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
    
    // Pattern 2: https://drive.google.com/open?id=FILE_ID
    match = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
    
    // Pattern 3: Already converted or just file ID
    if (link.includes('uc?export=view')) {
      match = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
      }
    }
    
    if (/^[a-zA-Z0-9_-]{25,}$/.test(link)) {
      return `https://drive.google.com/thumbnail?id=${link}&sz=w1000`;
    }
    
    return link;
  };

  const displayUrl = getDriveImageUrl(item.photoUrl);

  const handleCardClick = () => {
    navigate(`/item/${item.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer"
    >
      {!imageError ? (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <img
            src={displayUrl}
            alt={item.title}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-2"
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
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
      <div className="p-4">
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
          <span className="text-gray-400 text-sm">
            {item.date || "No date"}
          </span>
        </div>
        <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {item.description}
        </p>
        <p className="text-indigo-600 text-sm mt-2 font-medium">
          📍 {item.station || "Unknown Station"}
        </p>
        {item.trainNumber && (
          <p className="text-gray-500 text-xs mt-1">
            🚆 Train: {item.trainNumber}
          </p>
        )}
      </div>
    </div>
  );
}
