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
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          ...resolutionMap[currentConfig.resolution],
          facingMode: currentConfig.facingMode
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access camera');
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
