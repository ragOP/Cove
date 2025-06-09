import React, { useState } from 'react';
import { Image } from 'react-native';

/**
 * CustomImage - A wrapper for <Image> with fallback and advanced props if needed.
 * Usage: For all standard images in the app (not placeholders)
 */
const CustomImage = ({ source, style, onError, ...props }) => {
  const [error, setError] = useState(false);
  // You can add more advanced logic here (e.g., fade-in, caching, etc.)
  if (error) return null; // Or render a fallback UI if desired
  return (
    <Image
      source={source}
      style={style}
      onError={e => {
        setError(true);
        onError && onError(e);
      }}
      {...props}
    />
  );
};

export default CustomImage;
