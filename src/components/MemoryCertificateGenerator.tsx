import React, { useState, useRef } from 'react';
import { ArrowLeft, Award, Download, Sparkles, Wand2, RefreshCw, Heart, Star, Camera, Calendar, RotateCcw, Monitor, Smartphone } from 'lucide-react';
import { Photo } from '../types';

interface MemoryCertificateGeneratorProps {
  photos: Photo[];
  onBack: () => void;
}

interface CertificateData {
  photo: Photo;
  title: string;
  caption: string;
  theme: string;
  date: string;
  emotion: string;
  isCustomCaption: boolean;
  subjectType: 'people' | 'scenery' | 'object';
  orientation: 'portrait' | 'landscape';
}

const MemoryCertificateGenerator: React.FC<MemoryCertificateGeneratorProps> = ({ photos, onBack }) => {
  const [step, setStep] = useState<'select-photo' | 'select-orientation' | 'customize'>('select-photo');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [customCaption, setCustomCaption] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('elegant');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCertificate, setGeneratedCertificate] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const themes = [
    {
      id: 'elegant',
      name: 'Elegant Ivory',
      description: 'Warm ivory with gold accents and serif typography',
      colors: {
        primary: '#8B4513',
        secondary: '#F5F5DC',
        accent: '#D4AF37',
        background: '#FDF6E3',
        text: '#4A4A4A'
      },
      fonts: {
        title: 'serif',
        subtitle: 'cursive',
        body: 'sans-serif'
      }
    },
    {
      id: 'blush',
      name: 'Blush Romance',
      description: 'Soft blush pinks with rose gold details',
      colors: {
        primary: '#8B4A6B',
        secondary: '#FCE4EC',
        accent: '#E91E63',
        background: '#FFF0F5',
        text: '#5D4E75'
      },
      fonts: {
        title: 'serif',
        subtitle: 'cursive',
        body: 'sans-serif'
      }
    },
    {
      id: 'muted-gold',
      name: 'Muted Gold',
      description: 'Sophisticated muted golds with cream tones',
      colors: {
        primary: '#B8860B',
        secondary: '#FFF8DC',
        accent: '#DAA520',
        background: '#FFFEF7',
        text: '#6B5B73'
      },
      fonts: {
        title: 'serif',
        subtitle: 'cursive',
        body: 'sans-serif'
      }
    },
    {
      id: 'sage',
      name: 'Sage Serenity',
      description: 'Calming sage greens with natural warmth',
      colors: {
        primary: '#87A96B',
        secondary: '#F0F4EC',
        accent: '#9CAF88',
        background: '#F8FBF6',
        text: '#5A6B47'
      },
      fonts: {
        title: 'serif',
        subtitle: 'cursive',
        body: 'sans-serif'
      }
    },
    {
      id: 'lavender',
      name: 'Lavender Dreams',
      description: 'Soft lavender with silver accents',
      colors: {
        primary: '#8A7CA8',
        secondary: '#F3F0FF',
        accent: '#B19CD9',
        background: '#FEFCFF',
        text: '#6B5B95'
      },
      fonts: {
        title: 'serif',
        subtitle: 'cursive',
        body: 'sans-serif'
      }
    }
  ];

  const detectSubjectType = (photo: Photo): 'people' | 'scenery' | 'object' => {
    const fileName = photo.name.toLowerCase();
    
    if (photo.metadata?.faces && photo.metadata.faces > 0) {
      return 'people';
    }
    
    const peopleKeywords = ['portrait', 'selfie', 'family', 'wedding', 'graduation', 'birthday', 'people', 'person', 'face', 'group', 'friends'];
    if (peopleKeywords.some(keyword => fileName.includes(keyword))) {
      return 'people';
    }
    
    const sceneryKeywords = ['landscape', 'sunset', 'sunrise', 'mountain', 'beach', 'ocean', 'forest', 'sky', 'nature', 'view', 'scenery', 'horizon'];
    if (sceneryKeywords.some(keyword => fileName.includes(keyword))) {
      return 'scenery';
    }
    
    if (photo.metadata?.environment) {
      if (['outdoor', 'nature', 'beach', 'mountain'].includes(photo.metadata.environment)) {
        return 'scenery';
      }
    }
    
    return 'object';
  };

  const generateAICaption = async (photo: Photo, subjectType: 'people' | 'scenery' | 'object'): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const peopleCaptions = [
      "In this precious moment, love speaks through every smile, creating a memory that will warm hearts for generations to come.",
      "The gentle art of being present with those who matter most, where happiness radiates from every corner of this beautiful frame.",
      "A testament to the bonds that make life extraordinary, captured in a single breath of pure, unguarded joy.",
      "Where laughter lives and hearts find their home, this moment whispers the language only souls understand.",
      "The poetry of human connection written in light and shadow, preserving the essence of what makes us beautifully human.",
      "A precious fragment of togetherness, held close to the heart, where memories are born and love leaves its gentle mark.",
      "This moment holds the magic of authentic connection, where time stands still and hearts speak without words.",
      "The beautiful chaos of living fully with those we cherish, creating ripples of joy that extend far beyond this frame.",
      "In this gentle embrace of time, we see the reflection of pure contentment and the grace of shared happiness.",
      "A celebration of the bonds that anchor us, where every glance tells a story of love, laughter, and belonging."
    ];
    
    const sceneryCaptions = [
      "Golden hour painting the world in whispers of light, where earth meets sky in perfect, silent harmony that speaks to the soul.",
      "Nature's masterpiece captured in a single breath, revealing the quiet beauty of a world that never stops creating wonder.",
      "Where time stands still and beauty speaks without words, this landscape holds the poetry of existence in its gentle embrace.",
      "The eternal dance of light and shadow across the earth, creating a moment when the world revealed its hidden magic.",
      "Sunset's gentle reminder that endings can be beautiful, painting the sky with dreams and filling hearts with peaceful wonder.",
      "The sacred geometry of creation, where every line and curve tells the story of time, weather, and the patient art of becoming.",
      "A moment when the ordinary world transformed into something extraordinary, revealing the divine in the details of daily beauty.",
      "The quiet symphony of earth and sky, composed in perfect harmony, where silence holds more music than any song.",
      "Where wildflowers whisper secrets to the listening wind, and every blade of grass holds a story of resilience and grace.",
      "The cathedral of open sky, where prayers are made of light and every cloud carries a message of hope and possibility."
    ];
    
    const objectCaptions = [
      "The quiet beauty found in life's simple treasures, where ordinary things become extraordinary through the lens of mindful attention.",
      "A moment of stillness in a world that never stops moving, revealing the profound beauty hidden in the everyday details of existence.",
      "Where simplicity meets the sacred, this gentle reminder shows us that wonder lives in the smallest corners of our daily lives.",
      "The elegant dance between form and meaning, captured in perfect stillness, where function becomes art and purpose transforms into poetry.",
      "A testament to the beauty of the overlooked, where patient observation reveals the extraordinary nature of the seemingly mundane.",
      "The gentle art of finding magic in the everyday, where familiar objects become vessels for memory, meaning, and quiet contemplation.",
      "In this frame, the ordinary reveals its extraordinary soul, reminding us that beauty exists in every corner of our lived experience.",
      "The silent witness to moments that matter more than we know, holding space for the stories that unfold in the quiet spaces of life.",
      "Where texture and light conspire to create unexpected beauty, transforming the simple into something that touches the heart and stirs the imagination.",
      "A precious reminder that wonder lives in the details, where the act of truly seeing transforms the mundane into the magnificent."
    ];
    
    let captions: string[];
    switch (subjectType) {
      case 'people':
        captions = peopleCaptions;
        break;
      case 'scenery':
        captions = sceneryCaptions;
        break;
      case 'object':
        captions = objectCaptions;
        break;
    }
    
    return captions[Math.floor(Math.random() * captions.length)];
  };

  const generateAITitle = async (photo: Photo, emotion: string, subjectType: 'people' | 'scenery' | 'object'): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const peopleTitles = {
      happy: [
        "Certificate of Pure Joy",
        "Moment of Radiant Happiness",
        "Celebration of Unbridled Bliss",
        "Portrait of Perfect Contentment"
      ],
      peaceful: [
        "Certificate of Tranquil Togetherness",
        "Sanctuary of Shared Serenity",
        "Moment of Perfect Harmony",
        "Haven of Quiet Grace"
      ],
      nostalgic: [
        "Treasured Memory Preserved",
        "Golden Hour of Remembrance",
        "Certificate of Timeless Love",
        "Vintage Moment of Wonder"
      ],
      excited: [
        "Certificate of Pure Excitement",
        "Burst of Electric Energy",
        "Moment of Explosive Joy",
        "Celebration of Boundless Enthusiasm"
      ]
    };
    
    const sceneryTitles = {
      happy: [
        "Certificate of Natural Wonder",
        "Landscape of Pure Beauty",
        "Nature's Golden Moment",
        "Vista of Endless Joy"
      ],
      peaceful: [
        "Certificate of Serene Beauty",
        "Sanctuary of Natural Peace",
        "Moment of Earth's Tranquility",
        "Haven of Natural Grace"
      ],
      nostalgic: [
        "Timeless Landscape Preserved",
        "Golden Hour of Nature",
        "Certificate of Eternal Beauty",
        "Vintage View of Wonder"
      ],
      excited: [
        "Certificate of Natural Drama",
        "Burst of Earth's Energy",
        "Moment of Wild Beauty",
        "Celebration of Nature's Power"
      ]
    };
    
    const objectTitles = {
      happy: [
        "Certificate of Simple Joy",
        "Moment of Everyday Wonder",
        "Celebration of Pure Delight",
        "Portrait of Life's Treasures"
      ],
      peaceful: [
        "Certificate of Quiet Beauty",
        "Sanctuary of Simple Grace",
        "Moment of Gentle Stillness",
        "Haven of Peaceful Form"
      ],
      nostalgic: [
        "Treasured Object Preserved",
        "Golden Memory of Time",
        "Certificate of Vintage Charm",
        "Moment of Timeless Beauty"
      ],
      excited: [
        "Certificate of Dynamic Form",
        "Burst of Creative Energy",
        "Moment of Artistic Wonder",
        "Celebration of Bold Beauty"
      ]
    };
    
    let titleTemplates: any;
    switch (subjectType) {
      case 'people':
        titleTemplates = peopleTitles;
        break;
      case 'scenery':
        titleTemplates = sceneryTitles;
        break;
      case 'object':
        titleTemplates = objectTitles;
        break;
    }
    
    const templates = titleTemplates[emotion as keyof typeof titleTemplates] || titleTemplates.happy;
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const analyzePhotoEmotion = (photo: Photo): string => {
    if (photo.metadata?.mood) {
      return photo.metadata.mood;
    }
    
    const emotions = ['happy', 'peaceful', 'nostalgic', 'excited'];
    return emotions[Math.floor(Math.random() * emotions.length)];
  };

  const handlePhotoSelect = (photo: Photo) => {
    setSelectedPhoto(photo);
    setStep('select-orientation');
  };

  const handleOrientationSelect = async (orientation: 'portrait' | 'landscape') => {
    setSelectedOrientation(orientation);
    setIsGenerating(true);
    setStep('customize');
    
    if (selectedPhoto) {
      const subjectType = detectSubjectType(selectedPhoto);
      const emotion = analyzePhotoEmotion(selectedPhoto);
      const aiTitle = await generateAITitle(selectedPhoto, emotion, subjectType);
      const aiCaption = await generateAICaption(selectedPhoto, subjectType);
      
      setCertificateData({
        photo: selectedPhoto,
        title: aiTitle,
        caption: aiCaption,
        theme: selectedTheme,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        emotion,
        isCustomCaption: false,
        subjectType,
        orientation
      });
    }
    
    setIsGenerating(false);
  };

  const updateCaption = (caption: string, isCustom: boolean) => {
    if (certificateData) {
      setCertificateData({
        ...certificateData,
        caption,
        isCustomCaption: isCustom
      });
    }
  };

  const updateTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    if (certificateData) {
      setCertificateData({
        ...certificateData,
        theme: themeId
      });
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    if (line.trim()) {
      ctx.fillText(line.trim(), x, currentY);
    }
    
    return currentY;
  };

  const wrapTitle = (ctx: CanvasRenderingContext2D, title: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const words = title.split(' ');
    let line = '';
    let lines: string[] = [];
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    
    if (line.trim()) {
      lines.push(line.trim());
    }
    
    // Center multiple lines
    let currentY = y;
    if (lines.length > 1) {
      currentY = y - (lineHeight * (lines.length - 1)) / 2;
    }
    
    lines.forEach((textLine, index) => {
      ctx.fillText(textLine, x, currentY + (index * lineHeight));
    });
    
    return currentY + ((lines.length - 1) * lineHeight);
  };

  const justifyText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number = 2): number => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    // Split into lines
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine.trim());
        currentLine = words[i] + ' ';
        
        if (lines.length >= maxLines) {
          // Add remaining words to last line
          const remainingWords = words.slice(i);
          lines[lines.length - 1] += ' ' + remainingWords.join(' ');
          break;
        }
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine.trim() && lines.length < maxLines) {
      lines.push(currentLine.trim());
    }
    
    // Limit to maxLines
    const finalLines = lines.slice(0, maxLines);
    
    // Draw justified lines
    finalLines.forEach((line, index) => {
      const lineY = y + (index * lineHeight);
      
      if (index < finalLines.length - 1 && finalLines.length > 1) {
        // Justify all lines except the last
        const lineWords = line.split(' ');
        if (lineWords.length > 1) {
          const totalTextWidth = lineWords.reduce((sum, word) => sum + ctx.measureText(word).width, 0);
          const totalSpaceWidth = maxWidth - totalTextWidth;
          const spaceWidth = totalSpaceWidth / (lineWords.length - 1);
          
          let currentX = x - maxWidth / 2;
          lineWords.forEach((word, wordIndex) => {
            ctx.fillText(word, currentX, lineY);
            currentX += ctx.measureText(word).width + spaceWidth;
          });
        } else {
          ctx.fillText(line, x, lineY);
        }
      } else {
        // Center the last line
        ctx.fillText(line, x, lineY);
      }
    });
    
    return y + ((finalLines.length - 1) * lineHeight);
  };

  const generateCertificate = async () => {
    if (!certificateData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = themes.find(t => t.id === certificateData.theme)!;
    const isPortrait = certificateData.orientation === 'portrait';
    
    // Set canvas dimensions based on orientation
    const scale = 3; // High resolution for print quality
    if (isPortrait) {
      canvas.width = 1200 * scale;  // 8.5" x 11" at 300 DPI
      canvas.height = 1584 * scale;
    } else {
      canvas.width = 1584 * scale;  // 11" x 8.5" at 300 DPI
      canvas.height = 1200 * scale;
    }
    
    ctx.scale(scale, scale);
    
    const canvasWidth = isPortrait ? 1200 : 1584;
    const canvasHeight = isPortrait ? 1584 : 1200;

    // Create beautiful gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, theme.colors.background);
    gradient.addColorStop(0.5, theme.colors.secondary);
    gradient.addColorStop(1, theme.colors.background);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Add subtle texture
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `${theme.colors.accent}15`;
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      ctx.fillRect(x, y, Math.random() * 2 + 1, Math.random() * 2 + 1);
    }

    // Add elegant border
    const borderWidth = 40;
    ctx.strokeStyle = theme.colors.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(borderWidth, borderWidth, canvasWidth - borderWidth * 2, canvasHeight - borderWidth * 2);
    
    // Inner decorative border
    ctx.strokeStyle = theme.colors.primary;
    ctx.lineWidth = 1;
    ctx.strokeRect(borderWidth + 20, borderWidth + 20, canvasWidth - (borderWidth + 20) * 2, canvasHeight - (borderWidth + 20) * 2);

    // Load and draw photo
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise<void>((resolve) => {
      img.onload = () => {
        if (isPortrait) {
          // Portrait layout - existing implementation
          const padding = 80;
          const contentWidth = canvasWidth - padding * 2;
          
          // Title at top with auto-wrap
          ctx.fillStyle = theme.colors.primary;
          ctx.font = `bold 72px ${theme.fonts.title}`;
          ctx.textAlign = 'center';
          const titleY = 180;
          const titleMaxWidth = contentWidth - 40;
          wrapTitle(ctx, certificateData.title, canvasWidth / 2, titleY, titleMaxWidth, 80);
          
          // Subtitle
          ctx.fillStyle = theme.colors.accent;
          ctx.font = `italic 36px ${theme.fonts.subtitle}`;
          ctx.fillText('Memory Certificate', canvasWidth / 2, titleY + 120);
          
          // Decorative emojis
          ctx.font = '32px Arial';
          ctx.fillText('🌤️', canvasWidth / 2 - 100, titleY + 160);
          ctx.fillText('📸', canvasWidth / 2, titleY + 160);
          ctx.fillText('💖', canvasWidth / 2 + 100, titleY + 160);
          
          // Photo (centered)
          const photoStartY = titleY + 200;
          const photoHeight = Math.min(700, (canvasHeight - photoStartY - 400) * 0.7);
          const photoWidth = Math.min(contentWidth - 80, photoHeight * (img.width / img.height));
          const photoX = (canvasWidth - photoWidth) / 2;
          const photoY = photoStartY + 50;
          
          // Photo shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 30;
          ctx.shadowOffsetX = 15;
          ctx.shadowOffsetY = 15;
          
          // Photo frame
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(photoX - 20, photoY - 20, photoWidth + 40, photoHeight + 40);
          
          // Reset shadow
          ctx.shadowColor = 'transparent';
          
          // Draw photo
          ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
          
          // Photo border
          ctx.strokeStyle = theme.colors.accent;
          ctx.lineWidth = 4;
          ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
          
          // Caption below photo with justification
          const captionY = photoY + photoHeight + 80;
          ctx.fillStyle = theme.colors.text;
          ctx.font = `24px ${theme.fonts.body}`;
          ctx.textAlign = 'center';
          
          justifyText(ctx, certificateData.caption, canvasWidth / 2, captionY, contentWidth - 40, 35, 3);
          
          // Emotion tag
          const emotionY = captionY + 140;
          ctx.fillStyle = theme.colors.accent;
          ctx.font = `italic 20px ${theme.fonts.subtitle}`;
          ctx.textAlign = 'center';
          ctx.fillText(`Emotion: ${certificateData.emotion.charAt(0).toUpperCase() + certificateData.emotion.slice(1)}`, canvasWidth / 2, emotionY);
          
          // Certification date badge
          const badgeY = emotionY + 80;
          const badgeWidth = 400;
          const badgeHeight = 60;
          const badgeX = (canvasWidth - badgeWidth) / 2;
          
          ctx.fillStyle = theme.colors.primary;
          ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold 24px ${theme.fonts.body}`;
          ctx.textAlign = 'center';
          ctx.fillText(`Certified on ${certificateData.date}`, canvasWidth / 2, badgeY + 38);
          
          // Brand tagline
          ctx.fillStyle = theme.colors.accent;
          ctx.font = `italic 18px ${theme.fonts.subtitle}`;
          ctx.fillText('Memoria – Where Emotions Meet Memories', canvasWidth / 2, badgeY + 120);
          
        } else {
          // FIXED Landscape layout
          const padding = 60;
          const contentWidth = canvasWidth - padding * 2;
          
          // Define clear layout areas
          const leftColumnWidth = contentWidth * 0.35; // 35% for text content
          const rightColumnWidth = contentWidth * 0.6;  // 60% for photo
          const columnGap = contentWidth * 0.05; // 5% gap between columns
          
          const leftColumnX = padding;
          const rightColumnX = leftColumnX + leftColumnWidth + columnGap;
          
          // LEFT COLUMN - Title and text content
          const titleStartY = 150;
          
          // Title in left column
          ctx.fillStyle = theme.colors.primary;
          ctx.font = `bold 42px ${theme.fonts.title}`;
          ctx.textAlign = 'left';
          
          // Wrap title to fit left column width
          const titleLines: string[] = [];
          const words = certificateData.title.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > leftColumnWidth - 40 && currentLine) {
              titleLines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) titleLines.push(currentLine);
          
          // Draw title lines
          titleLines.forEach((line, index) => {
            ctx.fillText(line, leftColumnX + 20, titleStartY + (index * 50));
          });
          
          // Subtitle below title
          const subtitleY = titleStartY + (titleLines.length * 50) + 30;
          ctx.fillStyle = theme.colors.accent;
          ctx.font = `italic 24px ${theme.fonts.subtitle}`;
          ctx.fillText('Memory Certificate', leftColumnX + 20, subtitleY);
          
          // Decorative elements in left column
          ctx.font = '28px Arial';
          const decorY = subtitleY + 40;
          ctx.fillText('🌤️', leftColumnX + 20, decorY);
          ctx.fillText('📸', leftColumnX + 70, decorY);
          ctx.fillText('💖', leftColumnX + 120, decorY);
          
          // Caption in left column
          const captionStartY = decorY + 60;
          ctx.fillStyle = theme.colors.text;
          ctx.font = `18px ${theme.fonts.body}`;
          ctx.textAlign = 'left';
          
          // Wrap caption text for left column
          const captionLines: string[] = [];
          const captionWords = certificateData.caption.split(' ');
          let captionLine = '';
          
          for (const word of captionWords) {
            const testLine = captionLine + (captionLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > leftColumnWidth - 40 && captionLine) {
              captionLines.push(captionLine);
              captionLine = word;
              
              // Limit to reasonable number of lines
              if (captionLines.length >= 8) {
                captionLines[captionLines.length - 1] += '...';
                break;
              }
            } else {
              captionLine = testLine;
            }
          }
          if (captionLine && captionLines.length < 8) captionLines.push(captionLine);
          
          // Draw caption lines
          captionLines.forEach((line, index) => {
            ctx.fillText(line, leftColumnX + 20, captionStartY + (index * 25));
          });
          
          // Emotion tag in left column
          const emotionY = captionStartY + (captionLines.length * 25) + 40;
          ctx.fillStyle = theme.colors.accent;
          ctx.font = `italic 16px ${theme.fonts.subtitle}`;
          ctx.fillText(`Emotion: ${certificateData.emotion.charAt(0).toUpperCase() + certificateData.emotion.slice(1)}`, leftColumnX + 20, emotionY);
          
          // RIGHT COLUMN - Photo
          const photoMaxWidth = rightColumnWidth - 40;
          const photoMaxHeight = canvasHeight - 200; // Leave space for bottom elements
          
          // Calculate photo dimensions maintaining aspect ratio
          const imgAspect = img.width / img.height;
          let photoWidth, photoHeight;
          
          if (imgAspect > photoMaxWidth / photoMaxHeight) {
            // Image is wider, fit to width
            photoWidth = photoMaxWidth;
            photoHeight = photoMaxWidth / imgAspect;
          } else {
            // Image is taller, fit to height
            photoHeight = photoMaxHeight;
            photoWidth = photoMaxHeight * imgAspect;
          }
          
          // Center photo in right column
          const photoX = rightColumnX + (rightColumnWidth - photoWidth) / 2;
          const photoY = (canvasHeight - photoHeight) / 2;
          
          // Photo shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 25;
          ctx.shadowOffsetX = 12;
          ctx.shadowOffsetY = 12;
          
          // Photo frame
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(photoX - 15, photoY - 15, photoWidth + 30, photoHeight + 30);
          
          // Reset shadow
          ctx.shadowColor = 'transparent';
          
          // Draw photo
          ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
          
          // Photo border
          ctx.strokeStyle = theme.colors.accent;
          ctx.lineWidth = 3;
          ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
          
          // BOTTOM - Certification badge (centered across full width)
          const badgeY = canvasHeight - 120;
          const badgeWidth = 350;
          const badgeHeight = 45;
          const badgeX = (canvasWidth - badgeWidth) / 2;
          
          ctx.fillStyle = theme.colors.primary;
          ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold 18px ${theme.fonts.body}`;
          ctx.textAlign = 'center';
          ctx.fillText(`Certified on ${certificateData.date}`, canvasWidth / 2, badgeY + 28);
          
          // Brand tagline
          ctx.fillStyle = theme.colors.accent;
          ctx.font = `italic 14px ${theme.fonts.subtitle}`;
          ctx.fillText('Memoria – Where Emotions Meet Memories', canvasWidth / 2, badgeY + 60);
        }

        // Convert to blob and create download URL
        canvas.toBlob((blob) => {
          if (blob) {
            setGeneratedCertificate(URL.createObjectURL(blob));
          }
          resolve();
        }, 'image/jpeg', 0.95);
      };
      
      img.src = certificateData.photo.url;
    });
  };

  const downloadCertificate = () => {
    if (!generatedCertificate || !certificateData) return;
    
    const link = document.createElement('a');
    link.href = generatedCertificate;
    link.download = `memory-certificate-${certificateData.orientation}-${certificateData.photo.name.replace(/\.[^/.]+$/, '')}.jpg`;
    link.click();
  };

  const regenerateAIContent = async () => {
    if (!selectedPhoto || !certificateData) return;
    
    setIsGenerating(true);
    const subjectType = certificateData.subjectType;
    const emotion = analyzePhotoEmotion(selectedPhoto);
    const newTitle = await generateAITitle(selectedPhoto, emotion, subjectType);
    const newCaption = await generateAICaption(selectedPhoto, subjectType);
    
    setCertificateData({
      ...certificateData,
      title: newTitle,
      caption: newCaption,
      isCustomCaption: false
    });
    
    setIsGenerating(false);
  };

  const resetToPhotoSelection = () => {
    setStep('select-photo');
    setSelectedPhoto(null);
    setCertificateData(null);
    setGeneratedCertificate(null);
  };

  // Photo Selection Step
  if (step === 'select-photo') {
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
              <h2 className="text-3xl font-bold text-white">Memory Certificate Studio</h2>
              <p className="text-white/70">Create beautiful, personalized certificates for your precious moments</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Choose a Photo for Your Certificate</h3>
          <p className="text-white/70 max-w-2xl mx-auto">
            Select a photo to create a beautiful memory certificate with adaptive layouts that work perfectly 
            in both portrait and landscape orientations.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group cursor-pointer bg-white/5 backdrop-blur-md rounded-lg overflow-hidden border border-white/20 hover:border-amber-400 transition-all hover:scale-105"
              onClick={() => handlePhotoSelect(photo)}
            >
              <div className="aspect-square relative">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Award className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <div className="p-3">
                <p className="text-white/90 text-xs truncate">{photo.name}</p>
                <p className="text-white/60 text-xs">{photo.uploadedAt.toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Orientation Selection Step
  if (step === 'select-orientation') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setStep('select-photo')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white">Choose Certificate Orientation</h2>
              <p className="text-white/70">Select the layout that best suits your memory</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Monitor className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Perfect Layout for Every Memory</h3>
          <p className="text-white/70 max-w-2xl mx-auto">
            Choose between portrait and landscape orientations. Each layout is specially designed 
            to showcase your photo beautifully with optimized text placement and visual balance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Portrait Option */}
          <button
            onClick={() => handleOrientationSelect('portrait')}
            className="group p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 hover:border-purple-500 transition-all hover:scale-105 text-center"
          >
            <div className="w-16 h-20 mx-auto mb-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Portrait Layout</h3>
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <div className="text-white/80 text-sm space-y-2">
                <p>📐 <strong>8.5" × 11"</strong> (Standard Letter)</p>
                <p>🎯 <strong>Centered Design:</strong> Title at top, photo centered, caption below</p>
                <p>📝 <strong>Perfect for:</strong> Single portraits, detailed captions</p>
                <p>🖼️ <strong>Layout:</strong> Vertical emphasis, elegant spacing</p>
              </div>
            </div>
            <div className="text-purple-400 text-sm">
              ✨ Classic and elegant for traditional framing
            </div>
          </button>

          {/* Landscape Option */}
          <button
            onClick={() => handleOrientationSelect('landscape')}
            className="group p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 hover:border-amber-500 transition-all hover:scale-105 text-center"
          >
            <div className="w-20 h-16 mx-auto mb-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Landscape Layout</h3>
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <div className="text-white/80 text-sm space-y-2">
                <p>📐 <strong>11" × 8.5"</strong> (Wide Format)</p>
                <p>🎯 <strong>Two-Column:</strong> Text content left, photo dominates right</p>
                <p>📝 <strong>Perfect for:</strong> Landscapes, group photos, wide scenes</p>
                <p>🖼️ <strong>Layout:</strong> Photo takes 60% width, text in left column</p>
              </div>
            </div>
            <div className="text-amber-400 text-sm">
              ✨ Modern and spacious for contemporary display
            </div>
          </button>
        </div>

        {/* Selected Photo Preview */}
        {selectedPhoto && (
          <div className="mt-12 text-center">
            <h4 className="text-lg font-semibold text-white mb-4">Selected Photo</h4>
            <div className="inline-block bg-white/10 rounded-lg p-4">
              <div className="w-32 h-32 rounded-lg overflow-hidden mb-3">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-white/90 text-sm font-medium">{selectedPhoto.name}</p>
              <p className="text-white/60 text-xs">{selectedPhoto.uploadedAt.toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Customization Step
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={resetToPhotoSelection}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-white">Customize Your Certificate</h2>
            <p className="text-white/70">
              {certificateData?.orientation === 'portrait' ? '📱 Portrait' : '🖥️ Landscape'} • 
              {certificateData?.photo.name}
            </p>
          </div>
        </div>
        
        {generatedCertificate && (
          <button
            onClick={downloadCertificate}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span>Download Certificate</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Photo Info */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Selected Photo</h3>
            <div className="aspect-square bg-white/10 rounded-lg overflow-hidden mb-4">
              <img
                src={selectedPhoto?.url}
                alt={selectedPhoto?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-white/90 text-sm font-medium">{selectedPhoto?.name}</p>
            <p className="text-white/60 text-xs">{selectedPhoto?.uploadedAt.toLocaleDateString()}</p>
            {certificateData && (
              <div className="mt-2">
                <span className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded-full text-xs">
                  {certificateData.subjectType === 'people' ? '👥 People' : 
                   certificateData.subjectType === 'scenery' ? '🌄 Scenery' : '📦 Object'}
                </span>
              </div>
            )}
            <button
              onClick={resetToPhotoSelection}
              className="w-full mt-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
            >
              Choose Different Photo
            </button>
          </div>

          {/* Theme Selection */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Certificate Theme</h3>
            <div className="space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => updateTheme(theme.id)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedTheme === theme.id
                      ? 'border-amber-500 bg-amber-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white/30"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <p className="font-medium text-white">{theme.name}</p>
                  </div>
                  <p className="text-white/70 text-sm">{theme.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Content Controls */}
          {certificateData && (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Content</h3>
                <button
                  onClick={regenerateAIContent}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate AI</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title (auto-wraps)</label>
                  <input
                    type="text"
                    value={certificateData.title}
                    onChange={(e) => setCertificateData({ ...certificateData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Caption ({certificateData.orientation === 'landscape' ? 'left column' : 'justified'})
                  </label>
                  <textarea
                    value={certificateData.isCustomCaption ? customCaption : certificateData.caption}
                    onChange={(e) => {
                      setCustomCaption(e.target.value);
                      updateCaption(e.target.value, true);
                    }}
                    placeholder="Write your own caption or use AI-generated one..."
                    rows={4}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                  <p className="text-white/50 text-xs mt-1">
                    {certificateData.orientation === 'landscape' 
                      ? 'Text will be placed in the left column with proper wrapping'
                      : 'Text will be fully justified for elegant alignment'
                    }
                  </p>
                  {!certificateData.isCustomCaption && (
                    <button
                      onClick={() => {
                        setCustomCaption(certificateData.caption);
                        updateCaption(certificateData.caption, true);
                      }}
                      className="mt-2 text-amber-400 hover:text-amber-300 text-sm transition-colors"
                    >
                      Edit AI caption
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Certificate Preview</h3>
              {certificateData && (
                <div className="flex items-center space-x-4">
                  <div className="text-white/70 text-sm">
                    {selectedOrientation === 'portrait' ? '📱 Portrait (8.5" × 11")' : '🖥️ Landscape (11" × 8.5")'}
                  </div>
                  <button
                    onClick={generateCertificate}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                  >
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Certificate</span>
                  </button>
                </div>
              )}
            </div>
            
            {isGenerating ? (
              <div className="aspect-[3/4] bg-white/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-spin" />
                  <p className="text-white/70">Analyzing photo and generating content...</p>
                </div>
              </div>
            ) : certificateData ? (
              <div className="space-y-6">
                {generatedCertificate ? (
                  <div className={`${selectedOrientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'} bg-white rounded-lg overflow-hidden shadow-2xl relative`}>
                    <img
                      src={generatedCertificate}
                      alt="Generated certificate"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={downloadCertificate}
                      className="absolute top-4 right-4 w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className={`${selectedOrientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'} bg-white/10 rounded-lg flex items-center justify-center`}>
                    <div className="text-center">
                      <Award className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                      <p className="text-white/70 mb-4">Click "Generate Certificate" to create your memory certificate</p>
                      <div className="text-left max-w-md">
                        <p className="text-white font-semibold mb-2">Preview:</p>
                        <p className="text-amber-400 font-bold text-lg mb-1">{certificateData.title}</p>
                        <p className="text-white/80 text-sm italic mb-2">"{certificateData.caption.substring(0, 100)}..."</p>
                        <p className="text-white/60 text-xs">Certified on {certificateData.date}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white/10 rounded-lg p-4">
                    <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <p className="text-white/70 text-sm">Fixed Layout</p>
                    <p className="text-white text-xs">{selectedOrientation === 'portrait' ? 'Portrait' : 'Two-Column'} Design</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                    <p className="text-white/70 text-sm">Smart Text Flow</p>
                    <p className="text-white text-xs">{selectedOrientation === 'landscape' ? 'Left Column' : 'Auto-Wrap'}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <RotateCcw className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-white/70 text-sm">Perfect Balance</p>
                    <p className="text-white text-xs">No Overlap Design</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <Download className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-white/70 text-sm">Print Ready</p>
                    <p className="text-white text-xs">High Resolution</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] bg-white/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Select a photo to start creating your certificate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default MemoryCertificateGenerator;