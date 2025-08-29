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
      const reader = new FileReader();
      const img = new Image();

      img.onload = () => {
        setOverlay(prev => ({
          ...prev,
          image: img,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0
        }));
        resolve();
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
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
