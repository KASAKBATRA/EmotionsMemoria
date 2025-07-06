import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Edit3, Save, X, ChevronLeft, ChevronRight, Heart, Calendar, MapPin, Users, Sparkles, Download, Move, RotateCcw, Clock } from 'lucide-react';
import { Photo } from '../types';

interface ThreadedMemoriesProps {
  photos: Photo[];
  onBack: () => void;
}

interface MemoryThread {
  id: string;
  title: string;
  description: string;
  photos: Photo[];
  createdAt: Date;
  color: string;
}

interface ThreadPhoto {
  id: string;
  photo: Photo;
  customDate?: Date;
  customCaption?: string;
  position: number;
}

const ThreadedMemories: React.FC<ThreadedMemoriesProps> = ({ photos, onBack }) => {
  const [threads, setThreads] = useState<MemoryThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MemoryThread | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [threadPhotos, setThreadPhotos] = useState<ThreadPhoto[]>([]);
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [newThread, setNewThread] = useState({
    title: '',
    description: '',
    selectedPhotos: new Set<string>()
  });
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const threadColors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500'
  ];

  const threadTemplates = [
    {
      title: 'Thread of Memories',
      description: 'The beauty found in stillness and reflection',
      emotion: 'nostalgic'
    },
    {
      title: 'Quiet Moments',
      description: 'Where time stands still and hearts speak without words',
      emotion: 'peaceful'
    },
    {
      title: 'Summer Adventures',
      description: 'Sun-soaked days and memories that will last forever',
      emotion: 'happy'
    },
    {
      title: 'Family Gatherings',
      description: 'Moments of love, laughter, and togetherness',
      emotion: 'grateful'
    },
    {
      title: 'Journey of Discovery',
      description: 'Exploring new places and discovering new perspectives',
      emotion: 'adventurous'
    }
  ];

  useEffect(() => {
    // Load existing threads from localStorage
    const savedThreads = localStorage.getItem('memoryThreads');
    if (savedThreads) {
      const parsed = JSON.parse(savedThreads).map((thread: any) => ({
        ...thread,
        createdAt: new Date(thread.createdAt),
        photos: thread.photos.map((photoId: string) => photos.find(p => p.id === photoId)).filter(Boolean)
      }));
      setThreads(parsed);
    }
  }, [photos]);

  useEffect(() => {
    if (selectedThread) {
      const initialThreadPhotos = selectedThread.photos.map((photo, index) => ({
        id: crypto.randomUUID(),
        photo,
        position: index
      }));
      setThreadPhotos(initialThreadPhotos);
    }
  }, [selectedThread]);

  const saveThreads = (newThreads: MemoryThread[]) => {
    setThreads(newThreads);
    const toSave = newThreads.map(thread => ({
      ...thread,
      photos: thread.photos.map(p => p.id)
    }));
    localStorage.setItem('memoryThreads', JSON.stringify(toSave));
  };

  const createThread = () => {
    if (!newThread.title || newThread.selectedPhotos.size === 0) return;

    const selectedPhotosArray = photos.filter(p => newThread.selectedPhotos.has(p.id));
    const thread: MemoryThread = {
      id: crypto.randomUUID(),
      title: newThread.title,
      description: newThread.description,
      photos: selectedPhotosArray,
      createdAt: new Date(),
      color: threadColors[threads.length % threadColors.length]
    };

    saveThreads([...threads, thread]);
    setNewThread({ title: '', description: '', selectedPhotos: new Set() });
    setIsCreating(false);
  };

  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(newThread.selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setNewThread({ ...newThread, selectedPhotos: newSelection });
  };

  const useTemplate = (template: typeof threadTemplates[0]) => {
    setNewThread({
      ...newThread,
      title: template.title,
      description: template.description
    });
  };

  const viewThread = (thread: MemoryThread) => {
    setSelectedThread(thread);
  };

  const handleDragStart = (e: React.DragEvent, photoId: string) => {
    setDraggedPhoto(photoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedPhoto) return;

    const draggedIndex = threadPhotos.findIndex(tp => tp.id === draggedPhoto);
    if (draggedIndex === -1) return;

    const newThreadPhotos = [...threadPhotos];
    const [draggedItem] = newThreadPhotos.splice(draggedIndex, 1);
    newThreadPhotos.splice(dropIndex, 0, draggedItem);

    // Update positions
    const updatedPhotos = newThreadPhotos.map((tp, index) => ({
      ...tp,
      position: index
    }));

    setThreadPhotos(updatedPhotos);
    setDraggedPhoto(null);
    setDragOverIndex(null);
  };

  const updatePhotoDate = (photoId: string, date: Date) => {
    setThreadPhotos(prev => prev.map(tp => 
      tp.id === photoId ? { ...tp, customDate: date } : tp
    ));
  };

  const updatePhotoCaption = (photoId: string, caption: string) => {
    setThreadPhotos(prev => prev.map(tp => 
      tp.id === photoId ? { ...tp, customCaption: caption } : tp
    ));
  };

  const downloadThreadVisualization = async () => {
    if (!selectedThread || !canvasRef.current) return;

    setIsGeneratingDownload(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isPortrait = selectedOrientation === 'portrait';
    
    // Set canvas dimensions based on orientation
    const scale = 3; // High resolution for print quality
    if (isPortrait) {
      canvas.width = 1080 * scale;  // 9:16 mobile aspect ratio
      canvas.height = 1920 * scale;
    } else {
      canvas.width = 1920 * scale;  // 16:9 landscape
      canvas.height = 1080 * scale;
    }
    
    ctx.scale(scale, scale);
    
    const canvasWidth = isPortrait ? 1080 : 1920;
    const canvasHeight = isPortrait ? 1920 : 1080;

    // Create beautiful handcrafted background with soft textured paper
    const bgGradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    bgGradient.addColorStop(0, '#fef7ed');
    bgGradient.addColorStop(0.3, '#fdf2f8');
    bgGradient.addColorStop(0.7, '#f0f9ff');
    bgGradient.addColorStop(1, '#f8fafc');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Add paper texture with subtle fibers
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.03})`;
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      ctx.fillRect(x, y, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }

    // Add subtle watercolor stains for artistic effect
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      const radius = Math.random() * 80 + 40;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 150}, 0.04)`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    // Add floating decorative elements (hearts, stars, sparkles)
    const decorativeElements = ['🌸', '✨', '🦋', '🌿', '💫', '🍃'];
    for (let i = 0; i < 15; i++) {
      ctx.font = `${Math.random() * 20 + 15}px Arial`;
      ctx.fillText(
        decorativeElements[Math.floor(Math.random() * decorativeElements.length)],
        Math.random() * canvasWidth,
        Math.random() * canvasHeight
      );
    }

    // Title at top with handwritten style
    ctx.fillStyle = '#4a5568';
    ctx.font = 'bold 64px serif';
    ctx.textAlign = 'center';
    ctx.fillText(selectedThread.title, canvasWidth / 2, 120);

    // Decorative underline with hand-drawn feel
    ctx.strokeStyle = '#8b5a3c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 200, 150);
    ctx.quadraticCurveTo(canvasWidth / 2, 155, canvasWidth / 2 + 200, 150);
    ctx.stroke();

    // Subtitle
    ctx.fillStyle = '#718096';
    ctx.font = 'italic 36px serif';
    ctx.fillText(selectedThread.description, canvasWidth / 2, 200);

    // Calculate thread layout based on photo count and orientation
    const photoCount = threadPhotos.length;
    let threadRows = 1;
    let photosPerRow = photoCount;
    
    if (isPortrait) {
      if (photoCount > 8) {
        threadRows = Math.ceil(photoCount / 4);
        photosPerRow = 4;
      } else if (photoCount > 4) {
        threadRows = 2;
        photosPerRow = Math.ceil(photoCount / 2);
      }
    } else {
      if (photoCount > 10) {
        threadRows = Math.ceil(photoCount / 6);
        photosPerRow = 6;
      } else if (photoCount > 5) {
        threadRows = 2;
        photosPerRow = Math.ceil(photoCount / 2);
      }
    }

    const startY = 280;
    const rowSpacing = isPortrait ? 400 : 350;
    const photoWidth = isPortrait ? 180 : 200;
    const photoHeight = isPortrait ? 220 : 240;

    // Load and draw photos as hanging polaroids
    const loadedImages = await Promise.all(
      threadPhotos.map(threadPhoto => {
        return new Promise<{ img: HTMLImageElement; threadPhoto: ThreadPhoto }>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve({ img, threadPhoto });
          img.onerror = reject;
          img.src = threadPhoto.photo.url;
        });
      })
    );

    // Draw each row of photos
    for (let row = 0; row < threadRows; row++) {
      const rowStartIndex = row * photosPerRow;
      const rowEndIndex = Math.min(rowStartIndex + photosPerRow, photoCount);
      const photosInRow = rowEndIndex - rowStartIndex;
      const rowPhotos = loadedImages.slice(rowStartIndex, rowEndIndex);
      
      const threadY = startY + (row * rowSpacing);
      const totalRowWidth = photosInRow * (photoWidth + 80);
      const threadStartX = (canvasWidth - totalRowWidth) / 2 + 40;
      const threadEndX = threadStartX + totalRowWidth - 80;

      // Draw the main thread/rope with natural curve and texture
      const threadMidY = threadY + 60;
      const curveDepth = Math.min(40, photosInRow * 8); // Natural droop based on photo count
      
      // Create rope texture with multiple strands for realism
      for (let strand = 0; strand < 4; strand++) {
        ctx.strokeStyle = `rgba(139, 90, 60, ${0.9 - strand * 0.15})`;
        ctx.lineWidth = 12 - strand * 2;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(threadStartX - 50, threadMidY + strand * 2);
        
        // Create natural curve with multiple control points for realistic droop
        const segments = Math.max(3, photosInRow);
        for (let i = 0; i <= segments; i++) {
          const progress = i / segments;
          const x = threadStartX - 50 + (threadEndX - threadStartX + 100) * progress;
          const curveY = threadMidY + Math.sin(progress * Math.PI) * curveDepth + strand * 2;
          
          if (i === 0) {
            ctx.moveTo(x, curveY);
          } else {
            const prevProgress = (i - 1) / segments;
            const prevX = threadStartX - 50 + (threadEndX - threadStartX + 100) * prevProgress;
            const prevY = threadMidY + Math.sin(prevProgress * Math.PI) * curveDepth + strand * 2;
            const cpX = (prevX + x) / 2;
            const cpY = (prevY + curveY) / 2 - 5;
            ctx.quadraticCurveTo(cpX, cpY, x, curveY);
          }
        }
        ctx.stroke();
      }

      // Add thread end details (knots)
      ctx.fillStyle = '#8b5a3c';
      ctx.beginPath();
      ctx.arc(threadStartX - 50, threadMidY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(threadEndX + 50, threadMidY, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Draw photos hanging on the thread
      rowPhotos.forEach(({ img, threadPhoto }, index) => {
        const photoIndex = rowStartIndex + index;
        const x = threadStartX + index * (photoWidth + 80);
        const y = threadY + 80;
        
        // Calculate thread attachment point with natural curve
        const threadProgress = index / Math.max(1, photosInRow - 1);
        const threadAttachY = threadMidY + Math.sin(threadProgress * Math.PI) * curveDepth;
        
        // Random tilt for natural, handcrafted look
        const tilt = (Math.random() - 0.5) * 0.15;
        
        ctx.save();
        ctx.translate(x + photoWidth / 2, y + photoHeight / 2);
        ctx.rotate(tilt);
        
        // Draw hanging string with realistic physics curve
        ctx.strokeStyle = '#8b5a3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -photoHeight / 2 - 80);
        
        // String curves naturally under weight
        const stringLength = 80;
        const stringCurve = 15;
        ctx.quadraticCurveTo(-stringCurve, -photoHeight / 2 - stringLength/2, 0, -photoHeight / 2 - 20);
        ctx.stroke();

        // Draw wooden clip/peg at top with realistic details
        ctx.fillStyle = '#cd853f';
        ctx.fillRect(-8, -photoHeight / 2 - 25, 16, 20);
        
        // Add clip details
        ctx.fillStyle = '#8b5a3c';
        ctx.fillRect(-6, -photoHeight / 2 - 23, 12, 3);
        ctx.fillRect(-6, -photoHeight / 2 - 15, 12, 3);
        
        // Add metallic spring detail
        ctx.strokeStyle = '#a0a0a0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -photoHeight / 2 - 18, 3, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Add clip shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(-6, -photoHeight / 2 - 20, 12, 15);

        // Draw polaroid frame with realistic shadow and aging
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetX = 12;
        ctx.shadowOffsetY = 15;
        
        // Polaroid background with slight aging
        const polaroidColors = ['#fefefe', '#fdfcfc', '#fcfbfb'];
        ctx.fillStyle = polaroidColors[Math.floor(Math.random() * polaroidColors.length)];
        ctx.fillRect(-photoWidth / 2 - 20, -photoHeight / 2 - 20, photoWidth + 40, photoHeight + 80);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        
        // Add subtle aging to polaroid edges
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(-photoWidth / 2 - 20, -photoHeight / 2 - 20, photoWidth + 40, photoHeight + 80);
        
        // Draw photo with slight inset
        const photoDisplayHeight = photoHeight - 60;
        ctx.drawImage(img, -photoWidth / 2, -photoHeight / 2, photoWidth, photoDisplayHeight);
        
        // Add photo border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(-photoWidth / 2, -photoHeight / 2, photoWidth, photoDisplayHeight);
        
        // Add handwritten-style caption
        ctx.fillStyle = '#2d3748';
        ctx.font = 'italic 18px serif';
        ctx.textAlign = 'center';
        
        const caption = threadPhoto.customCaption || `Memory ${photoIndex + 1}`;
        ctx.fillText(caption, 0, photoHeight / 2 - 35);
        
        // Add date in smaller text
        ctx.fillStyle = '#718096';
        ctx.font = '14px serif';
        const displayDate = threadPhoto.customDate || threadPhoto.photo.uploadedAt;
        ctx.fillText(displayDate.toLocaleDateString(), 0, photoHeight / 2 - 15);

        // Add decorative elements based on position
        if (photoIndex === 0) {
          // Add heart sticker to first photo
          ctx.font = '24px Arial';
          ctx.fillText('💕', -photoWidth / 2 - 15, -photoHeight / 2 - 5);
        }
        
        if (photoIndex === threadPhotos.length - 1) {
          // Add star sticker to last photo
          ctx.font = '24px Arial';
          ctx.fillText('⭐', photoWidth / 2 + 15, -photoHeight / 2 - 5);
        }

        // Add random decorative elements for charm
        if (Math.random() > 0.6) {
          const decorations = ['🌸', '🍃', '✨', '🦋', '🌿'];
          ctx.font = '16px Arial';
          ctx.fillText(
            decorations[Math.floor(Math.random() * decorations.length)],
            (Math.random() - 0.5) * (photoWidth + 60),
            (Math.random() - 0.5) * (photoHeight + 60)
          );
        }
        
        ctx.restore();
      });
    }

    // Add decorative corner flourishes
    ctx.fillStyle = '#d69e2e';
    ctx.font = '40px Arial';
    ctx.fillText('🌸', 80, 80);
    ctx.fillText('🌸', canvasWidth - 120, 80);
    ctx.fillText('🍃', 80, canvasHeight - 80);
    ctx.fillText('🍃', canvasWidth - 120, canvasHeight - 80);

    // Add creation date at bottom with handwritten style
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'italic 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Created with love on ${new Date().toLocaleDateString()}`, canvasWidth / 2, canvasHeight - 60);
    ctx.fillText('Memoria - Where Emotions Meet Memories', canvasWidth / 2, canvasHeight - 30);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `memory-thread-${selectedOrientation}-${selectedThread.title.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.click();
      }
      setIsGeneratingDownload(false);
    }, 'image/png');
  };

  if (selectedThread) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedThread(null)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white">{selectedThread.title}</h2>
              <p className="text-white/70">{selectedThread.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Orientation Toggle */}
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setSelectedOrientation('portrait')}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  selectedOrientation === 'portrait' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                📱 Portrait
              </button>
              <button
                onClick={() => setSelectedOrientation('landscape')}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  selectedOrientation === 'landscape' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                🖥️ Landscape
              </button>
            </div>
            
            <button
              onClick={downloadThreadVisualization}
              disabled={isGeneratingDownload}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>{isGeneratingDownload ? 'Creating...' : 'Download Thread'}</span>
            </button>
            <div className="text-white/70 text-sm bg-white/10 rounded-lg px-3 py-2">
              {threadPhotos.length} memories
            </div>
          </div>
        </div>

        {/* Beautiful Horizontal Timeline with Nostalgic Hanging Setup */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 rounded-3xl p-8 mb-8 border-2 border-amber-200/50 shadow-2xl overflow-hidden">
          <div 
            ref={timelineRef}
            className="relative overflow-x-auto pb-8"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#d97706 #fef3c7' }}
          >
            {/* Main Thread Line with Natural Curve */}
            <div className="relative min-w-max">
              <div className="absolute top-1/2 left-0 right-0 h-3 transform -translate-y-1/2">
                {/* Cotton rope texture with multiple strands */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 rounded-full shadow-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 rounded-full transform translate-y-0.5 opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-800 via-orange-700 to-amber-800 rounded-full transform -translate-y-0.5 opacity-60"></div>
                
                {/* Rope fiber texture */}
                <div className="absolute inset-0 opacity-30">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-px h-full bg-amber-900"
                      style={{ left: `${i * 5}%`, transform: `rotate(${(Math.random() - 0.5) * 10}deg)` }}
                    />
                  ))}
                </div>
                
                {/* Thread end knots with realistic details */}
                <div className="absolute -left-3 top-1/2 w-6 h-6 bg-amber-800 rounded-full transform -translate-y-1/2 shadow-md border-2 border-amber-900"></div>
                <div className="absolute -right-3 top-1/2 w-6 h-6 bg-amber-800 rounded-full transform -translate-y-1/2 shadow-md border-2 border-amber-900"></div>
              </div>
              
              {/* Photos hanging on thread with realistic physics */}
              <div className="flex items-center py-16 px-8 space-x-8">
                {threadPhotos.map((threadPhoto, index) => (
                  <div 
                    key={threadPhoto.id}
                    className="relative group flex-shrink-0"
                    draggable
                    onDragStart={(e) => handleDragStart(e, threadPhoto.id)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {/* Hanging string with realistic curve and physics */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-16">
                      <div className="w-0.5 h-16 bg-amber-700 rounded-full shadow-sm relative">
                        {/* String curve under weight */}
                        <div 
                          className="absolute top-0 w-0.5 h-8 bg-amber-600 rounded-full transform origin-top"
                          style={{ transform: 'rotate(2deg)' }}
                        />
                        <div 
                          className="absolute top-8 w-0.5 h-8 bg-amber-700 rounded-full transform origin-top"
                          style={{ transform: 'rotate(-1deg)' }}
                        />
                      </div>
                      {/* String attachment point */}
                      <div className="absolute -top-1 left-1/2 w-1 h-1 bg-amber-800 rounded-full transform -translate-x-1/2"></div>
                    </div>
                    
                    {/* Wooden Clip/Peg with realistic details */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="relative">
                        {/* Main clip body */}
                        <div className="w-6 h-5 bg-gradient-to-b from-yellow-700 to-yellow-800 rounded-sm shadow-md border border-yellow-900">
                          {/* Wood grain lines */}
                          <div className="absolute inset-0 opacity-30">
                            <div className="w-full h-px bg-yellow-900 mt-1"></div>
                            <div className="w-full h-px bg-yellow-900 mt-1"></div>
                            <div className="w-full h-px bg-yellow-900 mt-1"></div>
                          </div>
                        </div>
                        {/* Metal spring */}
                        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 border border-gray-500"></div>
                        {/* Clip shadow */}
                        <div className="absolute top-1 left-1 w-6 h-5 bg-black/20 rounded-sm -z-10"></div>
                      </div>
                    </div>
                    
                    {/* Polaroid frame with realistic styling and aging */}
                    <div 
                      className={`bg-white p-4 pb-8 rounded-lg shadow-2xl transform transition-all duration-300 cursor-move border border-gray-200 ${
                        dragOverIndex === index ? 'scale-105 rotate-2' : 'hover:scale-105 hover:-rotate-1'
                      } ${
                        draggedPhoto === threadPhoto.id ? 'opacity-50 scale-95' : ''
                      }`}
                      style={{
                        transform: `rotate(${(Math.random() - 0.5) * 8}deg)`,
                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                        background: `linear-gradient(135deg, #fefefe 0%, #fdfcfc 50%, #fcfbfb 100%)`
                      }}
                    >
                      {/* Photo */}
                      <div className="w-48 h-56 bg-gray-100 rounded overflow-hidden mb-3 relative">
                        <img
                          src={threadPhoto.photo.url}
                          alt={threadPhoto.photo.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Vintage photo aging effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-100/20 pointer-events-none"></div>
                        
                        {/* Edit overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => setEditingPhoto(editingPhoto === threadPhoto.id ? null : threadPhoto.id)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Caption area with handwritten style */}
                      <div className="text-center">
                        {editingPhoto === threadPhoto.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={threadPhoto.customCaption || `Memory ${index + 1}`}
                              onChange={(e) => updatePhotoCaption(threadPhoto.id, e.target.value)}
                              className="w-full text-xs text-center bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-600"
                              placeholder="Add caption..."
                              style={{ fontFamily: 'serif' }}
                            />
                            <input
                              type="date"
                              value={(threadPhoto.customDate || threadPhoto.photo.uploadedAt).toISOString().split('T')[0]}
                              onChange={(e) => updatePhotoDate(threadPhoto.id, new Date(e.target.value))}
                              className="w-full text-xs text-center bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-600"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-800 mb-1" style={{ fontFamily: 'serif' }}>
                              {threadPhoto.customCaption || `Memory ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-600" style={{ fontFamily: 'serif' }}>
                              {(threadPhoto.customDate || threadPhoto.photo.uploadedAt).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </div>
                      
                      {/* Position indicator */}
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                        {index + 1}
                      </div>
                      
                      {/* Aging spots and wear marks */}
                      <div className="absolute top-2 right-2 w-1 h-1 bg-amber-200 rounded-full opacity-60"></div>
                      <div className="absolute bottom-12 left-3 w-1 h-1 bg-amber-100 rounded-full opacity-40"></div>
                    </div>
                    
                    {/* Decorative elements with emotional context */}
                    {index === 0 && (
                      <div className="absolute -top-8 -left-8 text-2xl animate-pulse">💕</div>
                    )}
                    {index === threadPhotos.length - 1 && (
                      <div className="absolute -top-8 -right-8 text-2xl animate-pulse">⭐</div>
                    )}
                    
                    {/* Random decorative stickers for charm */}
                    {Math.random() > 0.6 && (
                      <div className="absolute -bottom-6 -left-6 text-lg opacity-80">
                        {['🌸', '🍃', '✨', '🦋', '🌿'][Math.floor(Math.random() * 5)]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Timeline Instructions with enhanced styling */}
          <div className="text-center mt-4 text-amber-800 text-sm bg-amber-100/50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-1">
                <Move className="w-4 h-4" />
                <span>Drag to reorder</span>
              </div>
              <div className="flex items-center space-x-1">
                <Edit3 className="w-4 h-4" />
                <span>Click to edit</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>Download as nostalgic scrapbook</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-amber-700 italic">
              "Each photo hangs with love, creating a timeline of treasured moments"
            </p>
          </div>
        </div>

        {/* Thread Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">{threadPhotos.length}</p>
            <p className="text-white/70 text-sm">Hanging Memories</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <Clock className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">
              {Math.round((new Date().getTime() - selectedThread.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-white/70 text-sm">Days Old</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">
              {threadPhotos.filter(tp => tp.customCaption).length}
            </p>
            <p className="text-white/70 text-sm">Custom Captions</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">{selectedOrientation === 'portrait' ? '9:16' : '16:9'}</p>
            <p className="text-white/70 text-sm">Aspect Ratio</p>
          </div>
        </div>

        {/* Hidden Canvas for Download */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCreating(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white">Create Memory Thread</h2>
              <p className="text-white/70">Weave your photos into a nostalgic hanging timeline</p>
            </div>
          </div>
          
          <button
            onClick={createThread}
            disabled={!newThread.title || newThread.selectedPhotos.size === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>Create Thread</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Thread Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Thread Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title</label>
                  <input
                    type="text"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    placeholder="Give your thread a meaningful title..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Description</label>
                  <textarea
                    value={newThread.description}
                    onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
                    placeholder="Describe the journey this thread represents..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Templates */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Nostalgic Templates</h3>
              <div className="space-y-2">
                {threadTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => useTemplate(template)}
                    className="w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-white text-sm">{template.title}</p>
                    <p className="text-white/60 text-xs italic">"{template.description}"</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-500/30">
              <h3 className="text-lg font-semibold text-white mb-4">Hanging Timeline Features</h3>
              <div className="space-y-3 text-sm text-white/80">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Curved cotton rope with natural droop</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Wooden clips with realistic details</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Polaroid frames with aging effects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Handcrafted scrapbook aesthetic</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Portrait & landscape orientations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Select Photos ({newThread.selectedPhotos.size} selected)
                </h3>
                <div className="text-white/70 text-sm">
                  Click photos to hang them on your thread
                </div>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => togglePhotoSelection(photo.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                      newThread.selectedPhotos.has(photo.id)
                        ? 'ring-2 ring-purple-500 scale-95'
                        : 'hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                    {newThread.selectedPhotos.has(photo.id) && (
                      <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {Array.from(newThread.selectedPhotos).indexOf(photo.id) + 1}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
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
            <h2 className="text-3xl font-bold text-white">Threaded Memories</h2>
            <p className="text-white/70">Create nostalgic photo hanging timelines with handcrafted charm</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create Thread</span>
        </button>
      </div>

      {threads.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Start Your First Memory Thread</h3>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Create beautiful nostalgic timelines that look like photos hanging on a clothesline. 
            Your memories will hang like Polaroids on a curved cotton rope with wooden clips, 
            creating a warm, handcrafted scrapbook experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-lg p-6">
              <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Hanging Timeline</h4>
              <p className="text-white/60 text-sm">Curved rope with natural droop</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-2">Nostalgic Charm</p>
              <p className="text-white/60 text-sm">Polaroids with wooden clips</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <Download className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Scrapbook Ready</h4>
              <p className="text-white/60 text-sm">Portrait & landscape exports</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="group cursor-pointer bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all hover:scale-105"
              onClick={() => viewThread(thread)}
            >
              {/* Thread Preview */}
              <div className="aspect-video relative overflow-hidden">
                <div className="grid grid-cols-3 h-full">
                  {thread.photos.slice(0, 3).map((photo, index) => (
                    <div key={photo.id} className="relative overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {index < 2 && (
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${thread.color} opacity-20`} />
                
                {/* Photo Count */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-sm font-medium">{thread.photos.length} photos</span>
                </div>
                
                {/* Thread indicator with hanging effect */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center">
                  <div className="flex space-x-2">
                    {Array.from({ length: Math.min(5, thread.photos.length) }).map((_, i) => (
                      <div key={i} className="relative">
                        <div className="w-1 h-4 bg-amber-600 rounded-full"></div>
                        <div className="w-3 h-3 bg-white rounded-sm shadow-sm transform -translate-x-1 -translate-y-1"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{thread.title}</h3>
                <p className="text-white/70 text-sm mb-4 line-clamp-2 italic">"{thread.description}"</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{thread.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {thread.photos.slice(0, 3).map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${thread.color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadedMemories;