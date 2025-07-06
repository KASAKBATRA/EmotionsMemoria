import React, { useState, useRef } from 'react';
import { Sparkles, Download, RotateCcw, Sliders, Zap, Palette, Sun, Contrast } from 'lucide-react';
import { Photo } from '../types';

interface AIPhotoEnhancerProps {
  photo: Photo;
  onClose: () => void;
}

interface Enhancement {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  warmth: number;
  vignette: number;
}

const AIPhotoEnhancer: React.FC<AIPhotoEnhancerProps> = ({ photo, onClose }) => {
  const [enhancement, setEnhancement] = useState<Enhancement>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    warmth: 0,
    vignette: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const applyAIEnhancement = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Apply smart enhancements based on photo metadata
    const smartEnhancement: Enhancement = {
      brightness: photo.metadata?.environment === 'indoor' ? 10 : 5,
      contrast: photo.metadata?.mood === 'peaceful' ? 5 : 15,
      saturation: photo.metadata?.mood === 'happy' ? 20 : 10,
      sharpness: 10,
      warmth: photo.metadata?.environment === 'outdoor' ? 15 : 5,
      vignette: photo.metadata?.mood === 'nostalgic' ? 20 : 0,
    };
    
    setEnhancement(smartEnhancement);
    await applyEnhancements(smartEnhancement);
    setIsProcessing(false);
  };

  const applyEnhancements = async (enhancements: Enhancement) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise<void>((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Apply filters
        const filters = [
          `brightness(${100 + enhancements.brightness}%)`,
          `contrast(${100 + enhancements.contrast}%)`,
          `saturate(${100 + enhancements.saturation}%)`,
          `sepia(${enhancements.warmth}%)`,
        ].join(' ');
        
        ctx.filter = filters;
        ctx.drawImage(img, 0, 0);
        
        // Apply vignette effect
        if (enhancements.vignette > 0) {
          const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
          );
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(1, `rgba(0, 0, 0, ${enhancements.vignette / 100})`);
          
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            setEnhancedImage(URL.createObjectURL(blob));
          }
          resolve();
        }, 'image/jpeg', 0.95);
      };
      
      img.src = photo.url;
    });
  };

  const handleSliderChange = (key: keyof Enhancement, value: number) => {
    const newEnhancement = { ...enhancement, [key]: value };
    setEnhancement(newEnhancement);
    applyEnhancements(newEnhancement);
  };

  const resetEnhancements = () => {
    const resetValues: Enhancement = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      sharpness: 0,
      warmth: 0,
      vignette: 0,
    };
    setEnhancement(resetValues);
    setEnhancedImage(null);
  };

  const downloadEnhanced = () => {
    if (!enhancedImage) return;
    
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = `enhanced-${photo.name}`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">AI Photo Enhancer</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={applyAIEnhancement}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      <span>Enhancing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>AI Auto Enhance</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetEnhancements}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset All</span>
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Manual Adjustments</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Sun className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm">Brightness</span>
                    </div>
                    <span className="text-white/70 text-sm">{enhancement.brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={enhancement.brightness}
                    onChange={(e) => handleSliderChange('brightness', parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Contrast className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">Contrast</span>
                    </div>
                    <span className="text-white/70 text-sm">{enhancement.contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={enhancement.contrast}
                    onChange={(e) => handleSliderChange('contrast', parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">Saturation</span>
                    </div>
                    <span className="text-white/70 text-sm">{enhancement.saturation}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={enhancement.saturation}
                    onChange={(e) => handleSliderChange('saturation', parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-orange-400" />
                      <span className="text-white text-sm">Warmth</span>
                    </div>
                    <span className="text-white/70 text-sm">{enhancement.warmth}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={enhancement.warmth}
                    onChange={(e) => handleSliderChange('warmth', parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm">Vignette</span>
                    <span className="text-white/70 text-sm">{enhancement.vignette}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={enhancement.vignette}
                    onChange={(e) => handleSliderChange('vignette', parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Comparison */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Before & After</h3>
                {enhancedImage && (
                  <button
                    onClick={downloadEnhanced}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-white/70 text-sm mb-2">Original</p>
                  <img
                    src={photo.url}
                    alt="Original"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-2">Enhanced</p>
                  {enhancedImage ? (
                    <img
                      src={enhancedImage}
                      alt="Enhanced"
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                      <p className="text-white/50">Apply enhancements to see preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default AIPhotoEnhancer;