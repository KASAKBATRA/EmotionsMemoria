import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Sparkles, Heart, Quote, Shuffle, Play, Download, Pause, Volume2, X, Calendar, Camera, MapPin, Clock } from 'lucide-react';
import { Photo } from '../types';

interface MemoryWheelProps {
  photos: Photo[];
  onBack: () => void;
}

interface SpinState {
  isSpinning: boolean;
  rotation: number;
  targetRotation: number;
  centerPhotoIndex: number;
  animationProgress: number;
}

interface SubjectAnalysis {
  type: 'people' | 'scenery' | 'object';
  confidence: number;
  faceCount: number;
  sceneType?: 'landscape' | 'urban' | 'nature' | 'indoor' | 'architecture';
}

const MemoryWheel: React.FC<MemoryWheelProps> = ({ photos, onBack }) => {
  const [spinState, setSpinState] = useState<SpinState>({
    isSpinning: false,
    rotation: 0,
    targetRotation: 0,
    centerPhotoIndex: 0,
    animationProgress: 0
  });
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [poeticCaption, setPoeticCaption] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showCenterPhoto, setShowCenterPhoto] = useState(false);
  const [captionAnimation, setCaptionAnimation] = useState(false);
  const [subjectAnalysis, setSubjectAnalysis] = useState<SubjectAnalysis | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Enhanced caption collections based on subject type
  const peopleCaptions = [
    "Smiles that never fade, carrying the warmth of this perfect moment.",
    "Unspoken bonds visible in every glance, every gentle gesture.",
    "The laughter here still echoes in the spaces between heartbeats.",
    "Eyes that hold stories only the heart knows how to tell.",
    "In this frame, love found its most honest expression.",
    "The joy radiating here could light up the darkest days.",
    "Faces that remind us why some moments are worth preserving forever.",
    "The connection captured here transcends the boundaries of time.",
    "Genuine happiness wearing the most beautiful disguise - your smile.",
    "This moment holds the essence of what it means to truly belong."
  ];

  const sceneryCaptions = [
    "Twilight over soft hills, painting the world in whispered promises.",
    "Stillness beneath the sky, where time learns to hold its breath.",
    "Golden hour casting its spell over the earth's quiet secrets.",
    "Where horizon meets heaven, dreams take their first tentative steps.",
    "The gentle curve of landscape, sculpted by wind and wonder.",
    "Morning mist dancing over fields of endless possibility.",
    "Shadows and light playing their eternal game across the canvas of earth.",
    "The poetry of place, written in colors only the heart can read.",
    "Where nature pauses to admire its own reflection in stillness.",
    "The quiet symphony of earth and sky, composed in perfect harmony."
  ];

  const objectCaptions = [
    "The quiet beauty found in life's simple, overlooked treasures.",
    "Where ordinary things become extraordinary through the lens of memory.",
    "The gentle art of finding magic in the everyday moments.",
    "A testament to the poetry hidden in plain sight.",
    "The elegant dance between form and meaning, captured in stillness.",
    "Where simplicity meets the profound beauty of being present.",
    "The story this object tells goes deeper than its surface suggests.",
    "In the mundane, we discover the sacred threads of daily life.",
    "The weight of memory resting gently on familiar things.",
    "Where function becomes art, and purpose transforms into poetry."
  ];

  const emotionalTags = [
    "A moment of pure wonder",
    "Love captured in time",
    "The poetry of being alive",
    "When hearts speak without words",
    "A glimpse of forever",
    "The art of being present",
    "Where memories are born",
    "A dance with destiny",
    "The music of the moment",
    "When time stands still"
  ];

  // Advanced subject detection
  const analyzePhotoSubject = async (photo: Photo): Promise<SubjectAnalysis> => {
    return new Promise((resolve) => {
      // Simulate AI analysis
      setTimeout(() => {
        const fileName = photo.name.toLowerCase();
        
        if (photo.metadata?.faces && photo.metadata.faces > 0) {
          resolve({ type: 'people', confidence: 0.9, faceCount: photo.metadata.faces });
          return;
        }
        
        const peopleKeywords = ['portrait', 'selfie', 'family', 'wedding', 'graduation', 'birthday', 'people', 'person', 'face', 'group', 'friends'];
        if (peopleKeywords.some(keyword => fileName.includes(keyword))) {
          resolve({ type: 'people', confidence: 0.7, faceCount: 1 });
          return;
        }
        
        const sceneryKeywords = ['landscape', 'sunset', 'sunrise', 'mountain', 'beach', 'ocean', 'forest', 'sky', 'nature', 'view', 'scenery', 'horizon'];
        if (sceneryKeywords.some(keyword => fileName.includes(keyword))) {
          resolve({ type: 'scenery', confidence: 0.8, faceCount: 0, sceneType: 'landscape' });
          return;
        }
        
        if (photo.metadata?.environment) {
          if (['outdoor', 'nature', 'beach', 'mountain'].includes(photo.metadata.environment)) {
            resolve({ type: 'scenery', confidence: 0.7, faceCount: 0, sceneType: photo.metadata.environment as any });
            return;
          }
        }
        
        resolve({ type: 'object', confidence: 0.5, faceCount: 0 });
      }, 500);
    });
  };

  const generateContextualCaption = async (photo: Photo): Promise<string> => {
    const analysis = await analyzePhotoSubject(photo);
    setSubjectAnalysis(analysis);
    
    let captionPool: string[];
    
    switch (analysis.type) {
      case 'people':
        captionPool = peopleCaptions;
        break;
      case 'scenery':
        captionPool = sceneryCaptions;
        break;
      case 'object':
        captionPool = objectCaptions;
        break;
      default:
        captionPool = peopleCaptions;
    }
    
    return captionPool[Math.floor(Math.random() * captionPool.length)];
  };

  const spinWheel = () => {
    if (spinState.isSpinning || photos.length === 0) return;
    
    const spins = 4 + Math.random() * 3;
    const finalPosition = Math.random() * 360;
    const totalRotation = spinState.rotation + (spins * 360) + finalPosition;
    
    setSpinState(prev => ({
      ...prev,
      isSpinning: true,
      targetRotation: totalRotation,
      animationProgress: 0
    }));
    
    setShowCenterPhoto(false);
    setCaptionAnimation(false);
    setShowPhotoModal(false);
    
    const photoIndex = Math.floor((finalPosition / 360) * photos.length);
    const selectedPhotoIndex = (photos.length - 1 - photoIndex) % photos.length;
    
    animateSpinning(totalRotation, selectedPhotoIndex);
  };

  const animateSpinning = (targetRotation: number, finalPhotoIndex: number) => {
    const startRotation = spinState.rotation;
    const startTime = Date.now();
    const duration = 3500;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
      
      setSpinState(prev => ({
        ...prev,
        rotation: currentRotation,
        animationProgress: progress
      }));
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        finishSpin(finalPhotoIndex);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const finishSpin = async (photoIndex: number) => {
    const selectedPhotoObj = photos[photoIndex];
    const caption = await generateContextualCaption(selectedPhotoObj);
    
    setSpinState(prev => ({
      ...prev,
      isSpinning: false,
      centerPhotoIndex: photoIndex
    }));
    
    setSelectedPhoto(selectedPhotoObj);
    setPoeticCaption(caption);
    
    setTimeout(() => {
      setShowCenterPhoto(true);
    }, 200);
    
    setTimeout(() => {
      setCaptionAnimation(true);
    }, 800);
  };

  const resetWheel = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setSpinState({
      isSpinning: false,
      rotation: 0,
      targetRotation: 0,
      centerPhotoIndex: 0,
      animationProgress: 0
    });
    setSelectedPhoto(null);
    setPoeticCaption('');
    setShowCenterPhoto(false);
    setCaptionAnimation(false);
    setSubjectAnalysis(null);
    setShowPhotoModal(false);
  };

  const shufflePhotos = () => {
    resetWheel();
    setTimeout(spinWheel, 500);
  };

  const downloadSpinVideo = async () => {
    if (!selectedPhoto) {
      alert('Please select a photo first by spinning the wheel.');
      return;
    }

    // Check if canvas ref is available
    if (!canvasRef.current) {
      console.error('Canvas element not found. Canvas ref:', canvasRef.current);
      alert('Canvas not ready. Please try again in a moment.');
      return;
    }

    setIsGeneratingVideo(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas 2D context');
      }

      canvas.width = 1920;
      canvas.height = 1080;

      const frames: string[] = [];
      const totalFrames = 180;
      const spinFrames = 120;
      const revealFrames = 60;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = selectedPhoto.url;
      });
      
      for (let frame = 0; frame < totalFrames; frame++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Beautiful gradient background
        const gradient = ctx.createRadialGradient(960, 540, 0, 960, 540, 960);
        gradient.addColorStop(0, '#1e1b4b');
        gradient.addColorStop(0.3, '#581c87');
        gradient.addColorStop(0.7, '#7c3aed');
        gradient.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Animated sparkles
        for (let i = 0; i < 80; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const opacity = Math.sin(frame * 0.1 + i) * 0.5 + 0.5;
          const size = Math.max(0.5, Math.sin(frame * 0.05 + i) * 2 + 1);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        if (frame < spinFrames) {
          drawSpinningWheel(ctx, frame, spinFrames);
        } else {
          const revealProgress = (frame - spinFrames) / revealFrames;
          drawCenterReveal(ctx, img, revealProgress);
        }
        
        frames.push(canvas.toDataURL('image/jpeg', 0.9));
      }
      
      // Create downloadable video frames as ZIP or individual images
      const link = document.createElement('a');
      link.href = frames[frames.length - 1];
      link.download = `memory-wheel-video-${selectedPhoto.name.replace(/\.[^/.]+$/, '')}.jpg`;
      link.click();
      
      alert('Memory wheel video frames generated! In a full implementation, this would create a complete MP4 video with the spinning animation, center reveal, and background music.');
      
    } catch (error) {
      console.error('Error creating video:', error);
      alert(`Error creating video: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const drawSpinningWheel = (ctx: CanvasRenderingContext2D, frame: number, totalSpinFrames: number) => {
    const centerX = 960; // Use explicit values instead of canvas.width
    const centerY = 540; // Use explicit values instead of canvas.height
    const wheelRadius = 350;
    
    const progress = frame / totalSpinFrames;
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentRotation = easeOut * 360 * 6;
    
    // Draw wheel background with glow
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 40;
    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, wheelRadius + 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw photos in flower pattern
    photos.slice(0, 8).forEach((photo, index) => {
      const angle = (index * 45) + currentRotation; // 8 petals, 45 degrees apart
      const radian = (angle * Math.PI) / 180;
      const photoX = centerX + Math.cos(radian) * (wheelRadius - 60);
      const photoY = centerY + Math.sin(radian) * (wheelRadius - 60);
      
      const speedEffect = Math.abs(Math.sin(frame * 0.4)) * 15 + 50;
      const photoSize = Math.max(10, speedEffect);
      
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(photoX, photoY, photoSize, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
    
    // Draw center hub
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✨', centerX, centerY + 18);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Memory Wheel', centerX, 120);
    
    ctx.font = 'italic 28px serif';
    ctx.fillStyle = '#e0e7ff';
    ctx.fillText('Spinning through your memories...', centerX, 170);
  };

  const drawCenterReveal = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, progress: number) => {
    const centerX = 960; // Use explicit values instead of canvas.width
    const centerY = 540; // Use explicit values instead of canvas.height
    
    const scale = progress * 1.5;
    const photoSize = 300 * scale;
    const glowIntensity = progress * 80;
    
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = glowIntensity;
    ctx.fillStyle = `rgba(251, 191, 36, ${progress * 0.4})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, photoSize + 80, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.globalAlpha = progress;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-180, -220, 360, 440);
    
    ctx.drawImage(img, -150, -190, 300, 360);
    
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 6;
    ctx.strokeRect(-150, -190, 300, 360);
    
    ctx.restore();
    
    if (progress > 0.5) {
      for (let i = 0; i < 15; i++) {
        const angle = (i * 24) + (progress * 360);
        const radius = 200 + Math.sin(progress * Math.PI * 2 + i) * 40;
        const x = centerX + Math.cos(angle * Math.PI / 180) * radius;
        const y = centerY + Math.sin(angle * Math.PI / 180) * radius;
        
        ctx.font = '32px Arial';
        ctx.fillStyle = `rgba(255, 255, 255, ${progress})`;
        ctx.fillText(i % 2 === 0 ? '💖' : '✨', x, y);
      }
    }
    
    if (progress > 0.7) {
      const captionProgress = (progress - 0.7) / 0.3;
      const visibleChars = Math.floor(poeticCaption.length * captionProgress);
      const visibleCaption = poeticCaption.substring(0, visibleChars);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(100, 1080 - 300, 1920 - 200, 200); // Use explicit canvas dimensions
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 32px serif';
      ctx.textAlign = 'center';
      
      const words = visibleCaption.split(' ');
      let line = '';
      let y = 1080 - 240; // Use explicit canvas dimensions
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > 1920 - 250 && n > 0) { // Use explicit canvas dimensions
          ctx.fillText(line, centerX, y);
          line = words[n] + ' ';
          y += 45;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, centerX, y);
      
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(selectedPhoto.name, centerX, 1080 - 120); // Use explicit canvas dimensions
      
      if (subjectAnalysis) {
        const subjectIcon = subjectAnalysis.type === 'people' ? '👥' : 
                           subjectAnalysis.type === 'scenery' ? '🌄' : '📦';
        ctx.font = 'italic 24px serif';
        ctx.fillStyle = '#e0e7ff';
        ctx.fillText(`${subjectIcon} ${subjectAnalysis.type} • ${Math.round(subjectAnalysis.confidence * 100)}% confidence`, centerX, 1080 - 80); // Use explicit canvas dimensions
      }
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .wheel-container {
          perspective: 1000px;
        }
        
        .wheel-photos {
          transform-style: preserve-3d;
          transition: transform 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .center-photo-reveal {
          animation: centerReveal 1s ease-out forwards;
        }
        
        @keyframes centerReveal {
          0% {
            transform: scale(0) rotate(180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(90deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        .caption-typewriter {
          animation: typewriter 2s steps(40) forwards;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid #8b5cf6;
        }
        
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        
        .floating-sparkles {
          animation: floatSparkles 3s ease-in-out infinite;
        }
        
        @keyframes floatSparkles {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .glow-effect {
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.6), 0 0 60px rgba(251, 191, 36, 0.4);
          animation: pulseGlow 2s ease-in-out infinite;
        }
        
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.6), 0 0 60px rgba(251, 191, 36, 0.4); }
          50% { box-shadow: 0 0 50px rgba(251, 191, 36, 0.8), 0 0 100px rgba(251, 191, 36, 0.6); }
        }

        .flower-petal {
          transition: all 0.3s ease;
        }
        
        .flower-petal:hover {
          transform: scale(1.1);
          z-index: 10;
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white">Memory Wheel</h2>
              <p className="text-white/70">Spin to discover contextual stories in your photos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {selectedPhoto && showCenterPhoto && (
              <button
                onClick={downloadSpinVideo}
                disabled={isGeneratingVideo}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>{isGeneratingVideo ? 'Creating MP4...' : 'Download as MP4'}</span>
              </button>
            )}
            <button
              onClick={shufflePhotos}
              disabled={spinState.isSpinning}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Shuffle className="w-5 h-5" />
              <span>Shuffle & Spin</span>
            </button>
            <button
              onClick={resetWheel}
              disabled={spinState.isSpinning}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Beautiful Flower-Shaped Memory Wheel */}
          <div className="flex flex-col items-center">
            <div className="relative mb-8 wheel-container">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-30">
                <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg"></div>
              </div>
              
              {/* Wheel Container with Flower Design */}
              <div className="relative w-96 h-96">
                {/* Base Stand */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg shadow-lg"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gradient-to-r from-amber-700 to-amber-900 rounded shadow-md"></div>
                
                {/* Stem */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-3 h-32 bg-gradient-to-b from-green-500 to-green-700 rounded-full shadow-lg"></div>
                
                {/* Outer Ring with Flower Pattern */}
                <div className="absolute inset-0 rounded-full border-8 border-gradient-to-r from-pink-400 via-purple-500 to-blue-500 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-gradient-conic from-pink-400 via-purple-500 via-blue-500 via-green-500 via-yellow-500 to-pink-400 opacity-20"></div>
                </div>
                
                {/* Photos arranged in flower petals pattern */}
                <div
                  className="wheel-photos absolute inset-0"
                  style={{
                    transform: `rotate(${spinState.rotation}deg)`,
                    transition: spinState.isSpinning ? 'none' : 'transform 0.5s ease-out'
                  }}
                >
                  {photos.slice(0, 8).map((photo, index) => {
                    const angle = (index * 45); // 8 petals, 45 degrees apart
                    const isSelected = selectedPhoto && photo.id === selectedPhoto.id && showCenterPhoto;
                    
                    return (
                      <div
                        key={photo.id}
                        className={`flower-petal absolute w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg transition-all duration-500 cursor-pointer ${
                          isSelected ? 'opacity-30 blur-sm' : 'opacity-100 hover:scale-110'
                        }`}
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-140px) rotate(-${angle}deg)`,
                          zIndex: 10
                        }}
                        onClick={() => {
                          if (!spinState.isSpinning) {
                            setSelectedPhoto(photo);
                            setShowPhotoModal(true);
                          }
                        }}
                      >
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Petal glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/20 rounded-full"></div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Center Hub with Flower Core */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl z-20 border-4 border-white">
                  <Sparkles className={`w-8 h-8 text-white ${spinState.isSpinning ? 'animate-spin' : ''}`} />
                </div>
                
                {/* Center Photo Reveal */}
                {selectedPhoto && showCenterPhoto && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                    <div className="center-photo-reveal glow-effect">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-yellow-400 shadow-2xl">
                        <img
                          src={selectedPhoto.url}
                          alt={selectedPhoto.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Floating sparkles around center photo */}
                      <div className="absolute -top-2 -left-2 floating-sparkles">✨</div>
                      <div className="absolute -top-2 -right-2 floating-sparkles" style={{ animationDelay: '0.5s' }}>💫</div>
                      <div className="absolute -bottom-2 -left-2 floating-sparkles" style={{ animationDelay: '1s' }}>⭐</div>
                      <div className="absolute -bottom-2 -right-2 floating-sparkles" style={{ animationDelay: '1.5s' }}>✨</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Enhanced Spin Button */}
              <button
                onClick={spinWheel}
                disabled={spinState.isSpinning || photos.length === 0}
                className={`w-full mt-6 p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-xl transition-all disabled:opacity-50 shadow-2xl ${
                  spinState.isSpinning ? 'animate-pulse scale-95' : 'hover:from-purple-600 hover:to-pink-600 hover:scale-105 hover:shadow-purple-500/25'
                }`}
              >
                {spinState.isSpinning ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing & spinning...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Sparkles className="w-6 h-6" />
                    <span>Spin for a Smart Memory</span>
                    <Heart className="w-6 h-6" />
                  </div>
                )}
              </button>
              
              {/* Spinning Progress */}
              {spinState.isSpinning && (
                <div className="mt-4 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-100"
                    style={{ width: `${spinState.animationProgress * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Selected Memory Display */}
          <div className="flex flex-col justify-center">
            {selectedPhoto && showCenterPhoto ? (
              <div className={`bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl ${captionAnimation ? 'caption-reveal' : ''}`}>
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-white mb-3">✨ Your Memory Speaks ✨</h3>
                  <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
                </div>
                
                <div className="aspect-square bg-white/10 rounded-2xl overflow-hidden mb-6 shadow-2xl relative cursor-pointer"
                     onClick={() => setShowPhotoModal(true)}>
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                    <div className="text-white text-center">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Click to view details</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center space-y-6">
                  {/* Subject Analysis Display */}
                  {subjectAnalysis && (
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <span className="text-2xl">
                          {subjectAnalysis.type === 'people' ? '👥' : 
                           subjectAnalysis.type === 'scenery' ? '🌄' : '📦'}
                        </span>
                        <span className="text-white font-medium capitalize">{subjectAnalysis.type} Detected</span>
                        <span className="text-blue-300 text-sm">({Math.round(subjectAnalysis.confidence * 100)}% confidence)</span>
                      </div>
                      {subjectAnalysis.faceCount > 0 && (
                        <p className="text-blue-200 text-sm">{subjectAnalysis.faceCount} face{subjectAnalysis.faceCount > 1 ? 's' : ''} detected</p>
                      )}
                    </div>
                  )}

                  {/* Poetic Caption with Typewriter Effect */}
                  <div className="relative">
                    <Quote className="w-8 h-8 text-purple-400 mx-auto mb-4 opacity-60" />
                    <div className={`${captionAnimation ? 'caption-typewriter' : ''}`}>
                      <p className="text-white text-xl italic leading-relaxed font-serif">
                        {captionAnimation ? poeticCaption : ''}
                      </p>
                    </div>
                    <Quote className="w-8 h-8 text-purple-400 mx-auto mt-4 opacity-60 transform rotate-180" />
                  </div>
                  
                  {/* Photo Details */}
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
                    <p className="text-white/90 text-lg font-medium mb-2">{selectedPhoto.name}</p>
                    <p className="text-white/70 text-sm mb-3">{selectedPhoto.uploadedAt.toLocaleDateString()}</p>
                    
                    {/* Emotional Tag */}
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium">
                      {emotionalTags[Math.floor(Math.random() * emotionalTags.length)]}
                    </div>
                    
                    {selectedPhoto.metadata?.mood && (
                      <div className="mt-3">
                        <span className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm">
                          {selectedPhoto.metadata.mood === 'happy' ? '😊' : 
                           selectedPhoto.metadata.mood === 'peaceful' ? '🕊️' : 
                           selectedPhoto.metadata.mood === 'excited' ? '🎉' : 
                           selectedPhoto.metadata.mood === 'nostalgic' ? '🌅' : '📸'} 
                          {selectedPhoto.metadata.mood}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={downloadSpinVideo}
                      disabled={isGeneratingVideo}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      <span>{isGeneratingVideo ? 'Creating...' : 'Save as MP4'}</span>
                    </button>
                    
                    <button
                      onClick={spinWheel}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Spin Again</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Spin the Flower of Smart Memories</h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Our AI analyzes each photo to detect people, scenery, or objects, then generates 
                  contextually appropriate captions. People get emotional captions, landscapes get poetic ones.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-4">
                    <span className="text-2xl mb-2 block">👥</span>
                    <p className="text-white/70">People Photos</p>
                    <p className="text-white/50 text-xs">Emotional captions</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <span className="text-2xl mb-2 block">🌄</span>
                    <p className="text-white/70">Scenery Photos</p>
                    <p className="text-white/50 text-xs">Poetic descriptions</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <span className="text-2xl mb-2 block">📦</span>
                    <p className="text-white/70">Object Photos</p>
                    <p className="text-white/50 text-xs">Thoughtful reflections</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {photos.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Photos to Spin</h3>
            <p className="text-white/60">Upload some photos to start discovering their contextual stories</p>
          </div>
        )}

        {/* Photo Detail Modal */}
        {showPhotoModal && selectedPhoto && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Memory Details</h3>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="aspect-square bg-white/10 rounded-lg overflow-hidden">
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Photo Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                        <Camera className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">{selectedPhoto.name}</p>
                          <p className="text-white/60 text-sm">{(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Upload Date</p>
                          <p className="text-white/60 text-sm">{selectedPhoto.uploadedAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                      {selectedPhoto.metadata?.environment && (
                        <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                          <MapPin className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-white font-medium">Environment</p>
                            <p className="text-white/60 text-sm capitalize">{selectedPhoto.metadata.environment}</p>
                          </div>
                        </div>
                      )}
                      {selectedPhoto.metadata?.mood && (
                        <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                          <Heart className="w-5 h-5 text-pink-400" />
                          <div>
                            <p className="text-white font-medium">Detected Mood</p>
                            <p className="text-white/60 text-sm capitalize">{selectedPhoto.metadata.mood}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {poeticCaption && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">AI Generated Caption</h4>
                      <div className="bg-white/10 rounded-lg p-4">
                        <Quote className="w-6 h-6 text-purple-400 mb-2" />
                        <p className="text-white italic leading-relaxed">"{poeticCaption}"</p>
                      </div>
                    </div>
                  )}
                  
                  {subjectAnalysis && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">AI Analysis</h4>
                      <div className="bg-white/10 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Subject Type</span>
                          <span className="text-white capitalize">{subjectAnalysis.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Confidence</span>
                          <span className="text-white">{Math.round(subjectAnalysis.confidence * 100)}%</span>
                        </div>
                        {subjectAnalysis.faceCount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">Faces Detected</span>
                            <span className="text-white">{subjectAnalysis.faceCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={downloadSpinVideo}
                      disabled={isGeneratingVideo}
                      className="flex-1 flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                    >
                      <Download className="w-5 h-5" />
                      <span>{isGeneratingVideo ? 'Creating...' : 'Download Video'}</span>
                    </button>
                    <button
                      onClick={() => setShowPhotoModal(false)}
                      className="flex-1 p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Canvas for Video Generation */}
        <canvas 
          ref={canvasRef} 
          className="hidden" 
          width="1920" 
          height="1080"
        />
      </div>
    </>
  );
};

export default MemoryWheel;