import { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Settings, 
  RotateCw, 
  Move, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  EyeOff,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ControlPanelProps {
  onCapture: () => void;
  onFileSelect: (file: File) => void;
  isOverlayActive: boolean;
  overlay: {
    image: HTMLImageElement | null;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
  };
  updateOpacity: (opacity: number) => void;
  updateTransform: (transform: { x?: number; y?: number; scale?: number; rotation?: number }) => void;
  resetOverlay: () => void;
  removeOverlay: () => void;
}

export const ControlPanel = ({ 
  onCapture, 
  onFileSelect, 
  isOverlayActive, 
  overlay, 
  updateOpacity, 
  updateTransform, 
  resetOverlay, 
  removeOverlay 
}: ControlPanelProps) => {
  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleTransparencyChange = (value: number[]) => {
    updateOpacity(value[0]);
  };

  const handleScaleChange = (value: number[]) => {
    updateTransform({ scale: value[0] / 100 });
  };

  const handleRotationChange = (value: number[]) => {
    updateTransform({ rotation: value[0] });
  };

  return (
    <>
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/50 to-transparent p-4 pt-8 safe-top">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="text-white hover:bg-white/10"
            data-testid="settings-button"
          >
            <Settings className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-white font-semibold">Historic Overlay</h1>
            <p className="text-white/70 text-xs">
              {isOverlayActive ? 'Overlay Active' : 'No Overlay'}
            </p>
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/50 to-transparent p-4 pb-8 safe-bottom">
        <div className="flex items-center justify-between">
          
          {/* Upload Button */}
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              data-testid="file-input"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              data-testid="upload-button"
            >
              <Upload className="w-5 h-5" />
            </Button>
          </div>

          {/* Capture Button */}
          <Button
            onClick={onCapture}
            className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full hover:bg-gray-100 transition-all duration-200 active:scale-95"
            data-testid="capture-button"
          >
            <Camera className="w-6 h-6 text-black" />
          </Button>

          {/* Controls Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowControls(!showControls)}
            className="text-white hover:bg-white/10"
            data-testid="controls-toggle"
          >
            {showControls ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Side Control Panel */}
      {showControls && isOverlayActive && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-4 w-64 safe-left" data-testid="overlay-controls">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-center">Overlay Controls</h3>
            
            {/* Transparency */}
            <div className="space-y-2">
              <Label className="text-xs">Transparency</Label>
              <Slider
                value={[overlay.opacity * 100]}
                onValueChange={handleTransparencyChange}
                max={100}
                step={1}
                className="w-full"
                data-testid="transparency-slider"
              />
              <div className="text-center text-xs text-muted-foreground">
                {Math.round(overlay.opacity * 100)}%
              </div>
            </div>

            {/* Scale */}
            <div className="space-y-2">
              <Label className="text-xs">Scale</Label>
              <Slider
                value={[overlay.scale * 100]}
                onValueChange={handleScaleChange}
                min={10}
                max={300}
                step={5}
                className="w-full"
                data-testid="scale-slider"
              />
              <div className="text-center text-xs text-muted-foreground">
                {Math.round(overlay.scale * 100)}%
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <Label className="text-xs">Rotation</Label>
              <Slider
                value={[overlay.rotation]}
                onValueChange={handleRotationChange}
                min={0}
                max={360}
                step={1}
                className="w-full"
                data-testid="rotation-slider"
              />
              <div className="text-center text-xs text-muted-foreground">
                {Math.round(overlay.rotation)}°
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Button
                onClick={resetOverlay}
                variant="outline"
                size="sm"
                className="w-full"
                data-testid="reset-overlay"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Position
              </Button>
              
              <Button
                onClick={removeOverlay}
                variant="destructive"
                size="sm"
                className="w-full"
                data-testid="remove-overlay"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Overlay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Gesture Hints */}
      {isOverlayActive && (
        <div className="absolute bottom-24 left-4 right-4 z-20 text-center text-xs text-white/70 safe-bottom" data-testid="gesture-hints">
          <div className="bg-black/30 backdrop-blur-sm rounded-md p-2">
            <div className="flex justify-center space-x-4">
              <span>📱 Drag to move</span>
              <span>🤏 Pinch to scale</span>
              <span>🔄 Rotate with fingers</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
