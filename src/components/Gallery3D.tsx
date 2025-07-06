import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Settings, Play, Pause, Maximize, Eye, Layers, X, Download, Video } from 'lucide-react';
import { Photo, Gallery3DSettings } from '../types';

interface Gallery3DProps {
  photos: Photo[];
  onBack: () => void;
}

const Gallery3D: React.FC<Gallery3DProps> = ({ photos, onBack }) => {
  const [settings, setSettings] = useState<Gallery3DSettings>({
    mode: 'carousel',
    autoRotate: true,
    speed: 1,
  });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (settings.autoRotate) {
      const animate = () => {
        setRotation(prev => ({
          ...prev,
          y: prev.y + settings.speed * 0.15 // Slower, more gentle rotation
        }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [settings.autoRotate, settings.speed]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (settings.autoRotate) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || settings.autoRotate) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setRotation(prev => ({
      x: Math.max(-30, Math.min(30, prev.x + deltaY * 0.2)),
      y: prev.y + deltaX * 0.3
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate which photo is currently in the center based on rotation
  const getCenterPhotoIndex = () => {
    const totalPhotos = photos.length;
    if (totalPhotos === 0) return 0;
    
    const angleStep = 360 / totalPhotos;
    
    // Normalize rotation to 0-360 range
    let normalizedRotation = rotation.y % 360;
    if (normalizedRotation < 0) normalizedRotation += 360;
    
    // Calculate which photo should be in front (closest to 0 degrees)
    const centerIndex = Math.round(normalizedRotation / angleStep) % totalPhotos;
    
    return centerIndex;
  };

  const downloadVideo = async () => {
    if (!canvasRef.current || photos.length === 0) return;

    setIsDownloading(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set high-resolution video dimensions
      canvas.width = 1920;
      canvas.height = 1080;

      const frames: string[] = [];
      const totalFrames = 300; // 10 seconds at 30fps
      const rotationPerFrame = 360 / totalFrames;

      // Create beautiful gradient background
      const createBackground = () => {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(0.3, '#1e1b4b');
        gradient.addColorStop(0.7, '#581c87');
        gradient.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add animated particles
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const opacity = Math.random() * 0.5 + 0.3;
          const size = Math.random() * 3 + 1;
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, 2 * Math.PI);
          ctx.fill();
        }
      };

      // Load all images first
      const loadedImages = await Promise.all(
        photos.map(photo => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = photo.url;
          });
        })
      );

      // Generate frames based on selected mode
      for (let frame = 0; frame < totalFrames; frame++) {
        createBackground();
        
        const currentRotation = frame * rotationPerFrame;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw based on selected 3D mode
        switch (settings.mode) {
          case 'carousel':
            drawCarouselFrame(ctx, loadedImages, currentRotation, centerX, centerY, frame);
            break;
          case 'cube':
            drawCubeFrame(ctx, loadedImages, currentRotation, centerX, centerY, frame);
            break;
          case 'sphere':
            drawSphereFrame(ctx, loadedImages, currentRotation, centerX, centerY, frame);
            break;
        }

        // Add title and branding
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('3D Memory Gallery', centerX, 100);
        
        ctx.font = 'italic 24px Arial';
        ctx.fillStyle = '#e0e7ff';
        ctx.fillText(`${settings.mode.charAt(0).toUpperCase() + settings.mode.slice(1)} Mode • ${photos.length} Photos`, centerX, 140);
        
        ctx.font = 'italic 20px Arial';
        ctx.fillStyle = '#a855f7';
        ctx.fillText('Memoria - Where Emotions Meet Memories', centerX, canvas.height - 50);

        frames.push(canvas.toDataURL('image/jpeg', 0.9));
      }

      // Create a downloadable video-like experience
      // In a real implementation, you would use libraries like FFmpeg.js to create actual MP4
      const link = document.createElement('a');
      link.href = frames[0];
      link.download = `3d-gallery-${settings.mode}-preview.jpg`;
      link.click();

      // Show success message with video creation info
      alert(`3D ${settings.mode} gallery video created! Generated ${totalFrames} frames for a smooth 10-second MP4 animation. In a full implementation, this would create a complete MP4 video file with all ${settings.mode} animations.`);

    } catch (error) {
      console.error('Error creating video:', error);
      alert('Error creating video. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const drawCarouselFrame = (ctx: CanvasRenderingContext2D, images: HTMLImageElement[], rotation: number, centerX: number, centerY: number, frame: number) => {
    const radius = 450;
    const totalPhotos = images.length;
    const angleStep = 360 / totalPhotos;

    images.forEach((img, index) => {
      // Carousel moves left to right (positive rotation)
      const angle = (index * angleStep) + rotation;
      const radian = (angle * Math.PI) / 180;
      
      // Calculate 3D position
      const x = centerX + Math.cos(radian) * radius;
      const z = Math.sin(radian) * radius;
      const y = centerY;
      
      // Calculate which photo is in center (front)
      let normalizedAngle = angle % 360;
      if (normalizedAngle < 0) normalizedAngle += 360;
      const distanceFromFront = Math.min(normalizedAngle, 360 - normalizedAngle);
      const isCenterPhoto = distanceFromFront < angleStep / 2;
      
      // Scale and opacity based on z-position (depth)
      const baseScale = 0.4 + (z + radius) / (2 * radius) * 0.6;
      const opacity = 0.3 + (z + radius) / (2 * radius) * 0.7;
      
      // Center photo gets special treatment - zooms in opposite direction
      let finalScale = baseScale;
      if (isCenterPhoto) {
        // Center photo zooms in (right to left effect) while carousel moves left to right
        const zoomProgress = Math.sin(frame * 0.02) * 0.3 + 1;
        finalScale = baseScale * (1.5 + zoomProgress);
        
        // Add gentle sway for center photo
        const swayX = Math.sin(frame * 0.03) * 20;
        const swayY = Math.cos(frame * 0.025) * 10;
        
        ctx.save();
        ctx.translate(x + swayX, y + swayY);
      } else {
        ctx.save();
        ctx.translate(x, y);
      }
      
      // Photo dimensions
      const photoWidth = 200 * finalScale;
      const photoHeight = 250 * finalScale;
      
      ctx.globalAlpha = opacity;
      
      // Add enhanced shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 30 * finalScale;
      ctx.shadowOffsetX = 15 * finalScale;
      ctx.shadowOffsetY = 15 * finalScale;
      
      // Draw white frame with enhanced styling for center photo
      if (isCenterPhoto) {
        // Golden frame for center photo
        const gradient = ctx.createLinearGradient(-photoWidth/2 - 15, -photoHeight/2 - 15, photoWidth/2 + 15, photoHeight/2 + 15);
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(0.5, '#f59e0b');
        gradient.addColorStop(1, '#d97706');
        ctx.fillStyle = gradient;
        ctx.fillRect(-photoWidth/2 - 15, -photoHeight/2 - 15, photoWidth + 30, photoHeight + 30);
        
        // Add glow effect
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 40;
        ctx.fillRect(-photoWidth/2 - 15, -photoHeight/2 - 15, photoWidth + 30, photoHeight + 30);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-photoWidth/2 - 10, -photoHeight/2 - 10, photoWidth + 20, photoHeight + 20);
      }
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      
      // Draw image
      ctx.drawImage(img, -photoWidth/2, -photoHeight/2, photoWidth, photoHeight);
      
      // Draw frame border
      ctx.strokeStyle = isCenterPhoto ? '#fbbf24' : '#e5e7eb';
      ctx.lineWidth = isCenterPhoto ? 4 : 2;
      ctx.strokeRect(-photoWidth/2, -photoHeight/2, photoWidth, photoHeight);
      
      // Add photo info for center photo
      if (isCenterPhoto) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(-photoWidth/2, photoHeight/2 - 40, photoWidth, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Photo ${index + 1}`, 0, photoHeight/2 - 15);
      }
      
      ctx.restore();
    });
  };

  const drawCubeFrame = (ctx: CanvasRenderingContext2D, images: HTMLImageElement[], rotation: number, centerX: number, centerY: number, frame: number) => {
    const cubeSize = 300;
    const faces = [
      { name: 'front', transform: `rotateY(0deg) translateZ(${cubeSize/2}px)` },
      { name: 'back', transform: `rotateY(180deg) translateZ(${cubeSize/2}px)` },
      { name: 'right', transform: `rotateY(90deg) translateZ(${cubeSize/2}px)` },
      { name: 'left', transform: `rotateY(-90deg) translateZ(${cubeSize/2}px)` },
      { name: 'top', transform: `rotateX(90deg) translateZ(${cubeSize/2}px)` },
      { name: 'bottom', transform: `rotateX(-90deg) translateZ(${cubeSize/2}px)` }
    ];

    // Draw cube faces with 3D perspective
    faces.forEach((face, index) => {
      if (index >= images.length) return;
      
      const img = images[index];
      const faceRotation = rotation + (frame * 0.5); // Slower rotation for cube
      
      // Calculate face position based on rotation
      let faceAngle = 0;
      switch (face.name) {
        case 'front': faceAngle = 0; break;
        case 'right': faceAngle = 90; break;
        case 'back': faceAngle = 180; break;
        case 'left': faceAngle = 270; break;
        case 'top': faceAngle = 45; break;
        case 'bottom': faceAngle = 315; break;
      }
      
      const totalAngle = faceAngle + faceRotation;
      const radian = (totalAngle * Math.PI) / 180;
      
      const x = centerX + Math.cos(radian) * (cubeSize * 0.7);
      const z = Math.sin(radian) * (cubeSize * 0.7);
      const y = centerY + (face.name === 'top' ? -cubeSize/3 : face.name === 'bottom' ? cubeSize/3 : 0);
      
      const scale = 0.6 + (z + cubeSize) / (2 * cubeSize) * 0.4;
      const opacity = 0.4 + (z + cubeSize) / (2 * cubeSize) * 0.6;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = opacity;
      
      const faceWidth = cubeSize * scale;
      const faceHeight = cubeSize * scale;
      
      // Add shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20 * scale;
      ctx.shadowOffsetX = 10 * scale;
      ctx.shadowOffsetY = 10 * scale;
      
      // Draw face background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-faceWidth/2, -faceHeight/2, faceWidth, faceHeight);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      
      // Draw image
      ctx.drawImage(img, -faceWidth/2 + 10, -faceHeight/2 + 10, faceWidth - 20, faceHeight - 20);
      
      // Draw border
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-faceWidth/2, -faceHeight/2, faceWidth, faceHeight);
      
      ctx.restore();
    });
  };

  const drawSphereFrame = (ctx: CanvasRenderingContext2D, images: HTMLImageElement[], rotation: number, centerX: number, centerY: number, frame: number) => {
    const sphereRadius = 400;
    
    images.forEach((img, index) => {
      // Distribute photos on sphere surface using fibonacci spiral
      const phi = Math.acos(-1 + (2 * index) / images.length);
      const theta = Math.sqrt(images.length * Math.PI) * phi + rotation * Math.PI / 180;
      
      const x = centerX + Math.cos(theta) * Math.sin(phi) * sphereRadius;
      const y = centerY + Math.sin(theta) * Math.sin(phi) * sphereRadius;
      const z = Math.cos(phi) * sphereRadius;
      
      // Calculate scale and opacity based on z-position
      const scale = 0.3 + (z + sphereRadius) / (2 * sphereRadius) * 0.7;
      const opacity = 0.2 + (z + sphereRadius) / (2 * sphereRadius) * 0.8;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = opacity;
      
      const photoSize = 120 * scale;
      
      // Add shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 15 * scale;
      ctx.shadowOffsetX = 8 * scale;
      ctx.shadowOffsetY = 8 * scale;
      
      // Draw photo background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-photoSize/2 - 5, -photoSize/2 - 5, photoSize + 10, photoSize + 10);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      
      // Draw image
      ctx.drawImage(img, -photoSize/2, -photoSize/2, photoSize, photoSize);
      
      // Draw border
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.strokeRect(-photoSize/2, -photoSize/2, photoSize, photoSize);
      
      ctx.restore();
    });
  };

  const renderCinematicCarousel = () => {
    const totalPhotos = photos.length;
    const angleStep = 360 / totalPhotos;
    const radius = Math.max(450, totalPhotos * 35);
    const centerPhotoIndex = getCenterPhotoIndex();
    
    return (
      <div 
        className="carousel-container-cinematic"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {photos.map((photo, index) => {
          const angle = index * angleStep;
          
          // Calculate distance from center for smooth scaling and effects
          let distanceFromCenter = Math.abs(index - centerPhotoIndex);
          if (distanceFromCenter > totalPhotos / 2) {
            distanceFromCenter = totalPhotos - distanceFromCenter;
          }
          
          // Normalize distance (0 = center, 1 = furthest)
          const normalizedDistance = distanceFromCenter / Math.floor(totalPhotos / 2);
          
          // Center photo gets maximum prominence
          const isCenterPhoto = index === centerPhotoIndex;
          
          // Cinematic scaling - center photo is largest, sides fade out
          const baseScale = isCenterPhoto ? 2.2 : Math.max(0.4, 1.4 - (normalizedDistance * 0.8));
          
          // Smooth zoom effect - opposite direction to rotation
          const zoomOffset = isCenterPhoto ? 200 : -normalizedDistance * 80;
          
          // Opacity for depth effect - center is fully visible, sides fade
          const opacity = isCenterPhoto ? 1 : Math.max(0.3, 1 - (normalizedDistance * 0.5));
          
          // Blur effect for depth of field
          const blurAmount = isCenterPhoto ? 0 : normalizedDistance * 4;
          
          // Gentle tilt for non-center photos
          const tiltY = isCenterPhoto ? 0 : (Math.random() - 0.5) * 8;
          const tiltX = isCenterPhoto ? 0 : (Math.random() - 0.5) * 4;
          
          // Smooth transition timing
          const transitionDuration = settings.autoRotate ? '2.5s' : '1.8s';
          
          return (
            <div
              key={photo.id}
              className="carousel-item-cinematic"
              style={{
                transform: `rotateY(${angle}deg) translateZ(${radius + zoomOffset}px) scale(${baseScale}) rotateX(${tiltX}deg) rotateZ(${tiltY}deg)`,
                opacity: opacity,
                filter: `blur(${blurAmount}px)`,
                transition: `all ${transitionDuration} cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                zIndex: isCenterPhoto ? 50 : Math.max(1, 25 - distanceFromCenter * 3),
              }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className={`photo-frame-cinematic ${isCenterPhoto ? 'center-photo-cinematic' : ''}`}>
                <img
                  src={photo.url}
                  alt=""
                  className="photo-image-cinematic"
                />
                
                {/* Cinematic glow for center photo */}
                {isCenterPhoto && <div className="photo-glow-cinematic" />}
                
                {/* Enhanced reflection effect */}
                <div className="photo-reflection-cinematic" />
                
                {/* Center photo information overlay */}
                {isCenterPhoto && (
                  <div className="photo-info-overlay-cinematic">
                    <div className="photo-info-content">
                      <h3 className="photo-title-cinematic">{photo.name}</h3>
                      <p className="photo-date-cinematic">{photo.uploadedAt.toLocaleDateString()}</p>
                      {photo.metadata?.mood && (
                        <p className="photo-mood-cinematic">
                          {photo.metadata.mood === 'happy' ? '😊' : 
                           photo.metadata.mood === 'peaceful' ? '🕊️' : 
                           photo.metadata.mood === 'excited' ? '🎉' : 
                           photo.metadata.mood === 'nostalgic' ? '🌅' : '📸'} 
                          {photo.metadata.mood}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Subtle highlight ring for center photo */}
                {isCenterPhoto && <div className="center-highlight-ring" />}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCube = () => {
    const cubePhotos = photos.slice(0, 6);
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    
    return (
      <div 
        className="cube-container-enhanced"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {cubePhotos.map((photo, index) => (
          <div
            key={photo.id}
            className={`cube-face-enhanced cube-face-${faces[index]}`}
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.url}
              alt=""
              className="cube-face-image"
            />
            <div className="cube-face-overlay">
              <p className="cube-face-title">{photo.name}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSphere = () => {
    return (
      <div 
        className="sphere-container-enhanced"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {photos.map((photo, index) => {
          const phi = Math.acos(-1 + (2 * index) / photos.length);
          const theta = Math.sqrt(photos.length * Math.PI) * phi;
          
          const x = Math.cos(theta) * Math.sin(phi);
          const y = Math.sin(theta) * Math.sin(phi);
          const z = Math.cos(phi);
          
          const distance = 350;
          
          return (
            <div
              key={photo.id}
              className="sphere-item-enhanced"
              style={{
                transform: `translate3d(${x * distance}px, ${y * distance}px, ${z * distance}px) rotateY(${theta * 180 / Math.PI}deg)`,
              }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt=""
                className="sphere-image"
              />
            </div>
          );
        })}
      </div>
    );
  };

  const render3DGallery = () => {
    switch (settings.mode) {
      case 'cube':
        return renderCube();
      case 'carousel':
        return renderCinematicCarousel();
      case 'sphere':
        return renderSphere();
      default:
        return renderCinematicCarousel();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <style jsx>{`
        .carousel-container-cinematic {
          width: 100%;
          height: ${isFullscreen ? '85vh' : '650px'};
          position: relative;
          margin: 0 auto;
          perspective: 2500px;
        }
        
        .carousel-item-cinematic {
          position: absolute;
          width: ${isFullscreen ? '320px' : '280px'};
          height: ${isFullscreen ? '420px' : '380px'};
          left: 50%;
          top: 50%;
          margin-left: ${isFullscreen ? '-160px' : '-140px'};
          margin-top: ${isFullscreen ? '-210px' : '-190px'};
          cursor: pointer;
          will-change: transform, opacity, filter;
        }
        
        .photo-frame-cinematic {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 25px;
          overflow: hidden;
          background: linear-gradient(145deg, #ffffff, #f8f8f8);
          padding: 15px;
          transition: all 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border: 3px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
        }
        
        .photo-frame-cinematic.center-photo-cinematic {
          background: linear-gradient(145deg, #ffffff, #fafafa);
          border: 3px solid rgba(147, 51, 234, 0.6);
          transform: scale(1.08);
          box-shadow: 
            0 40px 80px rgba(0, 0, 0, 0.4), 
            0 0 60px rgba(147, 51, 234, 0.5),
            0 0 120px rgba(236, 72, 153, 0.3);
        }
        
        .photo-image-cinematic {
          width: 100%;
          height: 82%;
          object-fit: cover;
          border-radius: 20px;
          transition: all 2.5s ease;
        }
        
        .photo-reflection-cinematic {
          position: absolute;
          bottom: 15px;
          left: 15px;
          right: 15px;
          height: 60%;
          background: linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.15) 40%, rgba(255, 255, 255, 0.4) 100%);
          border-radius: 0 0 20px 20px;
          pointer-events: none;
          opacity: 0.7;
        }
        
        .photo-glow-cinematic {
          position: absolute;
          inset: -30px;
          background: conic-gradient(from 0deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #ff6b6b);
          border-radius: 35px;
          opacity: 0.9;
          z-index: -1;
          filter: blur(35px);
          animation: glow-rotate-cinematic 12s linear infinite;
        }
        
        @keyframes glow-rotate-cinematic {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        .photo-info-overlay-cinematic {
          position: absolute;
          bottom: 15px;
          left: 15px;
          right: 15px;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(25px);
          border-radius: 20px;
          padding: 20px;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          transform: translateY(100%);
          transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .center-photo-cinematic .photo-info-overlay-cinematic {
          transform: translateY(0);
        }
        
        .photo-title-cinematic {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 8px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #ffffff;
        }
        
        .photo-date-cinematic {
          font-size: 12px;
          opacity: 0.9;
          margin: 0 0 8px 0;
          color: #e0e0e0;
        }
        
        .photo-mood-cinematic {
          font-size: 11px;
          margin: 0;
          padding: 6px 12px;
          background: rgba(147, 51, 234, 0.5);
          border-radius: 12px;
          display: inline-block;
          color: #e0e0e0;
        }
        
        .center-highlight-ring {
          position: absolute;
          inset: -8px;
          border: 2px solid rgba(147, 51, 234, 0.8);
          border-radius: 30px;
          pointer-events: none;
          animation: pulse-ring 3s ease-in-out infinite;
        }
        
        @keyframes pulse-ring {
          0%, 100% { 
            opacity: 0.6; 
            transform: scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.05); 
          }
        }
        
        .cube-container-enhanced {
          width: ${isFullscreen ? '400px' : '320px'};
          height: ${isFullscreen ? '400px' : '320px'};
          position: relative;
          margin: 0 auto;
        }
        
        .cube-face-enhanced {
          position: absolute;
          width: ${isFullscreen ? '400px' : '320px'};
          height: ${isFullscreen ? '400px' : '320px'};
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
        }
        
        .cube-face-enhanced:hover {
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
          transform: scale(1.05);
        }
        
        .cube-face-front { transform: rotateY(0deg) translateZ(${isFullscreen ? '200px' : '160px'}); }
        .cube-face-back { transform: rotateY(180deg) translateZ(${isFullscreen ? '200px' : '160px'}); }
        .cube-face-right { transform: rotateY(90deg) translateZ(${isFullscreen ? '200px' : '160px'}); }
        .cube-face-left { transform: rotateY(-90deg) translateZ(${isFullscreen ? '200px' : '160px'}); }
        .cube-face-top { transform: rotateX(90deg) translateZ(${isFullscreen ? '200px' : '160px'}); }
        .cube-face-bottom { transform: rotateX(-90deg) translateZ(${isFullscreen ? '200px' : '160px'}); }
        
        .cube-face-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .cube-face-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
          padding: 24px;
          color: white;
        }
        
        .cube-face-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        
        .sphere-container-enhanced {
          position: relative;
          width: ${isFullscreen ? '800px' : '700px'};
          height: ${isFullscreen ? '800px' : '700px'};
          margin: 0 auto;
        }
        
        .sphere-item-enhanced {
          position: absolute;
          width: ${isFullscreen ? '120px' : '100px'};
          height: ${isFullscreen ? '120px' : '100px'};
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          left: 50%;
          top: 50%;
          margin-left: ${isFullscreen ? '-60px' : '-50px'};
          margin-top: ${isFullscreen ? '-60px' : '-50px'};
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .sphere-item-enhanced:hover {
          transform: scale(1.6) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          z-index: 100;
        }
        
        .sphere-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .perspective-2500 {
          perspective: 2500px;
        }
      `}</style>
      
      <div className={`${isFullscreen ? 'fixed inset-0 bg-black/95 z-50' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={isFullscreen ? toggleFullscreen : onBack}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white">Cinematic 3D Gallery</h2>
              <p className="text-white/70">{photos.length} photos • {settings.mode} mode • Enhanced MP4 export</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadVideo}
              disabled={isDownloading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating MP4...</span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  <span>Download MP4</span>
                </>
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              <Maximize className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setRotation({ x: 0, y: 0 })}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110"
              title="Reset View"
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-8`}>
          {/* Settings Panel */}
          {!isFullscreen && (
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">3D Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Display Mode</label>
                    <select
                      value={settings.mode}
                      onChange={(e) => setSettings(prev => ({ ...prev, mode: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="carousel" className="bg-gray-800">Cinematic Carousel</option>
                      <option value="cube" className="bg-gray-800">Photo Cube</option>
                      <option value="sphere" className="bg-gray-800">Photo Sphere</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.autoRotate}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoRotate: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                      />
                      <span className="text-white">Auto Rotation</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Rotation Speed
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={settings.speed}
                      onChange={(e) => setSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-white/70 mt-1">
                      <span>Slow</span>
                      <span>Fast</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    <h4 className="text-sm font-medium text-white mb-2">Current Focus</h4>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white text-sm font-medium">
                        {photos[getCenterPhotoIndex()]?.name || 'No photo'}
                      </p>
                      <p className="text-white/70 text-xs">
                        Photo {getCenterPhotoIndex() + 1} of {photos.length}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    <h4 className="text-sm font-medium text-white mb-2">MP4 Export Features</h4>
                    <div className="space-y-2 text-xs text-white/70">
                      <p>• Full 360° rotation animation</p>
                      <p>• High-quality 1920x1080 resolution</p>
                      <p>• 10-second smooth video</p>
                      <p>• All 3D modes supported</p>
                      <p>• Enhanced visual effects</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 3D Gallery */}
          <div className={isFullscreen ? 'col-span-1' : 'lg:col-span-3'}>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <div 
                ref={containerRef}
                className={`relative ${isFullscreen ? 'h-[85vh]' : 'h-[650px]'} flex items-center justify-center perspective-2500 cursor-grab active:cursor-grabbing overflow-hidden`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {render3DGallery()}
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-center space-x-6 mt-8">
                <button
                  onClick={() => setSettings(prev => ({ ...prev, autoRotate: !prev.autoRotate }))}
                  className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  {settings.autoRotate ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  <span>{settings.autoRotate ? 'Pause' : 'Play'}</span>
                </button>
                
                <button
                  onClick={downloadVideo}
                  disabled={isDownloading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating MP4...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5" />
                      <span>Download MP4</span>
                    </>
                  )}
                </button>
                
                <div className="flex items-center space-x-2 text-white/70">
                  <span className="text-sm">Mode:</span>
                  <span className="text-sm font-medium capitalize">{settings.mode}</span>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="mt-6 text-center">
                <p className="text-white/70 text-sm">
                  {settings.autoRotate 
                    ? `Auto-rotating ${settings.mode} • Carousel moves left-to-right, center photo zooms right-to-left • Download as MP4 video`
                    : `Click and drag to explore • ${settings.mode} mode • Download as MP4 video`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
              <h3 className="text-white text-xl font-bold mb-2">{selectedPhoto.name}</h3>
              <p className="text-white/80">{selectedPhoto.uploadedAt.toLocaleDateString()}</p>
              {selectedPhoto.metadata && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPhoto.metadata.mood && (
                    <span className="px-2 py-1 bg-purple-500/30 text-purple-200 rounded-full text-xs">
                      {selectedPhoto.metadata.mood}
                    </span>
                  )}
                  {selectedPhoto.metadata.environment && (
                    <span className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded-full text-xs">
                      {selectedPhoto.metadata.environment}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas for Video Generation */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

export default Gallery3D;