import { useState, useEffect, useRef } from 'react';

interface CameraConfig {
  resolution: '720p' | '1080p' | '4k';
  facingMode: 'user' | 'environment';
}

const resolutionMap = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 }
};

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [config, setConfig] = useState<CameraConfig>({
    resolution: '1080p',
    facingMode: 'environment'
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const getDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
    }
  };

  const startCamera = async (newConfig?: Partial<CameraConfig>) => {
    setIsLoading(true);
    setError(null);

    const currentConfig = { ...config, ...newConfig };
    setConfig(currentConfig);

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Try with preferred settings first
      let constraints: MediaStreamConstraints = {
        video: {
          ...resolutionMap[currentConfig.resolution],
          facingMode: currentConfig.facingMode
        },
        audio: false
      };

      let newStream: MediaStream;
      
      try {
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstError) {
        console.warn('High resolution failed, trying fallback:', firstError);
        
        // Fallback to basic constraints
        constraints = {
          video: {
            facingMode: currentConfig.facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        
        try {
          newStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (secondError) {
          console.warn('Facing mode failed, trying any camera:', secondError);
          
          // Final fallback - any available camera
          constraints = {
            video: true,
            audio: false
          };
          
          newStream = await navigator.mediaDevices.getUserMedia(constraints);
        }
      }

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        
        // Ensure video plays
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      console.error('Camera error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    const newFacingMode = config.facingMode === 'user' ? 'environment' : 'user';
    startCamera({ facingMode: newFacingMode });
  };

  useEffect(() => {
    getDevices();
    return () => stopCamera();
  }, []);

  return {
    stream,
    isLoading,
    error,
    devices,
    config,
    videoRef,
    startCamera,
    stopCamera,
    switchCamera,
    setConfig
  };
};
