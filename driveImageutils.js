// utils/driveImageUtils.js

/**
 * Converts any Google Drive link to a direct embeddable image URL
 * @param {string} link - Google Drive URL or file ID
 * @returns {string} - Direct image URL
 */
export const getDriveImageUrl = (link) => {
  if (!link) return "";
  
  // Remove any whitespace
  link = link.trim();
  
  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  let match = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  
  // Pattern 2: https://drive.google.com/open?id=FILE_ID
  match = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  
  // Pattern 3: Already in uc?export=view format
  if (link.includes('uc?export=view')) {
    match = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
  }
  
  // Pattern 4: Just the file ID (25+ characters)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(link)) {
    return `https://drive.google.com/thumbnail?id=${link}&sz=w1000`;
  }
  
  // If it's already a valid URL or not a Drive link, return as is
  return link;
};

/**
 * React component for displaying Google Drive images with fallback
 */
import React from "react";

export const DriveImage = ({ src, alt, className, fallbackSrc = "/placeholder.png" }) => {
  const [imgSrc, setImgSrc] = React.useState(getDriveImageUrl(src));
  const [error, setError] = React.useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};