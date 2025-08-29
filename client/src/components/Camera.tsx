import { useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { LoaderCircle } from 'lucide-react';

interface CameraProps {
  onStreamReady?: (stream: MediaStream) => void;
}

export const Camera = ({ onStreamReady }: CameraProps) => {
  const { stream, isLoading, error, videoRef, startCamera } = useCamera();

  useEffect(() => {
    startCamera();
  }, []);

  useEffect(() => {
    if (stream && onStreamReady) {
      onStreamReady(stream);
    }
  }, [stream, onStreamReady]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-red-900/20" data-testid="camera-error">
        <div className="text-center p-6 bg-card rounded-lg border border-red-500">
          <p className="text-red-400 mb-2">Camera Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button 
            onClick={() => startCamera()}
            className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            data-testid="retry-camera"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0" data-testid="camera-container">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10" data-testid="camera-loading">
          <div className="text-center p-6">
            <LoaderCircle className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Starting camera...</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        data-testid="camera-video"
      />
    </div>
  );
};
