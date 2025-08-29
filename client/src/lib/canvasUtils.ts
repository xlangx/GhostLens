export const capturePhoto = (
  videoElement: HTMLVideoElement,
  overlayCanvas: HTMLCanvasElement,
  quality: number = 0.9
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size to video dimensions
      canvas.width = videoElement.videoWidth || videoElement.clientWidth;
      canvas.height = videoElement.videoHeight || videoElement.clientHeight;

      if (canvas.width === 0 || canvas.height === 0) {
        reject(new Error('Invalid video dimensions'));
        return;
      }

      // Draw video frame first
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Draw overlay if it exists and has content
      if (overlayCanvas && overlayCanvas.width > 0 && overlayCanvas.height > 0) {
        try {
          ctx.drawImage(overlayCanvas, 0, 0, canvas.width, canvas.height);
        } catch (overlayError) {
          console.warn('Failed to composite overlay, capturing video only:', overlayError);
        }
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture image'));
        }
      }, 'image/jpeg', quality);
    } catch (error) {
      reject(new Error(`Capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};

export const downloadImage = (blob: Blob, filename: string = 'historic-recreation.jpg') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });
};
