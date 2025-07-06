export interface Photo {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
  metadata?: {
    location?: string;
    timestamp?: Date;
    faces?: number;
    mood?: 'happy' | 'sad' | 'excited' | 'peaceful' | 'nostalgic';
    environment?: 'indoor' | 'outdoor' | 'nature' | 'urban' | 'beach' | 'mountain';
    colors?: string[];
    objects?: string[];
  };
}

export interface VideoClip {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  duration: number;
  uploadedAt: Date;
  thumbnail?: string;
  metadata?: {
    location?: string;
    timestamp?: Date;
    mood?: 'happy' | 'sad' | 'excited' | 'peaceful' | 'nostalgic';
    environment?: 'indoor' | 'outdoor' | 'nature' | 'urban' | 'beach' | 'mountain';
    highlights?: { timestamp: number; description: string }[];
  };
}

export interface MemoryStory {
  id: string;
  title: string;
  description: string;
  mood: 'happy' | 'sad' | 'excited' | 'peaceful' | 'nostalgic' | 'romantic' | 'adventurous';
  photos: Photo[];
  videos: VideoClip[];
  suggestedMusic: {
    genre: string;
    tempo: 'slow' | 'medium' | 'fast';
    mood: string;
    suggestions: string[];
  };
  captions: {
    mediaId: string;
    text: string;
    emotion: string;
    timing: number;
  }[];
  transitions: {
    type: 'fade' | 'slide' | 'zoom' | 'split' | 'cinematic' | 'parallax';
    duration: number;
  }[];
  createdAt: Date;
}

export interface CollageLayout {
  id: string;
  name: string;
  template: 'grid' | 'mosaic' | 'polaroid' | 'magazine';
  aspectRatio: string;
  maxPhotos: number;
}

export interface SlideshowSettings {
  duration: number;
  transition: 'fade' | 'slide' | 'zoom' | 'flip';
  music?: string;
  title?: string;
}

export interface Gallery3DSettings {
  mode: 'cube' | 'carousel' | 'sphere';
  autoRotate: boolean;
  speed: number;
}

export interface MemoryVideoSettings {
  duration: 'auto' | 'short' | 'medium' | 'long';
  style: 'cinematic' | 'documentary' | 'artistic' | 'social';
  includeText: boolean;
  musicVolume: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
}