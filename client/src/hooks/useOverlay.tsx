import { useState, useRef, useCallback } from 'react';

interface OverlayState {
  image: HTMLImageElement | null;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

interface OverlayTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const useOverlay = () => {
  const [overlay, setOverlay] = useState<OverlayState>({
    image: null,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 0.5
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const loadImage = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file'));
        return;
      }

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('Image file is too large (max 10MB)'));
        return;
      }

      const reader = new FileReader();
      const img = new Image();

      img.onload = () => {
        try {
          setOverlay(prev => ({
            ...prev,
            image: img,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0
          }));
          resolve();
        } catch (error) {
          reject(new Error('Failed to process image'));
        }
      };

      img.onerror = (error) => {
        console.error('Image load error:', error);
        reject(new Error('Invalid image file or corrupted data'));
      };
      
      reader.onload = (e) => {
        try {
          if (e.target?.result) {
            img.src = e.target.result as string;
          } else {
            reject(new Error('Failed to read file data'));
          }
        } catch (error) {
          reject(new Error('Failed to process file data'));
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Failed to read file'));
      };

      try {
        reader.readAsDataURL(file);
      } catch (error) {
        reject(new Error('Failed to start reading file'));
      }
    });
  }, []);

  const updateTransform = useCallback((transform: Partial<OverlayTransform>) => {
    setOverlay(prev => ({ ...prev, ...transform }));
  }, []);

  const updateOpacity = useCallback((opacity: number) => {
    setOverlay(prev => ({ ...prev, opacity: opacity / 100 }));
  }, []);

  const resetOverlay = useCallback(() => {
    setOverlay(prev => ({
      ...prev,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0
    }));
  }, []);

  const removeOverlay = useCallback(() => {
    setOverlay({
      image: null,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 0.5
    });
  }, []);

  const renderOverlay = useCallback((videoElement: HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !overlay.image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    contextRef.current = ctx;

    // Set canvas size to match video
    canvas.width = videoElement.videoWidth || videoElement.clientWidth;
    canvas.height = videoElement.videoHeight || videoElement.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set global alpha for transparency
    ctx.globalAlpha = overlay.opacity;

    // Save context state
    ctx.save();

    // Calculate center position
    const centerX = canvas.width / 2 + overlay.x;
    const centerY = canvas.height / 2 + overlay.y;

    // Apply transformations
    ctx.translate(centerX, centerY);
    ctx.rotate((overlay.rotation * Math.PI) / 180);
    ctx.scale(overlay.scale, overlay.scale);

    // Draw image centered
    const imgWidth = overlay.image.width;
    const imgHeight = overlay.image.height;
    ctx.drawImage(overlay.image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

    // Restore context state
    ctx.restore();
    ctx.globalAlpha = 1;
  }, [overlay]);

  return {
    overlay,
    canvasRef,
    loadImage,
    updateTransform,
    updateOpacity,
    resetOverlay,
    removeOverlay,
    renderOverlay
  };
};
