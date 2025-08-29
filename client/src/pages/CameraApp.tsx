import { useState, useRef } from 'react';
import { Camera } from '@/components/Camera';
import { OverlayCanvas } from '@/components/OverlayCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { useOverlay } from '@/hooks/useOverlay';
import { usePWA } from '@/hooks/usePWA';
import { capturePhoto, downloadImage } from '@/lib/canvasUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

export default function CameraApp() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const { overlay, loadImage } = useOverlay();
  const { isInstallable, installApp, dismissInstallPrompt } = usePWA();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleStreamReady = (stream: MediaStream) => {
    // Find the video element from the Camera component
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      setVideoElement(video);
      videoRef.current = video;
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      await loadImage(file);
      toast({
        title: "Overlay loaded",
        description: "Historic photo ready for overlay",
      });
    } catch (error) {
      toast({
        title: "Error loading image",
        description: error instanceof Error ? error.message : "Failed to load image",
        variant: "destructive",
      });
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) {
      toast({
        title: "Error",
        description: "Camera not ready",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = await capturePhoto(videoRef.current, document.createElement('canvas'));
      downloadImage(blob, `historic-recreation-${Date.now()}.jpg`);
      
      toast({
        title: "Photo captured",
        description: "Historic recreation saved successfully",
      });
    } catch (error) {
      toast({
        title: "Capture failed",
        description: error instanceof Error ? error.message : "Failed to capture photo",
        variant: "destructive",
      });
    }
  };

  const handleInstallApp = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "App installed",
        description: "Historic Overlay is now available on your home screen",
      });
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background" data-testid="camera-app">
      {/* PWA Install Banner */}
      {isInstallable && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-primary text-primary-foreground p-3 text-center text-sm" data-testid="pwa-install-banner">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            <span>Install app for better experience</span>
            <div className="flex gap-2">
              <Button
                onClick={handleInstallApp}
                variant="secondary"
                size="sm"
                data-testid="install-app"
              >
                <Download className="w-4 h-4 mr-1" />
                Install
              </Button>
              <Button
                onClick={dismissInstallPrompt}
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="dismiss-install"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Camera View */}
      <Camera onStreamReady={handleStreamReady} />

      {/* Overlay Canvas */}
      <OverlayCanvas 
        videoElement={videoElement}
        isActive={!!overlay.image}
      />

      {/* Control Panel */}
      <ControlPanel
        onCapture={handleCapture}
        onFileSelect={handleFileSelect}
        isOverlayActive={!!overlay.image}
      />

      {/* No Overlay State */}
      {!overlay.image && (
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-6 text-center" data-testid="no-overlay-state">
          <div className="space-y-4">
            <div className="text-6xl">📷</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No Historic Photo Selected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a historic photo to overlay on your camera view and recreate the scene
              </p>
              <div className="relative inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  data-testid="file-input-main"
                />
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Choose Historic Photo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
