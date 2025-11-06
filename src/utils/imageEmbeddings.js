import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as mobilenet from "@tensorflow-models/mobilenet";

let model = null;

// Load MobileNet model (happens once)
export const loadModel = async () => {
  if (model) return model;
  
  try {
    console.log("Loading MobileNet model...");
    model = await mobilenet.load({ version: 2, alpha: 0.5 });
    console.log("✅ Model loaded successfully");
    return model;
  } catch (error) {
    console.error("❌ Error loading model:", error);
    throw error;
  }
};

// Convert image URL to tensor
const urlToImage = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    const timeout = setTimeout(() => {
      reject(new Error("Image load timeout"));
    }, 15000); // 15 second timeout
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load image from Drive`));
    };
    
    // Extract file ID from any Drive URL format
    let fileId = url.match(/id=([a-zA-Z0-9_-]+)/)?.[1] || 
                 url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
    
    if (fileId) {
      // Use export=view format with inline=true for better loading
      img.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
    } else {
      img.src = url;
    }
  });
};

// Extract image embedding (1024-dimensional vector)
export const getImageEmbedding = async (imageUrl) => {
  try {
    if (!model) {
      await loadModel();
    }

    // Load image
    const img = await urlToImage(imageUrl);
    
    // Convert to tensor and get predictions
    const predictions = await model.classify(img);
    
    // Get the feature vector (embedding) from the model
    const logits = model.infer(img);
    const embedding = logits.dataSync();
    
    // Convert to regular array
    const embeddingArray = Array.from(embedding);
    
    // Cleanup
    logits.dispose();
    
    return embeddingArray;
  } catch (error) {
    console.error("Error extracting embedding:", error);
    throw error;
  }
};

// Calculate similarity between two embeddings (cosine similarity)
export const calculateSimilarity = (embedding1, embedding2) => {
  if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
    return 0;
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    magnitude1 += embedding1[i] * embedding1[i];
    magnitude2 += embedding2[i] * embedding2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  const similarity = dotProduct / (magnitude1 * magnitude2);
  
  // Convert to percentage (0-100)
  return Math.round((similarity + 1) / 2 * 100);
};

// Find similar items from all items
export const findSimilarItems = (currentItemEmbedding, allItems) => {
  const similarities = allItems
    .map((item) => ({
      ...item,
      similarity: calculateSimilarity(
        currentItemEmbedding,
        item.imageEmbedding || []
      ),
    }))
    .filter((item) => item.similarity > 40) // Only items with >40% similarity
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3); // Top 3 matches

  return similarities;
};