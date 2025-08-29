import { useEffect } from 'react';
import { useOverlay } from '@/hooks/useOverlay';
import { GestureHandler } from '@/lib/gestureUtils';

interface OverlayCanvasProps {
  videoElement: HTMLVideoElement | null;
  isActive: boolean;
}

export const OverlayCanvas = ({ videoElement, isActive }: OverlayCanvasProps) => {
  const { canvasRef, overlay, renderOverlay, updateTransform } = useOverlay();

  useEffect(() => {
    if (!videoElement || !isActive) return;

    const animate = () => {
      renderOverlay(videoElement);
      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [videoElement, isActive, renderOverlay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !overlay.image) return;

    const gestureHandler = new GestureHandler(canvas, (transform) => {
      if (transform.x !== undefined || transform.y !== undefined) {
        updateTransform({
          x: overlay.x + (transform.x || 0),
          y: overlay.y + (transform.y || 0)
        });
      }
      
      if (transform.scale !== undefined) {
        updateTransform({
          scale: Math.max(0.1, Math.min(3, overlay.scale * transform.scale))
        });
      }
      
      if (transform.rotation !== undefined) {
        updateTransform({
          rotation: (overlay.rotation + transform.rotation) % 360
        });
      }
    });

    return () => gestureHandler.destroy();
  }, [overlay, updateTransform]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ 
        pointerEvents: overlay.image ? 'auto' : 'none',
        touchAction: 'none' 
      }}
      data-testid="overlay-canvas"
    />
  );
};
