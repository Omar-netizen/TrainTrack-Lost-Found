import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthLayout from "../layouts/AuthLayout";
import { loadModel, getImageEmbedding } from "../utils/imageEmbeddings";
import { indianRailwayStations } from "../data/stations"; // Import stations list

export default function PostItem() {
  const [type, setType] = useState("Lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [station, setStation] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  
  // NEW: Auto-fill current date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [date, setDate] = useState(getTodayDate()); // Auto-filled with today's date
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  
  // NEW: For searchable station dropdown
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [filteredStations, setFilteredStations] = useState(indianRailwayStations);

  const navigate = useNavigate();

  // Convert Drive URL to embeddable format
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

  // NEW: Handle station search/filter
  const handleStationSearch = (searchTerm) => {
    setStation(searchTerm);
    if (searchTerm.trim() === "") {
      setFilteredStations(indianRailwayStations);
    } else {
      const filtered = indianRailwayStations.filter((st) =>
        st.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStations(filtered);
    }
    setShowStationDropdown(true);
  };

  // NEW: Select station from dropdown
  const selectStation = (selectedStation) => {
    setStation(selectedStation);
    setShowStationDropdown(false);
  };

  // Load model on component mount
  React.useEffect(() => {
    const preloadModel = async () => {
      try {
        setModelLoading(true);
        await loadModel();
        setModelLoading(false);
      } catch (error) {
        console.error("Error preloading model:", error);
        setModelLoading(false);
      }
    };
    
    preloadModel();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.error("Please log in first!");
      return;
    }
    if (!photoUrl.trim()) {
      toast.error("Please paste a Google Drive image link!");
      return;
    }

    setLoading(true);
    try {
      const cleanUrl = getDriveImageUrl(photoUrl);

      // Extract image embedding
      toast.info("🔍 Analyzing image for matches...");
      let imageEmbedding = [];
      
      try {
        console.log("Attempting to extract embedding from:", cleanUrl);
        imageEmbedding = await getImageEmbedding(cleanUrl);
        console.log("✅ Image embedding extracted successfully");
        toast.success("✅ Image analyzed!");
      } catch (embeddingError) {
        console.error("❌ Image embedding error:", embeddingError.message);
        console.warn("Check: Is your Drive image PUBLIC? (Anyone with link can view)");
        toast.warn("⚠️ Couldn't analyze image, but item posted. Make sure your Drive image is PUBLIC!");
      }

      await addDoc(collection(db, "items"), {
        type,
        title,
        description,
        category,
        station,
        trainNumber,
        date,
        photoUrl: cleanUrl,
        imageEmbedding,
        postedBy: auth.currentUser.uid,
        posterEmail: auth.currentUser.email,
        status: "active",
        timestamp: serverTimestamp(),
      });

      toast.success("✅ Item posted successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      toast.error("Error posting item: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = photoUrl ? getDriveImageUrl(photoUrl) : "";

  return (
    <AuthLayout title="Report Lost / Found Item">
      {modelLoading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg text-sm">
          ⏳ Loading AI model for image matching... (happens once)
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="Lost"
              checked={type === "Lost"}
              onChange={(e) => setType(e.target.value)}
            />
            Lost
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="Found"
              checked={type === "Found"}
              onChange={(e) => setType(e.target.value)}
            />
            Found
          </label>
        </div>

        <input
          type="text"
          placeholder="Item Title"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Item Description"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none h-24 resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Category (e.g. bag, phone)"
          className="w-full p-3 border rounded-lg"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        {/* NEW: Searchable Station Dropdown */}
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search and select station"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            value={station}
            onChange={(e) => handleStationSearch(e.target.value)}
            onFocus={() => setShowStationDropdown(true)}
            required
          />
          
          {/* Dropdown list */}
          {showStationDropdown && filteredStations.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredStations.map((st, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => selectStation(st)}
                >
                  🚉 {st}
                </div>
              ))}
            </div>
          )}
          
          {showStationDropdown && filteredStations.length === 0 && station && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-gray-500 text-sm">
              No stations found. Try typing differently.
            </div>
          )}
        </div>

        {/* NEW: Numbers-only Train Number input */}
        <input
          type="text"
          placeholder="Train Number (numbers only)"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          value={trainNumber}
          onChange={(e) => {
            // Allow only numbers
            const value = e.target.value.replace(/[^0-9]/g, '');
            setTrainNumber(value);
          }}
          pattern="[0-9]*"
          inputMode="numeric"
          required
        />

        {/* NEW: Date input with auto-filled current date */}
        <div>
          <input
            type="date"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            📅 Default: Today's date (you can change it)
          </p>
        </div>

        <div>
          <input
            type="text"
            placeholder="Paste image link (Imgur, Google Drive, etc.)"
            className="w-full p-3 border rounded-lg"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Recommended: Upload to <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Imgur</a> (free, no account) → Copy image link
          </p>
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-40 h-40 object-cover mx-auto rounded-lg shadow"
              onError={(e) => {
                e.target.style.display = "none";
                toast.error("Image could not be loaded. Make sure the link is public!");
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-3 rounded-lg transition ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Posting..." : "Post Item"}
        </button>
      </form>
    </AuthLayout>
  );
}