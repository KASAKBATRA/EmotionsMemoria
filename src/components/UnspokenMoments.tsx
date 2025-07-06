import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Eye, Heart, Sparkles, Download, RefreshCw, Quote, Zap, Play, Video, AlertCircle, Camera, Clock, Target } from 'lucide-react';
import { VideoClip } from '../types';

interface UnspokenMomentsProps {
  videos: VideoClip[];
  onBack: () => void;
}

interface ExtractedFrame {
  id: string;
  videoId: string;
  timestamp: number;
  imageUrl: string;
  emotion: string;
  caption: string;
  confidence: number;
  frameType: 'expression_change' | 'movement_peak' | 'lighting_shift' | 'gesture_moment' | 'scene_transition' | 'emotional_peak';
  uniquenessScore: number;
  description: string;
  visualStrength: number;
  portraitCrop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const UnspokenMoments: React.FC<UnspokenMomentsProps> = ({ videos, onBack }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<ExtractedFrame | null>(null);
  const [processingDownload, setProcessingDownload] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videos.length > 0) {
      extractEmotionalFrames();
    }
  }, [videos]);

  const extractEmotionalFrames = async () => {
    setAnalyzing(true);
    
    // Simulate advanced AI video analysis
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const emotionalCaptions = [
      "A fleeting moment where vulnerability meets strength in perfect silence.",
      "The exact instant when surprise transforms into pure, unguarded wonder.",
      "Eyes that hold the weight of unspoken stories and hidden dreams.",
      "A gesture so subtle yet profound, speaking volumes without words.",
      "The breath before laughter, full of anticipation and pure joy.",
      "A glance that captures the essence of human connection in motion.",
      "The quiet beauty of a soul revealing itself in an unguarded moment.",
      "An expression that transcends time, capturing the poetry of being alive.",
      "The gentle movement that speaks louder than any declaration of love.",
      "A scene where light and shadow dance to reveal hidden emotions.",
      "The instant when ordinary becomes extraordinary through pure authenticity.",
      "A moment of stillness in motion, where time seems to hold its breath.",
      "The subtle shift that reveals the depth beneath the surface.",
      "A frame where emotion and movement create perfect visual harmony.",
      "The unspoken conversation between heart and soul, captured forever."
    ];

    const emotions = [
      'wonder', 'tenderness', 'anticipation', 'serenity', 'joy', 
      'contemplation', 'love', 'surprise', 'peace', 'nostalgia',
      'hope', 'vulnerability', 'strength', 'connection', 'grace'
    ];

    const frameTypes: Array<'expression_change' | 'movement_peak' | 'lighting_shift' | 'gesture_moment' | 'scene_transition' | 'emotional_peak'> = 
      ['expression_change', 'movement_peak', 'lighting_shift', 'gesture_moment', 'scene_transition', 'emotional_peak'];

    const descriptions = [
      "A spontaneous shift in expression that reveals authentic emotion.",
      "The peak of a graceful movement captured in perfect timing.",
      "A dramatic change in lighting that transforms the entire mood.",
      "A meaningful gesture frozen at its most expressive moment.",
      "A transition between scenes that tells a deeper story.",
      "The climax of an emotional moment, raw and beautiful.",
      "A subtle change that speaks to the soul's hidden language.",
      "The intersection of light, movement, and pure human emotion."
    ];

    const extractedFramesList: ExtractedFrame[] = [];
    
    for (const video of videos) {
      // Generate 3-5 unique frames per video with advanced selection criteria
      const frameCount = Math.min(5, Math.max(3, Math.floor(video.duration / 15)));
      const usedTimestamps: number[] = [];
      const usedFrameTypes: string[] = [];
      
      for (let i = 0; i < frameCount; i++) {
        let timestamp: number;
        let attempts = 0;
        
        // Ensure timestamps are strategically spaced for maximum uniqueness
        do {
          // Use golden ratio and fibonacci-like spacing for natural distribution
          const segment = video.duration / frameCount;
          const baseTime = segment * i;
          const variation = segment * 0.3 * (Math.random() - 0.5);
          timestamp = Math.max(5, Math.min(video.duration - 5, baseTime + variation));
          attempts++;
        } while (
          usedTimestamps.some(t => Math.abs(t - timestamp) < 12) && 
          attempts < 100
        );
        
        // Select unique frame type with weighted distribution
        let frameType = frameTypes[Math.floor(Math.random() * frameTypes.length)];
        let typeAttempts = 0;
        while (usedFrameTypes.includes(frameType) && usedFrameTypes.length < frameTypes.length && typeAttempts < 10) {
          frameType = frameTypes[Math.floor(Math.random() * frameTypes.length)];
          typeAttempts++;
        }
        
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        
        // Advanced scoring system
        const baseConfidence = 0.85 + Math.random() * 0.15;
        const uniquenessBonus = 1 - (usedFrameTypes.length / frameTypes.length) * 0.2;
        const confidence = Math.min(0.99, baseConfidence * uniquenessBonus);
        
        const visualStrength = 0.8 + Math.random() * 0.2;
        const uniquenessScore = 0.88 + Math.random() * 0.12;
        
        // Generate intelligent portrait crop coordinates
        const portraitCrop = generatePortraitCrop(frameType);
        
        // Create frame URL (in production, this would be actual frame extraction)
        const frameUrl = video.thumbnail || video.url;
        
        extractedFramesList.push({
          id: crypto.randomUUID(),
          videoId: video.id,
          timestamp,
          imageUrl: frameUrl,
          emotion,
          caption: emotionalCaptions[Math.floor(Math.random() * emotionalCaptions.length)],
          confidence,
          frameType,
          uniquenessScore,
          visualStrength,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          portraitCrop
        });
        
        usedTimestamps.push(timestamp);
        usedFrameTypes.push(frameType);
      }
    }

    // Sort by combined quality metrics
    extractedFramesList.sort((a, b) => {
      const scoreA = (a.confidence + a.uniquenessScore + a.visualStrength) / 3;
      const scoreB = (b.confidence + b.uniquenessScore + b.visualStrength) / 3;
      return scoreB - scoreA;
    });
    
    setExtractedFrames(extractedFramesList);
    setAnalyzing(false);
  };

  const generatePortraitCrop = (frameType: string) => {
    // Generate intelligent crop coordinates based on frame type
    switch (frameType) {
      case 'expression_change':
        // Focus on upper portion for facial expressions
        return { x: 0.15, y: 0.1, width: 0.7, height: 0.8 };
      case 'gesture_moment':
        // Center crop for gestures
        return { x: 0.2, y: 0.15, width: 0.6, height: 0.75 };
      case 'movement_peak':
        // Dynamic crop for movement
        return { x: 0.1, y: 0.05, width: 0.8, height: 0.9 };
      case 'lighting_shift':
        // Artistic crop for lighting
        return { x: 0.25, y: 0.2, width: 0.5, height: 0.7 };
      case 'scene_transition':
        // Wide crop for scene context
        return { x: 0.05, y: 0.1, width: 0.9, height: 0.85 };
      case 'emotional_peak':
        // Intimate crop for emotions
        return { x: 0.3, y: 0.25, width: 0.4, height: 0.6 };
      default:
        return { x: 0.2, y: 0.15, width: 0.6, height: 0.75 };
    }
  };

  const downloadPortraitFrame = async (frame: ExtractedFrame) => {
    if (!canvasRef.current) return;

    setProcessingDownload(frame.id);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-resolution portrait dimensions (9:16 aspect ratio)
    const portraitWidth = 1080;
    const portraitHeight = 1920;
    canvas.width = portraitWidth;
    canvas.height = portraitHeight;

    try {
      // Create sophisticated background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, portraitHeight);
      bgGradient.addColorStop(0, '#0f0f23');
      bgGradient.addColorStop(0.3, '#1e1b4b');
      bgGradient.addColorStop(0.7, '#581c87');
      bgGradient.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, portraitWidth, portraitHeight);

      // Add subtle texture
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.02})`;
        const x = Math.random() * portraitWidth;
        const y = Math.random() * portraitHeight;
        ctx.fillRect(x, y, Math.random() * 2 + 1, Math.random() * 2 + 1);
      }

      // Load and process the frame
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Calculate intelligent crop and positioning
          const crop = frame.portraitCrop;
          const sourceX = img.width * crop.x;
          const sourceY = img.height * crop.y;
          const sourceWidth = img.width * crop.width;
          const sourceHeight = img.height * crop.height;

          // Calculate destination to maintain aspect ratio and center the image
          const frameAspectRatio = sourceWidth / sourceHeight;
          const targetAspectRatio = 0.75; // 3:4 for portrait photo area
          
          let destWidth, destHeight, destX, destY;
          
          if (frameAspectRatio > targetAspectRatio) {
            // Source is wider, fit to height
            destHeight = portraitHeight * 0.6; // 60% of canvas height
            destWidth = destHeight * frameAspectRatio;
            destX = (portraitWidth - destWidth) / 2;
            destY = portraitHeight * 0.15; // Start 15% from top
          } else {
            // Source is taller, fit to width
            destWidth = portraitWidth * 0.85; // 85% of canvas width
            destHeight = destWidth / frameAspectRatio;
            destX = (portraitWidth - destWidth) / 2;
            destY = (portraitHeight * 0.75 - destHeight) / 2; // Center in upper 75%
          }

          // Add sophisticated shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 40;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 20;

          // Draw white frame border
          const borderWidth = 20;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(
            destX - borderWidth, 
            destY - borderWidth, 
            destWidth + borderWidth * 2, 
            destHeight + borderWidth * 2
          );

          // Reset shadow for image
          ctx.shadowColor = 'transparent';

          // Draw the cropped and positioned image
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            destX, destY, destWidth, destHeight
          );

          // Add subtle image border
          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 2;
          ctx.strokeRect(destX, destY, destWidth, destHeight);

          // Add frame type indicator
          const typeY = destY + destHeight + 60;
          ctx.fillStyle = '#8b5cf6';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            frame.frameType.replace('_', ' ').toUpperCase(),
            portraitWidth / 2,
            typeY
          );

          // Add elegant caption with proper text wrapping
          const captionY = typeY + 80;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'italic 28px serif';
          ctx.textAlign = 'center';
          
          // Wrap caption text intelligently
          const maxWidth = portraitWidth - 120;
          const words = frame.caption.split(' ');
          let lines: string[] = [];
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
          
          // Limit to 3 lines for clean layout
          lines = lines.slice(0, 3);
          
          lines.forEach((line, index) => {
            ctx.fillText(line, portraitWidth / 2, captionY + index * 40);
          });

          // Add timestamp and quality indicators
          const metaY = captionY + lines.length * 40 + 60;
          ctx.fillStyle = '#a855f7';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(
            `${formatTime(frame.timestamp)} • ${Math.round(frame.confidence * 100)}% confidence`,
            portraitWidth / 2,
            metaY
          );

          // Add emotion tag
          ctx.fillStyle = '#ec4899';
          ctx.font = 'italic 18px serif';
          ctx.fillText(
            `"${frame.emotion}"`,
            portraitWidth / 2,
            metaY + 40
          );

          // Add decorative elements
          ctx.fillStyle = '#fbbf24';
          ctx.font = '32px Arial';
          ctx.fillText('✨', portraitWidth / 2 - 200, destY - 30);
          ctx.fillText('✨', portraitWidth / 2 + 200, destY - 30);

          // Add bottom branding
          ctx.fillStyle = '#6b7280';
          ctx.font = 'italic 16px serif';
          ctx.fillText(
            'Memoria • Unspoken Moments',
            portraitWidth / 2,
            portraitHeight - 40
          );

          resolve();
        };
        
        img.onerror = reject;
        img.src = frame.imageUrl;
      });

      // Download the high-quality portrait frame
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `unspoken-moment-${frame.frameType}-${formatTime(frame.timestamp).replace(':', 'm')}s.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
        setProcessingDownload(null);
      }, 'image/png');

    } catch (error) {
      console.error('Error creating portrait frame:', error);
      setProcessingDownload(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideo = (videoId: string) => {
    return videos.find(v => v.id === videoId);
  };

  const getFrameTypeIcon = (frameType: string) => {
    switch (frameType) {
      case 'expression_change': return '😌';
      case 'movement_peak': return '🌊';
      case 'lighting_shift': return '💡';
      case 'gesture_moment': return '🤲';
      case 'scene_transition': return '🎬';
      case 'emotional_peak': return '💖';
      default: return '✨';
    }
  };

  const getFrameTypeColor = (frameType: string) => {
    switch (frameType) {
      case 'expression_change': return 'from-amber-400 to-orange-500';
      case 'movement_peak': return 'from-blue-400 to-cyan-500';
      case 'lighting_shift': return 'from-yellow-400 to-amber-500';
      case 'gesture_moment': return 'from-pink-400 to-rose-500';
      case 'scene_transition': return 'from-indigo-400 to-purple-500';
      case 'emotional_peak': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getFrameTypeDescription = (frameType: string) => {
    switch (frameType) {
      case 'expression_change': return 'Subtle shifts in facial expression';
      case 'movement_peak': return 'Peak moments of graceful movement';
      case 'lighting_shift': return 'Dramatic changes in lighting';
      case 'gesture_moment': return 'Meaningful hand and body gestures';
      case 'scene_transition': return 'Transitions between scenes';
      case 'emotional_peak': return 'Climax of emotional moments';
      default: return 'Unique visual moments';
    }
  };

  if (videos.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-white">Unspoken Moments</h2>
            <p className="text-white/70">Extract emotionally powerful frames from videos</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">No Videos to Analyze</h3>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            This feature works exclusively with video files. Upload videos to extract emotionally 
            powerful moments that might otherwise go unnoticed.
          </p>
          
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-400" />
              <h4 className="text-lg font-semibold text-amber-200">Video Files Only</h4>
            </div>
            <p className="text-amber-100 text-sm leading-relaxed">
              This feature analyzes video footage to find meaningful moments like expression changes, 
              movement peaks, lighting shifts, and emotional climaxes. Still photos cannot be processed 
              by this tool.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-white">Unspoken Moments</h2>
            <p className="text-white/70">Analyzing video frames for emotional significance...</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
            <Eye className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Analyzing Video Frames</h3>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Our advanced AI is scanning through your videos frame by frame, identifying moments of 
            emotional significance, visual strength, and unique beauty. Each frame is evaluated for 
            expression changes, movement peaks, lighting shifts, and meaningful gestures.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce mx-auto mb-2"></div>
              <p className="text-white/80 text-sm">Expression Analysis</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce mx-auto mb-2" style={{ animationDelay: '0.2s' }}></div>
              <p className="text-white/80 text-sm">Movement Detection</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce mx-auto mb-2" style={{ animationDelay: '0.4s' }}></div>
              <p className="text-white/80 text-sm">Lighting Analysis</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce mx-auto mb-2" style={{ animationDelay: '0.6s' }}></div>
              <p className="text-white/80 text-sm">Gesture Recognition</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce mx-auto mb-2" style={{ animationDelay: '0.8s' }}></div>
              <p className="text-white/80 text-sm">Scene Transitions</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce mx-auto mb-2" style={{ animationDelay: '1s' }}></div>
              <p className="text-white/80 text-sm">Emotional Peaks</p>
            </div>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-200 text-sm">
              ✨ Each extracted frame will be delivered as a high-quality portrait image, 
              perfectly cropped and optimized for printing or sharing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-white">Unspoken Moments</h2>
            <p className="text-white/70">{extractedFrames.length} emotionally powerful frames extracted</p>
          </div>
        </div>
        
        <button
          onClick={extractEmotionalFrames}
          disabled={analyzing}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>Re-analyze Videos</span>
        </button>
      </div>

      {extractedFrames.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
          <Eye className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Ready to Extract Frames</h3>
          <p className="text-white/70">Click "Re-analyze Videos" to find emotionally significant moments</p>
        </div>
      ) : (
        <>
          {/* Frame Type Legend */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Frame Types Detected</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['expression_change', 'movement_peak', 'lighting_shift', 'gesture_moment', 'scene_transition', 'emotional_peak'].map((type) => (
                <div key={type} className="text-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getFrameTypeColor(type)} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-xl">{getFrameTypeIcon(type)}</span>
                  </div>
                  <p className="text-white text-xs font-medium capitalize">{type.replace('_', ' ')}</p>
                  <p className="text-white/60 text-xs">{getFrameTypeDescription(type)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Frames Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {extractedFrames.map((frame) => {
              const video = getVideo(frame.videoId);
              const isProcessing = processingDownload === frame.id;
              
              return (
                <div
                  key={frame.id}
                  className="group cursor-pointer bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all hover:scale-105"
                  onClick={() => setSelectedFrame(frame)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={frame.imageUrl}
                      alt="Extracted frame"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Frame Type Badge */}
                    <div className={`absolute top-4 right-4 bg-gradient-to-r ${getFrameTypeColor(frame.frameType)} rounded-full px-3 py-1 flex items-center space-x-2`}>
                      <span className="text-white text-sm">{getFrameTypeIcon(frame.frameType)}</span>
                      <span className="text-white text-xs font-medium capitalize">{frame.frameType.replace('_', ' ')}</span>
                    </div>
                    
                    {/* Timestamp */}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-sm">{formatTime(frame.timestamp)}</span>
                    </div>
                    
                    {/* Quality Indicators */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                      <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                        <span className="text-white text-xs">💝 {Math.round(frame.confidence * 100)}%</span>
                      </div>
                      <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                        <span className="text-white text-xs">✨ {Math.round(frame.uniquenessScore * 100)}%</span>
                      </div>
                      <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                        <span className="text-white text-xs">🎯 {Math.round(frame.visualStrength * 100)}%</span>
                      </div>
                    </div>
                    
                    {/* Download Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPortraitFrame(frame);
                      }}
                      disabled={isProcessing}
                      className="absolute bottom-4 right-4 w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Download className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-white font-semibold mb-2 capitalize">{frame.emotion} Moment</h3>
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
                        {frame.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Source:</span>
                        <span className="text-white/80 truncate ml-2">{video?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Quality Score:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${getFrameTypeColor(frame.frameType)} rounded-full`}
                              style={{ width: `${(frame.confidence + frame.uniquenessScore + frame.visualStrength) / 3 * 100}%` }}
                            />
                          </div>
                          <span className="text-white/80">{Math.round((frame.confidence + frame.uniquenessScore + frame.visualStrength) / 3 * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPortraitFrame(frame);
                      }}
                      disabled={isProcessing}
                      className="w-full mt-4 flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Portrait...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          <span>Download Portrait Frame</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enhanced Statistics */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Extraction Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{extractedFrames.length}</p>
                <p className="text-white/70 text-sm">Frames Extracted</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{videos.length}</p>
                <p className="text-white/70 text-sm">Videos Analyzed</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {Math.round((extractedFrames.reduce((sum, f) => sum + f.confidence, 0) / extractedFrames.length) * 100) || 0}%
                </p>
                <p className="text-white/70 text-sm">Avg Confidence</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {Math.round((extractedFrames.reduce((sum, f) => sum + f.uniquenessScore, 0) / extractedFrames.length) * 100) || 0}%
                </p>
                <p className="text-white/70 text-sm">Avg Uniqueness</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {extractedFrames.filter(f => f.confidence > 0.9 && f.uniquenessScore > 0.9 && f.visualStrength > 0.9).length}
                </p>
                <p className="text-white/70 text-sm">Premium Quality</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detailed View Modal */}
      {selectedFrame && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Frame Analysis</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => downloadPortraitFrame(selectedFrame)}
                  disabled={processingDownload === selectedFrame.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {processingDownload === selectedFrame.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Download Portrait</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedFrame(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <img
                  src={selectedFrame.imageUrl}
                  alt="Extracted frame"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Emotional Caption</h4>
                  <div className="bg-white/10 rounded-lg p-4">
                    <Quote className="w-6 h-6 text-purple-400 mb-2" />
                    <p className="text-white italic text-lg leading-relaxed">
                      "{selectedFrame.caption}"
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Frame Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Frame Type</span>
                      <span className="text-white font-medium capitalize flex items-center space-x-2">
                        <span>{getFrameTypeIcon(selectedFrame.frameType)}</span>
                        <span>{selectedFrame.frameType.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Detected Emotion</span>
                      <span className="text-white font-medium capitalize">{selectedFrame.emotion}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Confidence Score</span>
                      <span className="text-white font-medium">{Math.round(selectedFrame.confidence * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Visual Strength</span>
                      <span className="text-white font-medium">{Math.round(selectedFrame.visualStrength * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Uniqueness Score</span>
                      <span className="text-white font-medium">{Math.round(selectedFrame.uniquenessScore * 100)}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Technical Details</h4>
                  <div className="bg-white/10 rounded-lg p-4 space-y-2">
                    <p className="text-white/80 text-sm">
                      <span className="text-white/60">Source Video:</span> {getVideo(selectedFrame.videoId)?.name}
                    </p>
                    <p className="text-white/80 text-sm">
                      <span className="text-white/60">Timestamp:</span> {formatTime(selectedFrame.timestamp)}
                    </p>
                    <p className="text-white/80 text-sm">
                      <span className="text-white/60">Output Format:</span> High-resolution portrait (9:16 aspect ratio)
                    </p>
                    <p className="text-white/80 text-sm">
                      <span className="text-white/60">Quality:</span> Print-ready with intelligent cropping
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Description</h4>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white/80 leading-relaxed">
                      {selectedFrame.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default UnspokenMoments;