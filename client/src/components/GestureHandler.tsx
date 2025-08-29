import { useEffect, useRef } from 'react';
import { GestureHandler as GestureUtility } from '@/lib/gestureUtils';

interface GestureHandlerProps {
  onTransform: (transform: {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
  }) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const GestureHandler = ({ onTransform, children, disabled = false }: GestureHandlerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gestureHandlerRef = useRef<GestureUtility | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    gestureHandlerRef.current = new GestureUtility(container, onTransform);

    return () => {
      gestureHandlerRef.current?.destroy();
    };
  }, [onTransform, disabled]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ touchAction: disabled ? 'auto' : 'none' }}
      data-testid="gesture-handler"
    >
      {children}
    </div>
  );
};
