import { useEffect } from 'react';

const getImageDimensions = (url, callback) => {
  useEffect(() => {
    const loadImage = async () => {
      if (url.length === 0) return;

      const img = new Image();

      img.onload = () => {
        const { height, width } = img;
        callback({ width, height });
      };

      img.src = url;
    };

    loadImage();
  }, [url, callback]);
};

export default getImageDimensions;
