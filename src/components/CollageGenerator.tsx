import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, RefreshCw, Grid, Layers, Camera, Newspaper, Sparkles, Palette, Wand2, Settings, Shuffle, Heart, Star, CheckSquare, Square, RotateCcw, Move, ZoomIn, ZoomOut, ChevronUp, ChevronDown, Eye, EyeOff, Lock, Unlock, Type, Plus, Edit3, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, X } from 'lucide-react';
import { Photo, CollageLayout } from '../types';

interface CollageGeneratorProps {
  photos: Photo[];
  onBack: () => void;
}

interface CollageStyle {
  id: string;
  name: string;
  description: string;
  template: 'grid' | 'overlapping' | 'polaroid' | 'heart' | 'freeform';
}

interface CollagePhoto {
  id: string;
  photo: Photo;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  opacity: number;
  shadow: boolean;
}

interface DragState {
  isDragging: boolean;
  draggedItemId: string | null;
  draggedItemType: 'photo' | 'text' | null;
  dragOffset: { x: number; y: number };
  startPosition: { x: number; y: number };
}

interface CollageSettings {
  spacing: number;
  borderWidth: number;
  shadowIntensity: number;
  backgroundColor: string;
  borderRadius: number;
  canvasWidth: number;
  canvasHeight: number;
}

const CollageGenerator: React.FC<CollageGeneratorProps> = ({ photos, onBack }) => {
  const [selectedStyle, setSelectedStyle] = useState<CollageStyle | null>(null);
  const [collagePhotos, setCollagePhotos] = useState<CollagePhoto[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectedCollagePhoto, setSelectedCollagePhoto] = useState<string | null>(null);
  const [selectedTextElement, setSelectedTextElement] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItemId: null,
    draggedItemType: null,
    dragOffset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 }
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [generatedCollage, setGeneratedCollage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingText, setEditingText] = useState<TextElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const collageCanvasRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<CollageSettings>({
    spacing: 20,
    borderWidth: 8,
    shadowIntensity: 30,
    backgroundColor: '#f8f4e6',
    borderRadius: 15,
    canvasWidth: 800,
    canvasHeight: 600
  });

  const styles: CollageStyle[] = [
    {
      id: 'grid',
      name: 'Classic Grid',
      description: 'Organized grid layout with equal spacing',
      template: 'grid'
    },
    {
      id: 'overlapping',
      name: 'Overlapping Layers',
      description: 'Artistic overlapping with depth',
      template: 'overlapping'
    },
    {
      id: 'polaroid',
      name: 'Scattered Polaroids',
      description: 'Vintage polaroid style with rotation',
      template: 'polaroid'
    },
    {
      id: 'heart',
      name: 'Heart Shape',
      description: 'Photos arranged in a heart pattern',
      template: 'heart'
    },
    {
      id: 'freeform',
      name: 'Freeform Canvas',
      description: 'Complete creative freedom with manual positioning',
      template: 'freeform'
    }
  ];

  const fontFamilies = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
    { value: 'Impact, sans-serif', label: 'Impact' },
    { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Brush Script MT, cursive', label: 'Brush Script' }
  ];

  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
  ];

  // Face detection simulation
  const detectFaces = useCallback((photo: Photo) => {
    return {
      faces: photo.metadata?.faces || Math.floor(Math.random() * 3),
      faceRegions: [
        { x: 0.3, y: 0.2, width: 0.4, height: 0.5 }
      ]
    };
  }, []);

  // Check for face overlap
  const checkFaceOverlap = useCallback((photo1: CollagePhoto, photo2: CollagePhoto) => {
    const face1 = detectFaces(photo1.photo);
    const face2 = detectFaces(photo2.photo);
    
    if (face1.faces === 0 || face2.faces === 0) return false;
    
    const overlap = !(
      photo1.x + photo1.width < photo2.x ||
      photo2.x + photo2.width < photo1.x ||
      photo1.y + photo1.height < photo2.y ||
      photo2.y + photo2.height < photo1.y
    );
    
    return overlap;
  }, [detectFaces]);

  // Auto-arrange photos based on selected style
  const autoArrangePhotos = useCallback(() => {
    if (!selectedStyle || selectedPhotos.size === 0) return;

    const selectedPhotoArray = photos.filter(p => selectedPhotos.has(p.id));
    const newCollagePhotos: CollagePhoto[] = [];
    
    const canvasWidth = settings.canvasWidth;
    const canvasHeight = settings.canvasHeight;
    
    switch (selectedStyle.template) {
      case 'grid':
        const cols = Math.ceil(Math.sqrt(selectedPhotoArray.length));
        const rows = Math.ceil(selectedPhotoArray.length / cols);
        const cellWidth = (canvasWidth - settings.spacing * (cols + 1)) / cols;
        const cellHeight = (canvasHeight - settings.spacing * (rows + 1)) / rows;
        
        selectedPhotoArray.forEach((photo, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          newCollagePhotos.push({
            id: crypto.randomUUID(),
            photo,
            x: settings.spacing + col * (cellWidth + settings.spacing),
            y: settings.spacing + row * (cellHeight + settings.spacing),
            width: cellWidth,
            height: cellHeight,
            rotation: 0,
            zIndex: index,
            locked: false,
            visible: true
          });
        });
        break;
        
      case 'overlapping':
        selectedPhotoArray.forEach((photo, index) => {
          const baseSize = Math.min(canvasWidth, canvasHeight) * 0.4;
          const variation = 0.3;
          const size = baseSize * (1 + (Math.random() - 0.5) * variation);
          
          newCollagePhotos.push({
            id: crypto.randomUUID(),
            photo,
            x: Math.random() * (canvasWidth - size),
            y: Math.random() * (canvasHeight - size),
            width: size,
            height: size,
            rotation: (Math.random() - 0.5) * 30,
            zIndex: index,
            locked: false,
            visible: true
          });
        });
        break;
        
      case 'polaroid':
        selectedPhotoArray.forEach((photo, index) => {
          const polaroidWidth = 200;
          const polaroidHeight = 240;
          
          newCollagePhotos.push({
            id: crypto.randomUUID(),
            photo,
            x: Math.random() * (canvasWidth - polaroidWidth),
            y: Math.random() * (canvasHeight - polaroidHeight),
            width: polaroidWidth,
            height: polaroidHeight,
            rotation: (Math.random() - 0.5) * 45,
            zIndex: index,
            locked: false,
            visible: true
          });
        });
        break;
        
      case 'heart':
        selectedPhotoArray.forEach((photo, index) => {
          const t = (index / selectedPhotoArray.length) * 2 * Math.PI;
          const heartSize = Math.min(canvasWidth, canvasHeight) * 0.3;
          const x = canvasWidth / 2 + heartSize * (16 * Math.pow(Math.sin(t), 3)) / 16;
          const y = canvasHeight / 2 - heartSize * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 16;
          
          newCollagePhotos.push({
            id: crypto.randomUUID(),
            photo,
            x: x - 50,
            y: y - 50,
            width: 100,
            height: 100,
            rotation: 0,
            zIndex: index,
            locked: false,
            visible: true
          });
        });
        break;
        
      case 'freeform':
        selectedPhotoArray.forEach((photo, index) => {
          const size = 150 + Math.random() * 100;
          
          newCollagePhotos.push({
            id: crypto.randomUUID(),
            photo,
            x: Math.random() * (canvasWidth - size),
            y: Math.random() * (canvasHeight - size),
            width: size,
            height: size,
            rotation: 0,
            zIndex: index,
            locked: false,
            visible: true
          });
        });
        break;
    }
    
    setCollagePhotos(newCollagePhotos);
  }, [selectedStyle, selectedPhotos, photos, settings]);

  // Handle photo selection
  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
      setCollagePhotos(prev => prev.filter(cp => cp.photo.id !== photoId));
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
  };

  // Add new text element
  const addTextElement = () => {
    const newText: TextElement = {
      id: crypto.randomUUID(),
      text: 'Your Text Here',
      x: settings.canvasWidth / 2 - 100,
      y: settings.canvasHeight / 2 - 25,
      fontSize: 32,
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
      rotation: 0,
      zIndex: Math.max(...[...collagePhotos, ...textElements].map(item => item.zIndex), 0) + 1,
      locked: false,
      visible: true,
      backgroundColor: 'transparent',
      padding: 10,
      borderRadius: 0,
      opacity: 1,
      shadow: false
    };
    
    setTextElements(prev => [...prev, newText]);
    setSelectedTextElement(newText.id);
    setEditingText(newText);
    setShowTextEditor(true);
  };

  // Enhanced drag handlers for both photos and text
  const handleMouseDown = (e: React.MouseEvent, itemId: string, itemType: 'photo' | 'text') => {
    e.preventDefault();
    e.stopPropagation();
    
    const item = itemType === 'photo' 
      ? collagePhotos.find(cp => cp.id === itemId)
      : textElements.find(te => te.id === itemId);
    
    if (!item || item.locked) return;

    const rect = collageCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX;
    const clientY = e.clientY;
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    // Bring to front when starting to drag
    if (itemType === 'photo') {
      bringPhotoToFront(itemId);
      setSelectedCollagePhoto(itemId);
      setSelectedTextElement(null);
    } else {
      bringTextToFront(itemId);
      setSelectedTextElement(itemId);
      setSelectedCollagePhoto(null);
    }
    
    setDragState({
      isDragging: true,
      draggedItemId: itemId,
      draggedItemType: itemType,
      dragOffset: {
        x: canvasX - item.x,
        y: canvasY - item.y
      },
      startPosition: {
        x: item.x,
        y: item.y
      }
    });

    document.body.style.cursor = 'grabbing';
  };

  // Handle drag movement with bounds checking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedItemId || !collageCanvasRef.current) return;

    const rect = collageCanvasRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    const newX = canvasX - dragState.dragOffset.x;
    const newY = canvasY - dragState.dragOffset.y;

    if (dragState.draggedItemType === 'photo') {
      setCollagePhotos(prev => prev.map(cp => {
        if (cp.id === dragState.draggedItemId) {
          const constrainedX = Math.max(0, Math.min(newX, settings.canvasWidth - cp.width));
          const constrainedY = Math.max(0, Math.min(newY, settings.canvasHeight - cp.height));
          
          return { ...cp, x: constrainedX, y: constrainedY };
        }
        return cp;
      }));
    } else {
      setTextElements(prev => prev.map(te => {
        if (te.id === dragState.draggedItemId) {
          const constrainedX = Math.max(0, Math.min(newX, settings.canvasWidth - 100));
          const constrainedY = Math.max(0, Math.min(newY, settings.canvasHeight - 50));
          
          return { ...te, x: constrainedX, y: constrainedY };
        }
        return te;
      }));
    }
  }, [dragState, settings]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        draggedItemId: null,
        draggedItemType: null,
        dragOffset: { x: 0, y: 0 },
        startPosition: { x: 0, y: 0 }
      });
      
      document.body.style.cursor = 'default';
    }
    setIsResizing(false);
    setResizeHandle('');
  }, [dragState.isDragging]);

  // Touch event handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent, itemId: string, itemType: 'photo' | 'text') => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    handleMouseDown(mouseEvent as any, itemId, itemType);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragState.isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    handleMouseMove(mouseEvent);
  }, [dragState.isDragging, handleMouseMove]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  }, [handleMouseUp]);

  // Event listeners setup
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Layer management for photos
  const bringPhotoToFront = (collagePhotoId: string) => {
    const maxZ = Math.max(...[...collagePhotos, ...textElements].map(item => item.zIndex));
    setCollagePhotos(prev => prev.map(cp => 
      cp.id === collagePhotoId ? { ...cp, zIndex: maxZ + 1 } : cp
    ));
  };

  const sendPhotoToBack = (collagePhotoId: string) => {
    const minZ = Math.min(...[...collagePhotos, ...textElements].map(item => item.zIndex));
    setCollagePhotos(prev => prev.map(cp => 
      cp.id === collagePhotoId ? { ...cp, zIndex: minZ - 1 } : cp
    ));
  };

  // Layer management for text
  const bringTextToFront = (textId: string) => {
    const maxZ = Math.max(...[...collagePhotos, ...textElements].map(item => item.zIndex));
    setTextElements(prev => prev.map(te => 
      te.id === textId ? { ...te, zIndex: maxZ + 1 } : te
    ));
  };

  const sendTextToBack = (textId: string) => {
    const minZ = Math.min(...[...collagePhotos, ...textElements].map(item => item.zIndex));
    setTextElements(prev => prev.map(te => 
      te.id === textId ? { ...te, zIndex: minZ - 1 } : te
    ));
  };

  // Update text element
  const updateTextElement = (textId: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(te => 
      te.id === textId ? { ...te, ...updates } : te
    ));
  };

  // Delete text element
  const deleteTextElement = (textId: string) => {
    setTextElements(prev => prev.filter(te => te.id !== textId));
    if (selectedTextElement === textId) {
      setSelectedTextElement(null);
    }
    if (editingText?.id === textId) {
      setEditingText(null);
      setShowTextEditor(false);
    }
  };

  // Generate final collage with text
  const generateCollage = async () => {
    if (!canvasRef.current || (collagePhotos.length === 0 && textElements.length === 0)) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = settings.canvasWidth * 2;
    canvas.height = settings.canvasHeight * 2;
    const scale = 2;

    // Background
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Combine and sort all elements by z-index
    const allElements = [
      ...collagePhotos.filter(cp => cp.visible).map(cp => ({ ...cp, type: 'photo' as const })),
      ...textElements.filter(te => te.visible).map(te => ({ ...te, type: 'text' as const }))
    ].sort((a, b) => a.zIndex - b.zIndex);

    // Draw all elements
    for (const element of allElements) {
      if (element.type === 'photo') {
        const collagePhoto = element as CollagePhoto & { type: 'photo' };
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.save();
            
            const centerX = (collagePhoto.x + collagePhoto.width / 2) * scale;
            const centerY = (collagePhoto.y + collagePhoto.height / 2) * scale;
            
            ctx.translate(centerX, centerY);
            ctx.rotate((collagePhoto.rotation * Math.PI) / 180);
            
            if (settings.shadowIntensity > 0) {
              ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
              ctx.shadowBlur = settings.shadowIntensity;
              ctx.shadowOffsetX = 8;
              ctx.shadowOffsetY = 8;
            }
            
            if (settings.borderWidth > 0) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(
                -collagePhoto.width * scale / 2 - settings.borderWidth,
                -collagePhoto.height * scale / 2 - settings.borderWidth,
                collagePhoto.width * scale + settings.borderWidth * 2,
                collagePhoto.height * scale + settings.borderWidth * 2
              );
            }
            
            ctx.shadowColor = 'transparent';
            ctx.drawImage(
              img,
              -collagePhoto.width * scale / 2,
              -collagePhoto.height * scale / 2,
              collagePhoto.width * scale,
              collagePhoto.height * scale
            );
            
            ctx.restore();
            resolve();
          };
          
          img.src = collagePhoto.photo.url;
        });
      } else {
        const textElement = element as TextElement & { type: 'text' };
        
        ctx.save();
        
        const centerX = (textElement.x + 100) * scale; // Approximate text width
        const centerY = (textElement.y + textElement.fontSize / 2) * scale;
        
        ctx.translate(centerX, centerY);
        ctx.rotate((textElement.rotation * Math.PI) / 180);
        
        // Background
        if (textElement.backgroundColor !== 'transparent') {
          ctx.fillStyle = textElement.backgroundColor;
          const padding = textElement.padding * scale;
          const textWidth = ctx.measureText(textElement.text).width;
          const textHeight = textElement.fontSize * scale;
          
          if (textElement.borderRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(
              -textWidth / 2 - padding,
              -textHeight / 2 - padding,
              textWidth + padding * 2,
              textHeight + padding * 2,
              textElement.borderRadius * scale
            );
            ctx.fill();
          } else {
            ctx.fillRect(
              -textWidth / 2 - padding,
              -textHeight / 2 - padding,
              textWidth + padding * 2,
              textHeight + padding * 2
            );
          }
        }
        
        // Shadow
        if (textElement.shadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 4 * scale;
          ctx.shadowOffsetX = 2 * scale;
          ctx.shadowOffsetY = 2 * scale;
        }
        
        // Text
        ctx.fillStyle = textElement.color;
        ctx.font = `${textElement.fontStyle} ${textElement.fontWeight} ${textElement.fontSize * scale}px ${textElement.fontFamily}`;
        ctx.textAlign = textElement.textAlign;
        ctx.globalAlpha = textElement.opacity;
        
        ctx.fillText(textElement.text, 0, 0);
        
        // Text decoration
        if (textElement.textDecoration === 'underline') {
          const textWidth = ctx.measureText(textElement.text).width;
          ctx.beginPath();
          ctx.moveTo(-textWidth / 2, textElement.fontSize * scale * 0.1);
          ctx.lineTo(textWidth / 2, textElement.fontSize * scale * 0.1);
          ctx.strokeStyle = textElement.color;
          ctx.lineWidth = 2 * scale;
          ctx.stroke();
        }
        
        ctx.restore();
      }
    }

    canvas.toBlob((blob) => {
      if (blob) {
        setGeneratedCollage(URL.createObjectURL(blob));
      }
      setIsGenerating(false);
    }, 'image/jpeg', 0.95);
  };

  const downloadCollage = () => {
    if (!generatedCollage) return;
    
    const link = document.createElement('a');
    link.href = generatedCollage;
    link.download = `memoria-collage-${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Interactive Collage Studio</h2>
            <p className="text-white/70">Drag, resize, and arrange photos with text elements</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={addTextElement}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            <Type className="w-4 h-4" />
            <span>Add Text</span>
          </button>
          
          <button
            onClick={generateCollage}
            disabled={isGenerating || (collagePhotos.length === 0 && textElements.length === 0)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
          >
            <Wand2 className="w-5 h-5" />
            <span>{isGenerating ? 'Generating...' : 'Generate Collage'}</span>
          </button>
          
          {generatedCollage && (
            <button
              onClick={downloadCollage}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Styles & Photos */}
        <div className="col-span-3 space-y-6 overflow-y-auto">
          {/* Collage Styles */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Collage Styles</h3>
            <div className="space-y-3">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedStyle?.id === style.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <p className="font-medium text-white">{style.name}</p>
                  <p className="text-white/70 text-sm">{style.description}</p>
                </button>
              ))}
            </div>
            
            {selectedStyle && (
              <button
                onClick={autoArrangePhotos}
                className="w-full mt-4 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Shuffle className="w-4 h-4" />
                  <span>Auto Arrange</span>
                </div>
              </button>
            )}
          </div>

          {/* Photo Selector */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Select Photos ({selectedPhotos.size})
              </h3>
              <button
                onClick={() => {
                  if (selectedPhotos.size === photos.length) {
                    setSelectedPhotos(new Set());
                    setCollagePhotos([]);
                  } else {
                    setSelectedPhotos(new Set(photos.map(p => p.id)));
                  }
                }}
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
              >
                {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => togglePhotoSelection(photo.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                    selectedPhotos.has(photo.id)
                      ? 'ring-2 ring-purple-500 scale-95'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedPhotos.has(photo.id) && (
                    <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                      <CheckSquare className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  {photo.metadata?.faces && photo.metadata.faces > 0 && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {photo.metadata.faces}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Interactive Canvas */}
        <div className="col-span-6">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Design Canvas</h3>
              <div className="flex items-center space-x-2 text-white/70 text-sm">
                <Move className="w-4 h-4" />
                <span>Drag to reposition • {settings.canvasWidth} × {settings.canvasHeight}</span>
              </div>
            </div>
            
            <div 
              ref={collageCanvasRef}
              className="relative border-2 border-dashed border-white/30 rounded-lg overflow-hidden mx-auto select-none"
              style={{ 
                width: settings.canvasWidth / 2, 
                height: settings.canvasHeight / 2,
                backgroundColor: settings.backgroundColor 
              }}
            >
              {/* Photos */}
              {collagePhotos
                .filter(cp => cp.visible)
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((collagePhoto) => (
                <div
                  key={collagePhoto.id}
                  className={`absolute select-none transition-all duration-200 ${
                    collagePhoto.locked 
                      ? 'cursor-not-allowed' 
                      : dragState.isDragging && dragState.draggedItemId === collagePhoto.id
                        ? 'cursor-grabbing scale-105 shadow-2xl z-50' 
                        : 'cursor-grab hover:scale-105'
                  } ${
                    selectedCollagePhoto === collagePhoto.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{
                    left: collagePhoto.x / 2,
                    top: collagePhoto.y / 2,
                    width: collagePhoto.width / 2,
                    height: collagePhoto.height / 2,
                    transform: `rotate(${collagePhoto.rotation}deg)`,
                    zIndex: dragState.draggedItemId === collagePhoto.id ? 9999 : collagePhoto.zIndex
                  }}
                  onMouseDown={(e) => handleMouseDown(e, collagePhoto.id, 'photo')}
                  onTouchStart={(e) => handleTouchStart(e, collagePhoto.id, 'photo')}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCollagePhoto(collagePhoto.id);
                    setSelectedTextElement(null);
                  }}
                >
                  <img
                    src={collagePhoto.photo.url}
                    alt={collagePhoto.photo.name}
                    className="w-full h-full object-cover rounded-lg shadow-lg pointer-events-none"
                    style={{
                      borderRadius: settings.borderRadius,
                      border: settings.borderWidth > 0 ? `${settings.borderWidth}px solid white` : 'none'
                    }}
                    draggable={false}
                  />
                  
                  {selectedCollagePhoto === collagePhoto.id && !collagePhoto.locked && (
                    <>
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-purple-500 rounded-full cursor-nw-resize"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full cursor-ne-resize"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 rounded-full cursor-sw-resize"></div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full cursor-se-resize"></div>
                    </>
                  )}
                  
                  {collagePhoto.locked && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                  
                  {dragState.isDragging && dragState.draggedItemId === collagePhoto.id && (
                    <div className="absolute inset-0 bg-purple-500/20 rounded-lg border-2 border-purple-500 border-dashed"></div>
                  )}
                </div>
              ))}

              {/* Text Elements */}
              {textElements
                .filter(te => te.visible)
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((textElement) => (
                <div
                  key={textElement.id}
                  className={`absolute select-none transition-all duration-200 ${
                    textElement.locked 
                      ? 'cursor-not-allowed' 
                      : dragState.isDragging && dragState.draggedItemId === textElement.id
                        ? 'cursor-grabbing scale-105 shadow-2xl z-50' 
                        : 'cursor-grab hover:scale-105'
                  } ${
                    selectedTextElement === textElement.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    left: textElement.x / 2,
                    top: textElement.y / 2,
                    transform: `rotate(${textElement.rotation}deg)`,
                    zIndex: dragState.draggedItemId === textElement.id ? 9999 : textElement.zIndex,
                    backgroundColor: textElement.backgroundColor,
                    padding: textElement.padding / 2,
                    borderRadius: textElement.borderRadius / 2,
                    opacity: textElement.opacity
                  }}
                  onMouseDown={(e) => handleMouseDown(e, textElement.id, 'text')}
                  onTouchStart={(e) => handleTouchStart(e, textElement.id, 'text')}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTextElement(textElement.id);
                    setSelectedCollagePhoto(null);
                  }}
                  onDoubleClick={() => {
                    setEditingText(textElement);
                    setShowTextEditor(true);
                  }}
                >
                  <span
                    className="pointer-events-none"
                    style={{
                      fontSize: textElement.fontSize / 2,
                      fontFamily: textElement.fontFamily,
                      color: textElement.color,
                      fontWeight: textElement.fontWeight,
                      fontStyle: textElement.fontStyle,
                      textDecoration: textElement.textDecoration,
                      textAlign: textElement.textAlign,
                      textShadow: textElement.shadow ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {textElement.text}
                  </span>
                  
                  {selectedTextElement === textElement.id && !textElement.locked && (
                    <>
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize"></div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"></div>
                    </>
                  )}
                  
                  {textElement.locked && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                  
                  {dragState.isDragging && dragState.draggedItemId === textElement.id && (
                    <div className="absolute inset-0 bg-blue-500/20 rounded-lg border-2 border-blue-500 border-dashed"></div>
                  )}
                </div>
              ))}
              
              {collagePhotos.length === 0 && textElements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/50">
                    <Camera className="w-16 h-16 mx-auto mb-4" />
                    <p className="mb-2">Select photos and a style to start creating</p>
                    <p className="text-sm">Then drag photos to reposition them freely</p>
                    <p className="text-sm mt-2">Click "Add Text" to include text elements</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Settings & Layers */}
        <div className="col-span-3 space-y-6 overflow-y-auto">
          {/* Canvas Settings */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Canvas Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Spacing ({settings.spacing}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={settings.spacing}
                  onChange={(e) => setSettings(prev => ({ ...prev, spacing: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Border Width ({settings.borderWidth}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={settings.borderWidth}
                  onChange={(e) => setSettings(prev => ({ ...prev, borderWidth: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Shadow Intensity ({settings.shadowIntensity}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.shadowIntensity}
                  onChange={(e) => setSettings(prev => ({ ...prev, shadowIntensity: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Background Color</label>
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-white/20 bg-white/10"
                />
              </div>
            </div>
          </div>

          {/* Layer Management */}
          {(collagePhotos.length > 0 || textElements.length > 0) && (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Layers</h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[...collagePhotos.map(cp => ({ ...cp, type: 'photo' as const })), ...textElements.map(te => ({ ...te, type: 'text' as const }))]
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                      (item.type === 'photo' && selectedCollagePhoto === item.id) || 
                      (item.type === 'text' && selectedTextElement === item.id)
                        ? 'bg-purple-500/20 border border-purple-500'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      if (item.type === 'photo') {
                        setSelectedCollagePhoto(item.id);
                        setSelectedTextElement(null);
                      } else {
                        setSelectedTextElement(item.id);
                        setSelectedCollagePhoto(null);
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      {item.type === 'photo' ? (
                        <img
                          src={(item as CollagePhoto).photo.url}
                          alt={(item as CollagePhoto).photo.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500/20 flex items-center justify-center">
                          <Type className="w-5 h-5 text-blue-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">
                        {item.type === 'photo' 
                          ? (item as CollagePhoto).photo.name.split('.')[0]
                          : (item as TextElement).text
                        }
                      </p>
                      <p className="text-white/60 text-xs">
                        Layer {item.zIndex} • {Math.round(item.x)}, {Math.round(item.y)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.type === 'photo') {
                            setCollagePhotos(prev => prev.map(cp => 
                              cp.id === item.id ? { ...cp, visible: !cp.visible } : cp
                            ));
                          } else {
                            setTextElements(prev => prev.map(te => 
                              te.id === item.id ? { ...te, visible: !te.visible } : te
                            ));
                          }
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        {item.visible ? (
                          <Eye className="w-4 h-4 text-white" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-white/50" />
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.type === 'photo') {
                            setCollagePhotos(prev => prev.map(cp => 
                              cp.id === item.id ? { ...cp, locked: !cp.locked } : cp
                            ));
                          } else {
                            setTextElements(prev => prev.map(te => 
                              te.id === item.id ? { ...te, locked: !te.locked } : te
                            ));
                          }
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        {item.locked ? (
                          <Lock className="w-4 h-4 text-red-400" />
                        ) : (
                          <Unlock className="w-4 h-4 text-white" />
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.type === 'photo') {
                            bringPhotoToFront(item.id);
                          } else {
                            bringTextToFront(item.id);
                          }
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <ChevronUp className="w-4 h-4 text-white" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.type === 'photo') {
                            sendPhotoToBack(item.id);
                          } else {
                            sendTextToBack(item.id);
                          }
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <ChevronDown className="w-4 h-4 text-white" />
                      </button>

                      {item.type === 'text' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingText(item as TextElement);
                              setShowTextEditor(true);
                            }}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Edit3 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTextElement(item.id);
                            }}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Photo Controls */}
          {selectedCollagePhoto && (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Photo Controls</h3>
              
              {(() => {
                const photo = collagePhotos.find(cp => cp.id === selectedCollagePhoto);
                if (!photo) return null;
                
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Position
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-white/70 mb-1">X: {Math.round(photo.x)}</label>
                          <input
                            type="range"
                            min="0"
                            max={settings.canvasWidth - photo.width}
                            value={photo.x}
                            onChange={(e) => setCollagePhotos(prev => prev.map(cp => 
                              cp.id === selectedCollagePhoto ? { ...cp, x: parseInt(e.target.value) } : cp
                            ))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/70 mb-1">Y: {Math.round(photo.y)}</label>
                          <input
                            type="range"
                            min="0"
                            max={settings.canvasHeight - photo.height}
                            value={photo.y}
                            onChange={(e) => setCollagePhotos(prev => prev.map(cp => 
                              cp.id === selectedCollagePhoto ? { ...cp, y: parseInt(e.target.value) } : cp
                            ))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Rotation ({Math.round(photo.rotation)}°)
                      </label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={photo.rotation}
                        onChange={(e) => setCollagePhotos(prev => prev.map(cp => 
                          cp.id === selectedCollagePhoto ? { ...cp, rotation: parseInt(e.target.value) } : cp
                        ))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setCollagePhotos(prev => prev.map(cp => 
                          cp.id === selectedCollagePhoto ? { ...cp, width: cp.width * 1.1, height: cp.height * 1.1 } : cp
                        ))}
                        className="flex items-center justify-center space-x-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        <ZoomIn className="w-4 h-4" />
                        <span>Larger</span>
                      </button>
                      
                      <button
                        onClick={() => setCollagePhotos(prev => prev.map(cp => 
                          cp.id === selectedCollagePhoto ? { ...cp, width: cp.width * 0.9, height: cp.height * 0.9 } : cp
                        ))}
                        className="flex items-center justify-center space-x-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        <ZoomOut className="w-4 h-4" />
                        <span>Smaller</span>
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setCollagePhotos(prev => prev.filter(cp => cp.id !== selectedCollagePhoto))}
                      className="w-full p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Remove from Collage
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Selected Text Controls */}
          {selectedTextElement && (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Text Controls</h3>
              
              {(() => {
                const textEl = textElements.find(te => te.id === selectedTextElement);
                if (!textEl) return null;
                
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Position
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-white/70 mb-1">X: {Math.round(textEl.x)}</label>
                          <input
                            type="range"
                            min="0"
                            max={settings.canvasWidth - 100}
                            value={textEl.x}
                            onChange={(e) => updateTextElement(selectedTextElement, { x: parseInt(e.target.value) })}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/70 mb-1">Y: {Math.round(textEl.y)}</label>
                          <input
                            type="range"
                            min="0"
                            max={settings.canvasHeight - 50}
                            value={textEl.y}
                            onChange={(e) => updateTextElement(selectedTextElement, { y: parseInt(e.target.value) })}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Font Size ({textEl.fontSize}px)
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="120"
                        value={textEl.fontSize}
                        onChange={(e) => updateTextElement(selectedTextElement, { fontSize: parseInt(e.target.value) })}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Rotation ({Math.round(textEl.rotation)}°)
                      </label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={textEl.rotation}
                        onChange={(e) => updateTextElement(selectedTextElement, { rotation: parseInt(e.target.value) })}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setEditingText(textEl);
                          setShowTextEditor(true);
                        }}
                        className="flex items-center justify-center space-x-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        onClick={() => deleteTextElement(selectedTextElement)}
                        className="flex items-center justify-center space-x-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Text Editor Modal */}
      {showTextEditor && editingText && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Text Editor</h3>
              <button
                onClick={() => {
                  setShowTextEditor(false);
                  setEditingText(null);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Text Content */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Text Content</label>
                <textarea
                  value={editingText.text}
                  onChange={(e) => {
                    const updated = { ...editingText, text: e.target.value };
                    setEditingText(updated);
                    updateTextElement(editingText.id, { text: e.target.value });
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Enter your text here..."
                />
              </div>

              {/* Font Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Font Family</label>
                  <select
                    value={editingText.fontFamily}
                    onChange={(e) => {
                      const updated = { ...editingText, fontFamily: e.target.value };
                      setEditingText(updated);
                      updateTextElement(editingText.id, { fontFamily: e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fontFamilies.map(font => (
                      <option key={font.value} value={font.value} className="bg-gray-800">
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Font Size</label>
                  <input
                    type="number"
                    value={editingText.fontSize}
                    onChange={(e) => {
                      const updated = { ...editingText, fontSize: parseInt(e.target.value) };
                      setEditingText(updated);
                      updateTextElement(editingText.id, { fontSize: parseInt(e.target.value) });
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="8"
                    max="200"
                  />
                </div>
              </div>

              {/* Text Style */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Text Style</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const weight = editingText.fontWeight === 'bold' ? 'normal' : 'bold';
                      const updated = { ...editingText, fontWeight: weight };
                      setEditingText(updated);
                      updateTextElement(editingText.id, { fontWeight: weight });
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      editingText.fontWeight === 'bold' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => {
                      const style = editingText.fontStyle === 'italic' ? 'normal' : 'italic';
                      const updated = { ...editingText, fontStyle: style };
                      setEditingText(updated);
                      updateTextElement(editingText.id, { fontStyle: style });
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      editingText.fontStyle === 'italic' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => {
                      const decoration = editingText.textDecoration === 'underline' ? 'none' : 'underline';
                      const updated = { ...editingText, textDecoration: decoration };
                      setEditingText(updated);
                      updateTextElement(editingText.id, { textDecoration: decoration });
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      editingText.textDecoration === 'underline' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Text Alignment</label>
                <div className="flex items-center space-x-2">
                  {['left', 'center', 'right'].map(align => (
                    <button
                      key={align}
                      onClick={() => {
                        const updated = { ...editingText, textAlign: align as any };
                        setEditingText(updated);
                        updateTextElement(editingText.id, { textAlign: align as any });
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        editingText.textAlign === align 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {align === 'left' && <AlignLeft className="w-4 h-4" />}
                      {align === 'center' && <AlignCenter className="w-4 h-4" />}
                      {align === 'right' && <AlignRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Text Color</label>
                  <div className="space-y-2">
                    <input
                      type="color"
                      value={editingText.color}
                      onChange={(e) => {
                        const updated = { ...editingText, color: e.target.value };
                        setEditingText(updated);
                        updateTextElement(editingText.id, { color: e.target.value });
                      }}
                      className="w-full h-10 rounded-lg border border-white/20 bg-white/10"
                    />
                    <div className="flex flex-wrap gap-1">
                      {presetColors.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            const updated = { ...editingText, color };
                            setEditingText(updated);
                            updateTextElement(editingText.id, { color });
                          }}
                          className="w-6 h-6 rounded border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Background Color</label>
                  <div className="space-y-2">
                    <input
                      type="color"
                      value={editingText.backgroundColor === 'transparent' ? '#000000' : editingText.backgroundColor}
                      onChange={(e) => {
                        const updated = { ...editingText, backgroundColor: e.target.value };
                        setEditingText(updated);
                        updateTextElement(editingText.id, { backgroundColor: e.target.value });
                      }}
                      className="w-full h-10 rounded-lg border border-white/20 bg-white/10"
                    />
                    <button
                      onClick={() => {
                        const updated = { ...editingText, backgroundColor: 'transparent' };
                        setEditingText(updated);
                        updateTextElement(editingText.id, { backgroundColor: 'transparent' });
                      }}
                      className="w-full p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                    >
                      Transparent
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Opacity ({Math.round(editingText.opacity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editingText.opacity}
                    onChange={(e) => {
                      const updated = { ...editingText, opacity: parseFloat(e.target.value) };
                      setEditingText(updated);
                      updateTextElement(editingText.id, { opacity: parseFloat(e.target.value) });
                    }}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Padding ({editingText.padding}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={editingText.padding}
                    onChange={(e) => {
                      const updated = { ...editingText, padding: parseInt(e.target.value) };
                      setEditingText(updated);
                      updateTextElement(editingText.id, { padding: parseInt(e.target.value) });
                    }}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Border Radius ({editingText.borderRadius}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={editingText.borderRadius}
                    onChange={(e) => {
                      const updated = { ...editingText, borderRadius: parseInt(e.target.value) };
                      setEditingText(updated);
                      updateTextElement(editingText.id, { borderRadius: parseInt(e.target.value) });
                    }}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Shadow Toggle */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={editingText.shadow}
                    onChange={(e) => {
                      const updated = { ...editingText, shadow: e.target.checked };
                      setEditingText(updated);
                      updateTextElement(editingText.id, { shadow: e.target.checked });
                    }}
                    className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                  />
                  <span className="text-white">Add Text Shadow</span>
                </label>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Preview</label>
                <div className="bg-white/5 rounded-lg p-6 border border-white/20">
                  <div
                    style={{
                      fontSize: editingText.fontSize,
                      fontFamily: editingText.fontFamily,
                      color: editingText.color,
                      fontWeight: editingText.fontWeight,
                      fontStyle: editingText.fontStyle,
                      textDecoration: editingText.textDecoration,
                      textAlign: editingText.textAlign,
                      backgroundColor: editingText.backgroundColor,
                      padding: editingText.padding,
                      borderRadius: editingText.borderRadius,
                      opacity: editingText.opacity,
                      textShadow: editingText.shadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
                      display: 'inline-block'
                    }}
                  >
                    {editingText.text || 'Your text here'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/20">
                <button
                  onClick={() => deleteTextElement(editingText.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Delete Text
                </button>
                <button
                  onClick={() => {
                    setShowTextEditor(false);
                    setEditingText(null);
                  }}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas for Export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CollageGenerator;