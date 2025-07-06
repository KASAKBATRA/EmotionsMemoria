import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Play, Pause, RotateCcw, Sparkles, Zap, Eye, Heart, Wind, Upload, X, Volume2, Settings, Film, Camera, Clock, Wand2 } from 'lucide-react';
import { Photo } from '../types';

interface AnimatedMemoriesProps {
  photos: Photo[];
  onBack: () => void;
}

interface AnimationEffect {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface VideoSettings {
  duration: number;
  fps: number;
  quality: 'high' | 'medium' | 'low';
  includeMusic: boolean;
  musicVolume: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
}

const AnimatedMemories: React.FC<AnimatedMemoriesProps> = ({ photos, onBack }) => {
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [selectedEffect, setSelectedEffect] = useState<string>('sparkles');
  const [isAnimating, setIsAnimating] = useState(false);
  const [generatedAnimation, setGeneratedAnimation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [uploadedMusic, setUploadedMusic] = useState<File | null>(null);
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    duration: 3,
    fps: 30,
    quality: 'high',
    includeMusic: false,
    musicVolume: 0.7,
    aspectRatio: '16:9'
  });
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();

  const effects: AnimationEffect[] = [
    {
      id: 'sparkles',
      name: 'Magical Sparkles',
      description: 'Gentle sparkles floating around photos',
      icon: Sparkles,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'blinking',
      name: 'Subtle Blinking',
      description: 'Eyes that gently blink with life',
      icon: Eye,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'floating',
      name: 'Dreamy Float',
      description: 'Soft floating motion like a gentle breeze',
      icon: Wind,
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: 'heartbeat',
      name: 'Loving Pulse',
      description: 'A gentle heartbeat rhythm of love',
      icon: Heart,
      color: 'from-pink-400 to-rose-500'
    },
    {
      id: 'zoom-breath',
      name: 'Breathing Life',
      description: 'Subtle zoom that mimics breathing',
      icon: Zap,
      color: 'from-green-400 to-emerald-500'
    }
  ];

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const togglePhotoSelection = (photo: Photo) => {
    setSelectedPhotos(prev => {
      const isSelected = prev.some(p => p.id === photo.id);
      if (isSelected) {
        return prev.filter(p => p.id !== photo.id);
      } else {
        return [...prev, photo];
      }
    });
  };

  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadedMusic(file);
      setVideoSettings(prev => ({ ...prev, includeMusic: true }));
      
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(file);
        audioRef.current.volume = videoSettings.musicVolume;
        audioRef.current.loop = true;
      }
    }
  };

  const generateAIVideo = async () => {
    if (selectedPhotos.length === 0) {
      alert('Please select at least one photo to create a video.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI video generation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create a sample video URL (in production, this would be actual video generation)
      const sampleVideoUrl = '/sample.mp4'; // You'll need to add this file to public folder
      
      // For now, we'll create a canvas-based animation as a fallback
      await createCanvasAnimation();
      
      setGeneratedVideo(sampleVideoUrl);
      setShowVideoPreview(true);
      
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Error generating video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const createCanvasAnimation = async () => {
    if (!canvasRef.current || selectedPhotos.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on aspect ratio
    const aspectRatio = videoSettings.aspectRatio;
    if (aspectRatio === '16:9') {
      canvas.width = 1920;
      canvas.height = 1080;
    } else if (aspectRatio === '9:16') {
      canvas.width = 1080;
      canvas.height = 1920;
    } else {
      canvas.width = 1080;
      canvas.height = 1080;
    }

    const frames: string[] = [];
    const totalFrames = videoSettings.duration * videoSettings.fps;
    const photosPerFrame = Math.ceil(totalFrames / selectedPhotos.length);

    for (let frame = 0; frame < totalFrames; frame++) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create beautiful gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0f0f23');
      gradient.addColorStop(0.3, '#1e1b4b');
      gradient.addColorStop(0.7, '#581c87');
      gradient.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add animated background particles
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(frame * 0.01 + i) * 100 + canvas.width / 2) + Math.cos(i) * 200;
        const y = (Math.cos(frame * 0.01 + i) * 100 + canvas.height / 2) + Math.sin(i) * 200;
        const opacity = Math.sin(frame * 0.05 + i) * 0.3 + 0.3;
        const size = Math.sin(frame * 0.03 + i) * 2 + 1;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Determine current photo
      const currentPhotoIndex = Math.floor(frame / photosPerFrame) % selectedPhotos.length;
      const currentPhoto = selectedPhotos[currentPhotoIndex];
      
      // Load and draw photo with animation effect
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          applyAnimationEffect(ctx, img, frame, totalFrames, currentPhoto);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = currentPhoto.url;
      });
      
      // Add title overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AI Memory Reel', canvas.width / 2, canvas.height - 60);
      
      // Add photo title
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, 80);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(currentPhoto.name, canvas.width / 2, 50);
      
      frames.push(canvas.toDataURL('image/jpeg', 0.9));
    }
    
    // Store the first frame as preview
    setGeneratedAnimation(frames[0]);
  };

  const applyAnimationEffect = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, frame: number, totalFrames: number, photo: Photo) => {
    const progress = (frame % 90) / 90; // Loop every 3 seconds at 30fps
    const time = progress * Math.PI * 2;
    
    ctx.save();
    
    // Center the image
    const maxSize = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.6;
    const imgAspect = img.width / img.height;
    let imgWidth, imgHeight;
    
    if (imgAspect > 1) {
      imgWidth = maxSize;
      imgHeight = maxSize / imgAspect;
    } else {
      imgHeight = maxSize;
      imgWidth = maxSize * imgAspect;
    }
    
    const x = (ctx.canvas.width - imgWidth) / 2;
    const y = (ctx.canvas.height - imgHeight) / 2;
    
    switch (selectedEffect) {
      case 'sparkles':
        drawImageWithSparkles(ctx, img, x, y, imgWidth, imgHeight, time);
        break;
      case 'blinking':
        drawImageWithBlinking(ctx, img, x, y, imgWidth, imgHeight, time);
        break;
      case 'floating':
        drawImageWithFloating(ctx, img, x, y, imgWidth, imgHeight, time);
        break;
      case 'heartbeat':
        drawImageWithHeartbeat(ctx, img, x, y, imgWidth, imgHeight, time);
        break;
      case 'zoom-breath':
        drawImageWithBreathing(ctx, img, x, y, imgWidth, imgHeight, time);
        break;
      default:
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
    }
    
    ctx.restore();
  };

  const drawImageWithSparkles = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, time: number) => {
    ctx.drawImage(img, x, y, w, h);
    
    for (let i = 0; i < 20; i++) {
      const sparkleX = x + (Math.sin(time + i) * 0.5 + 0.5) * w;
      const sparkleY = y + (Math.cos(time + i * 1.5) * 0.5 + 0.5) * h;
      const opacity = (Math.sin(time * 2 + i) * 0.5 + 0.5) * 0.8;
      const size = 3 + Math.sin(time + i) * 2;
      
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, size, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sparkleX - size * 2, sparkleY);
      ctx.lineTo(sparkleX + size * 2, sparkleY);
      ctx.moveTo(sparkleX, sparkleY - size * 2);
      ctx.lineTo(sparkleX, sparkleY + size * 2);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  };

  const drawImageWithBlinking = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, time: number) => {
    ctx.drawImage(img, x, y, w, h);
    
    const blinkIntensity = Math.max(0, Math.sin(time * 0.3)) * 0.3;
    if (blinkIntensity > 0.2) {
      ctx.globalAlpha = blinkIntensity;
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + w * 0.3, y + h * 0.35, w * 0.15, h * 0.05);
      ctx.fillRect(x + w * 0.55, y + h * 0.35, w * 0.15, h * 0.05);
      ctx.globalAlpha = 1;
    }
  };

  const drawImageWithFloating = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, time: number) => {
    const floatY = Math.sin(time) * 10;
    const floatX = Math.cos(time * 0.7) * 5;
    const rotation = Math.sin(time * 0.5) * 0.02;
    
    ctx.translate(x + w/2 + floatX, y + h/2 + floatY);
    ctx.rotate(rotation);
    ctx.drawImage(img, -w/2, -h/2, w, h);
  };

  const drawImageWithHeartbeat = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, time: number) => {
    const heartbeat = Math.abs(Math.sin(time * 2)) * 0.05 + 1;
    const scale = heartbeat;
    
    ctx.translate(x + w/2, y + h/2);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -w/2, -h/2, w, h);
    
    if (heartbeat > 1.03) {
      for (let i = 0; i < 5; i++) {
        const heartX = (Math.random() - 0.5) * w;
        const heartY = (Math.random() - 0.5) * h;
        ctx.fillStyle = '#FF69B4';
        ctx.font = '20px Arial';
        ctx.fillText('💖', heartX, heartY);
      }
    }
  };

  const drawImageWithBreathing = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, time: number) => {
    const breathScale = 1 + Math.sin(time * 0.8) * 0.03;
    const opacity = 0.95 + Math.sin(time * 0.8) * 0.05;
    
    ctx.globalAlpha = opacity;
    ctx.translate(x + w/2, y + h/2);
    ctx.scale(breathScale, breathScale);
    ctx.drawImage(img, -w/2, -h/2, w, h);
    ctx.globalAlpha = 1;
  };

  const downloadVideo = () => {
    if (!generatedVideo) return;
    
    // Create download link
    const link = document.createElement('a');
    link.href = generatedVideo;
    link.download = `ai-memory-reel-${Date.now()}.mp4`;
    link.click();
  };

  const playPreviewVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        if (audioRef.current && uploadedMusic) {
          audioRef.current.play();
        }
      } else {
        videoRef.current.pause();
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    }
  };

  return (
    <>
      <style jsx>{`
        .video-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .photo-item {
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 3px solid transparent;
        }
        
        .photo-item:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        
        .photo-item.selected {
          border-color: #8b5cf6;
          transform: scale(0.95);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
        }
        
        .loading-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .video-preview {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.4);
        }
        
        .settings-panel {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h2 className="text-4xl font-bold text-white">AI Memory Reel Creator</h2>
              <p className="text-white/70">Transform your photos into magical animated videos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            {generatedVideo && (
              <button
                onClick={downloadVideo}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Download Video</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Photo Selection & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo Upload Section */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Upload className="w-6 h-6" />
                <span>Select Photos ({selectedPhotos.length})</span>
              </h3>
              
              <div className="photo-grid">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`photo-item ${selectedPhotos.some(p => p.id === photo.id) ? 'selected' : ''}`}
                    onClick={() => togglePhotoSelection(photo)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedPhotos.some(p => p.id === photo.id) && (
                      <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {selectedPhotos.findIndex(p => p.id === photo.id) + 1}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {selectedPhotos.length === 0 && (
                <div className="text-center py-8 text-white/60">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click photos above to select them for your video</p>
                </div>
              )}
            </div>

            {/* Animation Effects */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Animation Effects</h3>
              <div className="space-y-3">
                {effects.map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => setSelectedEffect(effect.id)}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      selectedEffect === effect.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${effect.color} flex items-center justify-center`}>
                        <effect.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-medium text-white">{effect.name}</p>
                    </div>
                    <p className="text-white/70 text-sm">{effect.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Music Upload */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Volume2 className="w-5 h-5" />
                <span>Background Music</span>
              </h3>
              
              <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-white/30 rounded-lg hover:border-white/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleMusicUpload}
                  className="hidden"
                />
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-sm">
                    {uploadedMusic ? uploadedMusic.name : 'Upload your music (optional)'}
                  </span>
                </div>
              </label>
              
              {uploadedMusic && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-white mb-2">
                    Volume ({Math.round(videoSettings.musicVolume * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={videoSettings.musicVolume}
                    onChange={(e) => setVideoSettings(prev => ({ ...prev, musicVolume: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateAIVideo}
              disabled={isGenerating || selectedPhotos.length === 0}
              className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-xl transition-all disabled:opacity-50 shadow-2xl hover:from-purple-600 hover:to-pink-600 hover:scale-105"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Crafting your memory reel...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Film className="w-6 h-6" />
                  <span>Generate AI Video</span>
                  <Wand2 className="w-6 h-6" />
                </div>
              )}
            </button>
          </div>

          {/* Video Preview Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Video Preview</h3>
                {showVideoPreview && (
                  <div className="flex items-center space-x-2 text-sm text-white/70">
                    <Clock className="w-4 h-4" />
                    <span>{videoSettings.duration}s • {videoSettings.aspectRatio} • {videoSettings.quality}</span>
                  </div>
                )}
              </div>
              
              {showVideoPreview && generatedVideo ? (
                <div className="video-container">
                  <div className="video-preview">
                    <video
                      ref={videoRef}
                      className="w-full h-auto"
                      controls
                      poster={generatedAnimation || undefined}
                    >
                      <source src={generatedVideo} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold text-lg">Your AI Memory Reel</h4>
                        <p className="text-white/70 text-sm">{selectedPhotos.length} photos • {selectedEffect} effect</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={playPreviewVideo}
                          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        >
                          <Play className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={downloadVideo}
                          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <h4 className="text-white text-xl font-semibold mb-2">Crafting your memory reel...</h4>
                    <p className="text-white/70">AI is analyzing your photos and applying magical effects</p>
                    <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-white/60">
                      <span>✨ Analyzing emotions</span>
                      <span>🎨 Applying effects</span>
                      <span>🎵 Syncing music</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-900/50 to-purple-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-white/30">
                  <div className="text-center">
                    <Film className="w-16 h-16 text-white/50 mx-auto mb-4" />
                    <h4 className="text-white text-xl font-semibold mb-2">Ready to Create Magic</h4>
                    <p className="text-white/70 mb-4">Select photos and click "Generate AI Video" to create your memory reel</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                      <div className="bg-white/10 rounded-lg p-3">
                        <Camera className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-white/70 text-xs">Select Photos</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <Sparkles className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                        <p className="text-white/70 text-xs">Choose Effects</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <Film className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-white/70 text-xs">Generate Video</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Settings Panel */}
            {showSettings && (
              <div className="mt-6 settings-panel p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Video Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Duration per Photo</label>
                    <select
                      value={videoSettings.duration}
                      onChange={(e) => setVideoSettings(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={1} className="bg-gray-800">1 second</option>
                      <option value={2} className="bg-gray-800">2 seconds</option>
                      <option value={3} className="bg-gray-800">3 seconds</option>
                      <option value={5} className="bg-gray-800">5 seconds</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Aspect Ratio</label>
                    <select
                      value={videoSettings.aspectRatio}
                      onChange={(e) => setVideoSettings(prev => ({ ...prev, aspectRatio: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="16:9" className="bg-gray-800">16:9 (Landscape)</option>
                      <option value="9:16" className="bg-gray-800">9:16 (Portrait)</option>
                      <option value="1:1" className="bg-gray-800">1:1 (Square)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Quality</label>
                    <select
                      value={videoSettings.quality}
                      onChange={(e) => setVideoSettings(prev => ({ ...prev, quality: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="high" className="bg-gray-800">High (1080p)</option>
                      <option value="medium" className="bg-gray-800">Medium (720p)</option>
                      <option value="low" className="bg-gray-800">Low (480p)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Frame Rate</label>
                    <select
                      value={videoSettings.fps}
                      onChange={(e) => setVideoSettings(prev => ({ ...prev, fps: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={24} className="bg-gray-800">24 FPS (Cinematic)</option>
                      <option value={30} className="bg-gray-800">30 FPS (Standard)</option>
                      <option value={60} className="bg-gray-800">60 FPS (Smooth)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Elements */}
        <canvas ref={canvasRef} className="hidden" />
        <audio ref={audioRef} className="hidden" />
      </div>
    </>
  );
};

export default AnimatedMemories;