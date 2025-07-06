import React, { useState } from 'react';
import { Upload, Image, Video, Grid3x3, Cuboid as Cube, Download, Home, ArrowLeft, Sparkles, Wand2, Camera, Heart, Eye, BookOpen, Clock, Award, Zap, RotateCcw, Link, Star, Play, X, HelpCircle, ChevronRight, Smartphone, Monitor, Palette, Music, Share2, FileText, Layers, Target, Lightbulb } from 'lucide-react';
import PhotoUpload from './components/PhotoUpload';
import MediaUpload from './components/MediaUpload';
import PhotoGallery from './components/PhotoGallery';
import CollageGenerator from './components/CollageGenerator';
import Gallery3D from './components/Gallery3D';
import UnspokenMoments from './components/UnspokenMoments';
import MemoryCertificateGenerator from './components/MemoryCertificateGenerator';
import AnimatedMemories from './components/AnimatedMemories';
import MemoryWheel from './components/MemoryWheel';
import ThreadedMemories from './components/ThreadedMemories';
import { Photo, VideoClip } from './types';

type View = 'home' | 'upload' | 'options' | 'gallery' | 'collage' | '3d' | 'unspoken' | 'certificate' | 'animated' | 'wheel' | 'threaded' | 'how-to-use';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<VideoClip[]>([]);

  const handlePhotosUploaded = (newPhotos: Photo[]) => {
    setPhotos(prev => [...prev, ...newPhotos]);
    setCurrentView('options');
  };

  const handleMediaUploaded = (newPhotos: Photo[], newVideos: VideoClip[]) => {
    setPhotos(prev => [...prev, ...newPhotos]);
    setVideos(prev => [...prev, ...newVideos]);
    setCurrentView('options');
  };

  const renderView = () => {
    switch (currentView) {
      case 'upload':
        return <MediaUpload onMediaUploaded={handleMediaUploaded} />;
      case 'options':
        return <OptionsView onViewChange={setCurrentView} photos={photos} videos={videos} />;
      case 'gallery':
        return <PhotoGallery photos={photos} onViewChange={setCurrentView} />;
      case 'collage':
        return <CollageGenerator photos={photos} onBack={() => setCurrentView('options')} />;
      case '3d':
        return <Gallery3D photos={photos} onBack={() => setCurrentView('options')} />;
      case 'unspoken':
        return <UnspokenMoments videos={videos} onBack={() => setCurrentView('options')} />;
      case 'certificate':
        return <MemoryCertificateGenerator photos={photos} onBack={() => setCurrentView('options')} />;
      case 'animated':
        return <AnimatedMemories photos={photos} onBack={() => setCurrentView('options')} />;
      case 'wheel':
        return <MemoryWheel photos={photos} onBack={() => setCurrentView('options')} />;
      case 'threaded':
        return <ThreadedMemories photos={photos} onBack={() => setCurrentView('options')} />;
      case 'how-to-use':
        return <HowToUseView onBack={() => setCurrentView('home')} />;
      default:
        return <HomeView onViewChange={setCurrentView} photosCount={photos.length} videosCount={videos.length} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Ultra Creative Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated Mesh Gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-0 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-6000"></div>
        </div>

        {/* Floating Photo Frames with Realistic Photos */}
        <div className="absolute top-16 left-16 w-40 h-48 transform rotate-12 animate-float-gentle">
          <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="w-full h-3/4 bg-gradient-to-br from-pink-400/30 to-purple-500/30 flex items-center justify-center">
              <img 
                src="https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Memory" 
                className="w-full h-full object-cover opacity-60"
              />
            </div>
            <div className="h-1/4 bg-white/20 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white/50" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-32 right-20 w-36 h-44 transform -rotate-6 animate-float-delayed">
          <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="w-full h-3/4 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 flex items-center justify-center">
              <img 
                src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Memory" 
                className="w-full h-full object-cover opacity-60"
              />
            </div>
            <div className="h-1/4 bg-white/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white/50" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-24 left-24 w-32 h-40 transform rotate-6 animate-float-slow">
          <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="w-full h-3/4 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 flex items-center justify-center">
              <img 
                src="https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Memory" 
                className="w-full h-full object-cover opacity-60"
              />
            </div>
            <div className="h-1/4 bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white/50" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-40 right-16 w-28 h-36 transform -rotate-12 animate-float">
          <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="w-full h-3/4 bg-gradient-to-br from-orange-400/30 to-red-500/30 flex items-center justify-center">
              <img 
                src="https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Memory" 
                className="w-full h-full object-cover opacity-60"
              />
            </div>
            <div className="h-1/4 bg-white/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-white/50" />
            </div>
          </div>
        </div>

        {/* Floating Memory Cards */}
        <div className="absolute top-1/4 left-1/3 w-24 h-32 transform rotate-45 animate-spin-slow">
          <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white/40" />
          </div>
        </div>

        <div className="absolute bottom-1/3 right-1/4 w-20 h-28 transform -rotate-30 animate-bounce-slow">
          <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-white/40" />
          </div>
        </div>

        {/* Geometric Shapes */}
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 transform rotate-45 animate-spin-reverse"></div>
        <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-full animate-ping-slow"></div>

        {/* Floating Particles with Different Sizes */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-pink-400/60 rounded-full animate-float-particle"></div>
        <div className="absolute top-3/4 right-1/3 w-4 h-4 bg-purple-400/60 rounded-full animate-float-particle-delayed"></div>
        <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-blue-400/60 rounded-full animate-float-particle-slow"></div>
        <div className="absolute bottom-1/4 left-1/2 w-5 h-5 bg-emerald-400/60 rounded-full animate-float-particle-fast"></div>
        <div className="absolute top-1/6 right-1/6 w-3 h-3 bg-yellow-400/60 rounded-full animate-float-particle"></div>
        <div className="absolute bottom-1/6 left-1/6 w-4 h-4 bg-rose-400/60 rounded-full animate-float-particle-delayed"></div>

        {/* Animated Lines/Connections */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path 
            d="M100,200 Q300,100 500,200 T900,200" 
            stroke="url(#lineGradient)" 
            strokeWidth="2" 
            fill="none"
            className="animate-draw-line"
          />
          <path 
            d="M200,400 Q400,300 600,400 T1000,400" 
            stroke="url(#lineGradient)" 
            strokeWidth="2" 
            fill="none"
            className="animate-draw-line-delayed"
          />
        </svg>

        {/* Large Gradient Orbs with Animation */}
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-violet-500/10 rounded-full blur-3xl animate-morph"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-full blur-3xl animate-morph-delayed"></div>
        <div className="absolute top-1/2 right-10 w-64 h-64 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-lime-500/10 rounded-full blur-3xl animate-morph-slow"></div>

        {/* Constellation Effect */}
        <div className="absolute top-1/3 left-1/5 w-1 h-1 bg-white/60 rounded-full animate-twinkle"></div>
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white/60 rounded-full animate-twinkle-delayed"></div>
        <div className="absolute top-2/3 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-twinkle-slow"></div>
        <div className="absolute top-1/4 right-1/5 w-1 h-1 bg-white/60 rounded-full animate-twinkle"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white/60 rounded-full animate-twinkle-delayed"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/60 rounded-full animate-twinkle-slow"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {currentView !== 'home' && (
                <button
                  onClick={() => setCurrentView(currentView === 'options' ? 'home' : 'options')}
                  className="p-2 sm:p-3 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 group"
                >
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-pink-300 transition-colors" />
                </button>
              )}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r from-pink-500 to-purple-500">
                    <Camera className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Memoria
                  </h1>
                  <p className="text-xs font-medium text-purple-200 hidden sm:block" style={{ fontFamily: 'Poppins, sans-serif' }}>Where emotions meet memories</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-6">
              {/* How to Use Button - Mobile Friendly */}
              {currentView === 'home' && (
                <button
                  onClick={() => setCurrentView('how-to-use')}
                  className="group relative inline-flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-6 sm:py-3 rounded-full text-white text-sm sm:text-base font-bold transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 animate-hero-glow"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" />
                  <span className="hidden sm:inline">How to Use</span>
                  <span className="sm:hidden">Help</span>
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 group-hover:text-pink-200 transition-colors" />
                  
                  {/* Button glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                </button>
              )}
              
              {/* Made with Love by KASAK - Mobile Friendly */}
              <div className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="text-white/80 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Made with ❤️ by
                </span>
                <span className="text-white font-bold text-sm bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  KASAK
                </span>
              </div>
              
              {photos.length > 0 && (
                <div className="flex items-center space-x-2 sm:space-x-4 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 sm:px-6 sm:py-3 border border-white/20">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Image className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    <span className="text-xs sm:text-sm font-medium text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{photos.length}</span>
                  </div>
                  {videos.length > 0 && (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Video className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      <span className="text-xs sm:text-sm font-medium text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{videos.length}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {renderView()}
      </main>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-15px) rotate(15deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(-6deg); }
          50% { transform: translateY(-20px) rotate(-3deg); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(6deg); }
          50% { transform: translateY(-10px) rotate(9deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-25px) rotate(-9deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(-30deg); }
          50% { transform: translateY(-20px) rotate(-25deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }

        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }

        @keyframes float-particle-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-8px) translateX(-3px); }
          50% { transform: translateY(-12px) translateX(7px); }
          75% { transform: translateY(-6px) translateX(-2px); }
        }

        @keyframes float-particle-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-8px) translateX(4px); }
        }

        @keyframes float-particle-fast {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          20% { transform: translateY(-12px) translateX(6px); }
          40% { transform: translateY(-8px) translateX(-4px); }
          60% { transform: translateY(-15px) translateX(8px); }
          80% { transform: translateY(-5px) translateX(-6px); }
        }

        @keyframes morph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }

        @keyframes morph-delayed {
          0%, 100% { border-radius: 40% 60% 60% 40% / 60% 30% 60% 70%; }
          50% { border-radius: 60% 40% 30% 70% / 40% 70% 60% 30%; }
        }

        @keyframes morph-slow {
          0%, 100% { border-radius: 70% 30% 50% 50% / 30% 70% 40% 60%; }
          50% { border-radius: 50% 50% 70% 30% / 70% 40% 60% 30%; }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        @keyframes twinkle-delayed {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }

        @keyframes twinkle-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes draw-line {
          0% { stroke-dasharray: 0 1000; }
          100% { stroke-dasharray: 1000 0; }
        }

        @keyframes draw-line-delayed {
          0% { stroke-dasharray: 0 800; }
          100% { stroke-dasharray: 800 0; }
        }

        @keyframes hero-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes hero-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(236, 72, 153, 0.3); }
        }

        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-6000 {
          animation-delay: 6s;
        }

        .animate-float-gentle {
          animation: float-gentle 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-float-particle {
          animation: float-particle 6s ease-in-out infinite;
        }

        .animate-float-particle-delayed {
          animation: float-particle-delayed 8s ease-in-out infinite;
        }

        .animate-float-particle-slow {
          animation: float-particle-slow 10s ease-in-out infinite;
        }

        .animate-float-particle-fast {
          animation: float-particle-fast 4s ease-in-out infinite;
        }

        .animate-morph {
          animation: morph 8s ease-in-out infinite;
        }

        .animate-morph-delayed {
          animation: morph-delayed 10s ease-in-out infinite;
        }

        .animate-morph-slow {
          animation: morph-slow 12s ease-in-out infinite;
        }

        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        .animate-twinkle-delayed {
          animation: twinkle-delayed 4s ease-in-out infinite;
        }

        .animate-twinkle-slow {
          animation: twinkle-slow 5s ease-in-out infinite;
        }

        .animate-draw-line {
          animation: draw-line 8s ease-in-out infinite;
        }

        .animate-draw-line-delayed {
          animation: draw-line-delayed 10s ease-in-out infinite;
        }

        .animate-hero-float {
          animation: hero-float 6s ease-in-out infinite;
        }

        .animate-hero-glow {
          animation: hero-glow 4s ease-in-out infinite;
        }

        .animate-text-shimmer {
          background: linear-gradient(90deg, #ffffff 0%, #a855f7 50%, #ec4899 100%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: text-shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

function HomeView({ onViewChange, photosCount, videosCount }: { 
  onViewChange: (view: View) => void; 
  photosCount: number;
  videosCount: number;
}) {
  const features = [
    {
      icon: Image,
      title: 'Photo Gallery',
      description: 'Browse and organize your memories',
      color: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/25',
      action: () => onViewChange('gallery'),
      featured: true,
    },
    {
      icon: Grid3x3,
      title: 'Smart Collages',
      description: 'Create artistic photo layouts',
      color: 'from-pink-500 to-rose-500',
      glow: 'shadow-pink-500/25',
      action: () => onViewChange('collage'),
    },
    {
      icon: Sparkles,
      title: 'Animate Photos',
      description: 'Bring your photos to life',
      color: 'from-purple-500 to-violet-500',
      glow: 'shadow-purple-500/25',
      action: null, // Disabled
      disabled: true,
      comingSoon: true,
    },
    {
      icon: RotateCcw,
      title: 'Memory Wheel',
      description: 'Spin for hidden stories',
      color: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/25',
      action: () => onViewChange('wheel'),
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Beautiful memory certificates',
      color: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/25',
      action: () => onViewChange('certificate'),
    },
    {
      icon: Link,
      title: 'Memory Threads',
      description: 'Connect photos into stories',
      color: 'from-orange-500 to-red-500',
      glow: 'shadow-orange-500/25',
      action: () => onViewChange('threaded'),
    },
    {
      icon: Cube,
      title: '3D Gallery',
      description: 'Immersive photo experience',
      color: 'from-indigo-500 to-purple-500',
      glow: 'shadow-indigo-500/25',
      action: () => onViewChange('3d'),
    },
    {
      icon: Eye,
      title: 'Video Frame Extractor',
      description: 'Extract emotional moments from videos',
      color: 'from-red-500 to-pink-500',
      glow: 'shadow-red-500/25',
      action: () => onViewChange('unspoken'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section - Mobile Optimized */}
      <div className="relative py-12 sm:py-20 lg:py-32">
        <div className="text-center">
          {/* Hero Badge - Mobile Friendly */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 sm:px-6 sm:py-3 border border-white/20 mb-6 sm:mb-8 animate-hero-float">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <span className="text-white/90 text-xs sm:text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
              AI-Powered Memory Platform
            </span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          </div>

          {/* Main Hero Title - Mobile Responsive */}
          <div className="relative mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold leading-tight mb-4 sm:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              <span className="block animate-text-shimmer">
                Transform
              </span>
              <span className="block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Your Memories
              </span>
              <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Into Magic
              </span>
            </h1>
            
            {/* Floating decorative elements around title - Responsive */}
            <div className="absolute -top-4 sm:-top-8 -left-4 sm:-left-8 w-8 h-8 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-pulse-slow"></div>
            <div className="absolute -top-2 sm:-top-4 -right-6 sm:-right-12 w-6 h-6 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-bounce-slow"></div>
            <div className="absolute -bottom-3 sm:-bottom-6 left-1/4 w-4 h-4 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full animate-ping-slow"></div>
            <div className="absolute -bottom-4 sm:-bottom-8 right-1/3 w-5 h-5 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full animate-float-particle"></div>
          </div>
          
          {/* Hero Subtitle - Mobile Responsive */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed text-purple-100/90 px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Where AI meets emotion to create
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-semibold"> stunning visual stories </span>
            from your most precious moments
          </p>
          
          {/* Hero CTA Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 sm:mb-16 px-4">
            <button
              onClick={() => onViewChange('upload')}
              className="group relative inline-flex items-center space-x-2 sm:space-x-4 px-8 py-4 sm:px-12 sm:py-6 rounded-full text-white text-lg sm:text-xl font-bold transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 hover:from-pink-400 hover:via-purple-400 hover:to-violet-400 animate-hero-glow w-full sm:w-auto"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-bounce" />
              <span>Start Creating Magic</span>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-pink-200 transition-colors" />
              
              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
            </button>
          </div>
          
          {/* Hero Stats - Mobile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-20 px-4">
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-3 sm:px-6 border border-white/20">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
              <div className="text-center sm:text-left">
                <p className="text-white font-bold text-base sm:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>AI-Powered</p>
                <p className="text-purple-200 text-xs sm:text-sm">Smart Analysis</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-3 sm:px-6 border border-white/20">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-300" />
              <div className="text-center sm:text-left">
                <p className="text-white font-bold text-base sm:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Emotional</p>
                <p className="text-purple-200 text-xs sm:text-sm">Story Creation</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-3 sm:px-6 border border-white/20">
              <Download className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
              <div className="text-center sm:text-left">
                <p className="text-white font-bold text-base sm:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Export Ready</p>
                <p className="text-purple-200 text-xs sm:text-sm">High Quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid - Mobile Responsive */}
      <div className="mb-12 sm:mb-20">
        <h3 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent px-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          What You Can Create
        </h3>
        <p className="text-lg sm:text-xl text-center mb-8 sm:mb-12 text-purple-100/80 max-w-3xl mx-auto px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Discover the endless possibilities of AI-powered memory creation
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 px-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                feature.disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={feature.action || undefined}
            >
              <div 
                className={`relative bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-white/40 transition-all duration-500 overflow-hidden shadow-2xl hover:shadow-3xl ${feature.glow} hover:bg-white/10 ${feature.featured ? 'ring-2 ring-blue-500/50' : ''} ${
                  feature.disabled ? 'hover:scale-100 hover:translate-y-0' : ''
                }`}
              >
                {/* Background Gradient */}
                <div 
                  className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${feature.color} ${
                    feature.disabled ? 'group-hover:opacity-10' : ''
                  }`}
                ></div>
                
                <div className="relative z-10">
                  <div 
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg bg-gradient-to-r ${feature.color} ${
                      feature.disabled ? 'group-hover:scale-100 group-hover:rotate-0' : ''
                    }`}
                  >
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white group-hover:text-purple-200 transition-colors duration-300" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {feature.title}
                  </h3>
                  {feature.featured && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/30 text-blue-200 mb-2 sm:mb-3 inline-block" style={{ fontFamily: 'Poppins, sans-serif' }}>FEATURED</span>
                  )}
                  {feature.comingSoon && (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-500/30 text-amber-200 mb-2 sm:mb-3 inline-block" style={{ fontFamily: 'Poppins, sans-serif' }}>AVAILABLE SOON</span>
                  )}
                  <p className="leading-relaxed text-purple-200 group-hover:text-white transition-colors duration-300 text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {feature.description}
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r ${feature.color} ${
                    feature.disabled ? 'group-hover:scale-x-0' : ''
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section - Mobile Optimized */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-white/20 shadow-2xl mb-12 sm:mb-20 mx-4">
        <h3 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>
          How Memoria Works
        </h3>
        <p className="text-lg sm:text-xl text-center mb-8 sm:mb-12 text-purple-100/80 max-w-3xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Four simple steps to transform your memories into magical experiences
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            {
              step: 1,
              title: 'Upload & Analyze',
              description: 'Upload photos and videos. AI analyzes emotions and expressions',
              color: 'from-pink-500 to-rose-500',
              icon: Upload,
            },
            {
              step: 2,
              title: 'Discover Magic',
              description: 'Animate photos, spin the memory wheel, and thread stories',
              color: 'from-purple-500 to-violet-500',
              icon: Zap,
            },
            {
              step: 3,
              title: 'Create Stories',
              description: 'Generate captions, extract frames, and build narratives',
              color: 'from-blue-500 to-cyan-500',
              icon: Wand2,
            },
            {
              step: 4,
              title: 'Preserve Forever',
              description: 'Save enhanced memories with certificates and presentations',
              color: 'from-emerald-500 to-teal-500',
              icon: Heart,
            },
          ].map((item, index) => (
            <div key={index} className="text-center group">
              <div 
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg bg-gradient-to-r ${item.color}`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {item.step}
              </div>
              <div 
                className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-md bg-gradient-to-r ${item.color}`}
              >
                <item.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <h4 className="font-bold mb-2 sm:mb-3 text-base sm:text-lg text-white group-hover:text-purple-200 transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {item.title}
              </h4>
              <p className="leading-relaxed text-purple-200 group-hover:text-white transition-colors text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA Section - Mobile Optimized */}
      <div className="text-center py-12 sm:py-20 px-4">
        <div className="relative inline-block mb-6 sm:mb-8">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Begin?
          </h2>
          <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full animate-bounce flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        </div>
        
        <p className="text-lg sm:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed text-purple-100/90" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Join thousands who have already transformed their memories into magical stories
        </p>
        
        <button
          onClick={() => onViewChange('upload')}
          className="group inline-flex items-center space-x-2 sm:space-x-4 px-8 py-4 sm:px-12 sm:py-6 rounded-full text-white text-lg sm:text-xl font-bold transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 hover:from-pink-400 hover:via-purple-400 hover:to-violet-400 animate-hero-glow w-full sm:w-auto max-w-sm sm:max-w-none mx-auto"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <Upload className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-bounce" />
          <span>Start Your Journey</span>
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-pink-200 transition-colors" />
        </button>
      </div>
    </div>
  );
}

function HowToUseView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with Mobile Optimization */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Animated Background Elements - Responsive */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Orbs - Fewer on mobile */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-morph"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-morph-delayed"></div>
          <div className="absolute top-1/2 right-1/6 w-24 h-24 sm:w-48 sm:h-48 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-morph-slow"></div>
          
          {/* Floating Sparkles - Responsive */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white/60 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 border border-white/20"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <span className="text-white font-medium text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 sm:py-2 border border-white/20">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <span className="text-white/80 text-xs sm:text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Guide</span>
          </div>
        </div>

        {/* Main Title - Mobile Responsive */}
        <div className="text-center mb-8 sm:mb-16">
          <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 sm:px-6 sm:py-3 border border-white/20 mb-6 sm:mb-8">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 animate-pulse" />
            <span className="text-white font-bold text-sm sm:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>How to Use the Memoria</span>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400 animate-pulse" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Turn moments into magic
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-purple-100 italic mb-6 sm:mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            effortlessly, beautifully, and forever.
          </p>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-purple-100/90 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Welcome to a space that doesn't just store your photos — it tells your story.
            </p>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-purple-100/90" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Here, every image becomes a feeling, every video a memory frozen in time. Let us show you how to relive your most cherished moments:
            </p>
          </div>
        </div>

        {/* Steps Section - Mobile Optimized Grid */}
        <div className="space-y-8 sm:space-y-16">
          {/* Step 1 */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      📤 Step 1: Upload What Matters
                    </h2>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 text-purple-100/90" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <p className="text-base sm:text-lg leading-relaxed">
                    Tap the "Upload Files" button to begin your journey.
                  </p>
                  <p className="text-base sm:text-lg leading-relaxed">
                    Whether it's a smile shared between friends, the quiet calm of a sunset, or a video that holds a heartbeat — this is where your memories come to life.
                  </p>
                  <div className="bg-emerald-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-500/30 mt-4 sm:mt-6">
                    <p className="text-emerald-200 text-sm sm:text-base italic flex items-center space-x-2">
                      <span>🌿</span>
                      <span>Big or small, loud or soft — every memory deserves a frame.</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4">
                <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-pink-500/30 text-center">
                  <Smartphone className="w-12 h-12 sm:w-16 sm:h-16 text-pink-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-pink-200 text-sm sm:text-base font-medium">Mobile & Desktop Friendly</p>
                  <p className="text-pink-200/70 text-xs sm:text-sm mt-2">Upload from any device</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-4 order-2 lg:order-1">
                <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/30 text-center">
                  <Target className="w-12 h-12 sm:w-16 sm:h-16 text-purple-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-purple-200 text-sm sm:text-base font-medium">Smart AI Selection</p>
                  <p className="text-purple-200/70 text-xs sm:text-sm mt-2">Choose your perfect style</p>
                </div>
              </div>
              <div className="lg:col-span-8 order-1 lg:order-2">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      🎯 Step 2: Choose the Way You Want to Remember
                    </h2>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 text-purple-100/90" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <p className="text-base sm:text-lg leading-relaxed">
                    Once your files are uploaded, explore how you'd like to transform them:
                  </p>
                  
                  {/* Feature Grid - Mobile Responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                    {[
                      { icon: Image, title: 'Photo Gallery', desc: 'Soft, thoughtful digital memory book' },
                      { icon: Grid3x3, title: 'Memory Collage', desc: 'AI arranges photos with perfect harmony' },
                      { icon: Award, title: 'Memory Certificate', desc: 'Beautiful keepsake certificates' },
                      { icon: Eye, title: 'Unspoken Moments', desc: 'Extract soul-stirring video frames' },
                      { icon: RotateCcw, title: 'Memory Wheel', desc: 'Spin emotions with gentle animations' },
                      { icon: Link, title: 'Threaded Memories', desc: 'Timeline like Polaroids on string' }
                    ].map((feature, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-3 sm:p-4 border border-white/20">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                          <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                          <h4 className="font-semibold text-white text-sm sm:text-base">{feature.title}</h4>
                        </div>
                        <p className="text-purple-200/80 text-xs sm:text-sm">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      🎨 Step 3: Customize, Effortlessly
                    </h2>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 text-purple-100/90" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <p className="text-base sm:text-lg leading-relaxed">
                    We've placed all your settings where your hands naturally go — to the left and right, so no more scrolling.
                  </p>
                  <p className="text-base sm:text-lg leading-relaxed">
                    Change fonts, colors, captions, backgrounds — all in real time as your memory builds before your eyes.
                  </p>
                  <div className="bg-blue-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-500/30 mt-4 sm:mt-6">
                    <p className="text-blue-200 text-sm sm:text-base italic flex items-center space-x-2">
                      <span>✏️</span>
                      <span>It's your memory. Shape it the way your heart remembers it.</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/30 text-center">
                  <Layers className="w-12 h-12 sm:w-16 sm:h-16 text-blue-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-blue-200 text-sm sm:text-base font-medium">Real-time Preview</p>
                  <p className="text-blue-200/70 text-xs sm:text-sm mt-2">See changes instantly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-4 order-2 lg:order-1">
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/30 text-center">
                  <Download className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-emerald-200 text-sm sm:text-base font-medium">High Quality Export</p>
                  <p className="text-emerald-200/70 text-xs sm:text-sm mt-2">Print & share ready</p>
                </div>
              </div>
              <div className="lg:col-span-8 order-1 lg:order-2">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <Download className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      ⬇️ Step 4: Save and Keep Forever
                    </h2>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 text-purple-100/90" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <p className="text-base sm:text-lg leading-relaxed">
                    With one click, you can download your creation — whether it's a story thread, a heartfelt certificate, or a spinning wheel of joy.
                  </p>
                  <p className="text-base sm:text-lg leading-relaxed">
                    Each output is high-resolution, thoughtfully composed, and ready to be printed, shared, or simply held close.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Message - Mobile Optimized */}
        <div className="text-center mt-12 sm:mt-20 mb-8 sm:mb-12">
          <div className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-violet-500/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-white/20 shadow-2xl max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-pulse" />
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Because some moments aren't just meant to be remembered
              </h3>
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400 animate-pulse" />
            </div>
            <p className="text-lg sm:text-xl md:text-2xl text-purple-100 mb-4 sm:mb-6 italic" style={{ fontFamily: 'Poppins, sans-serif' }}>
              They're meant to be felt again.
            </p>
            <p className="text-base sm:text-lg text-purple-100/90 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
              This app helps you do exactly that — with elegance, ease, and emotion.
            </p>
          </div>
        </div>

        {/* Device Compatibility - Mobile Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Works Beautifully Everywhere
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 bg-white/10 rounded-xl border border-white/20">
              <Smartphone className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-3 sm:mb-4" />
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Mobile Phones</h4>
              <p className="text-purple-200/80 text-xs sm:text-sm">Touch-optimized interface</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/10 rounded-xl border border-white/20">
              <Monitor className="w-8 h-8 sm:w-12 sm:h-12 text-green-400 mx-auto mb-3 sm:mb-4" />
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Desktop</h4>
              <p className="text-purple-200/80 text-xs sm:text-sm">Full-featured experience</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/10 rounded-xl border border-white/20">
              <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-3 sm:mb-4" />
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">All Formats</h4>
              <p className="text-purple-200/80 text-xs sm:text-sm">Photos, videos, documents</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/10 rounded-xl border border-white/20">
              <Share2 className="w-8 h-8 sm:w-12 sm:h-12 text-pink-400 mx-auto mb-3 sm:mb-4" />
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Easy Sharing</h4>
              <p className="text-purple-200/80 text-xs sm:text-sm">Download & share instantly</p>
            </div>
          </div>
        </div>

        {/* Call to Action - Mobile Optimized */}
        <div className="text-center mt-12 sm:mt-16">
          <button
            onClick={onBack}
            className="group inline-flex items-center space-x-2 sm:space-x-4 px-8 py-4 sm:px-12 sm:py-6 rounded-full text-white text-lg sm:text-xl font-bold transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 hover:from-pink-400 hover:via-purple-400 hover:to-violet-400 animate-hero-glow w-full sm:w-auto max-w-sm sm:max-w-none mx-auto"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-bounce" />
            <span>Start Creating Memories</span>
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

function OptionsView({ onViewChange, photos, videos }: { 
  onViewChange: (view: View) => void; 
  photos: Photo[];
  videos: VideoClip[];
}) {
  const options = [
    {
      icon: Image,
      title: 'Photo Gallery',
      description: 'Browse and organize your memories',
      action: () => onViewChange('gallery'),
      color: 'from-blue-500 to-cyan-500',
      disabled: photos.length === 0,
      featured: true,
    },
    {
      icon: Zap,
      title: 'Animated Memories',
      description: 'Bring photos to life with magical animations',
      action: null, // Disabled
      color: 'from-purple-500 to-pink-500',
      disabled: true,
      comingSoon: true,
    },
    {
      icon: RotateCcw,
      title: 'Memory Wheel',
      description: 'Spin to discover hidden poetic stories',
      action: () => onViewChange('wheel'),
      color: 'from-blue-500 to-indigo-500',
      disabled: photos.length === 0,
      featured: true,
    },
    {
      icon: Link,
      title: 'Threaded Memories',
      description: 'Connect photos into story arcs',
      action: () => onViewChange('threaded'),
      color: 'from-green-500 to-emerald-500',
      disabled: photos.length === 0,
      featured: true,
    },
    {
      icon: Award,
      title: 'Memory Certificates',
      description: 'Create beautiful certificates',
      action: () => onViewChange('certificate'),
      color: 'from-amber-500 to-orange-500',
      disabled: photos.length === 0,
    },
    {
      icon: Eye,
      title: 'Video Frame Extractor',
      description: 'Extract emotional moments from videos',
      action: () => onViewChange('unspoken'),
      color: 'from-blue-500 to-purple-500',
      disabled: videos.length === 0,
    },
    {
      icon: Grid3x3,
      title: 'Smart Collages',
      description: 'Generate artistic collages',
      action: () => onViewChange('collage'),
      color: 'from-orange-500 to-red-500',
      disabled: photos.length === 0,
    },
    {
      icon: Cube,
      title: 'Immersive 3D Gallery',
      description: 'Experience photos in 3D',
      action: () => onViewChange('3d'),
      color: 'from-indigo-500 to-pink-500',
      disabled: photos.length === 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>Your Memories Are Ready</h2>
        <p className="text-lg text-purple-100" style={{ fontFamily: 'Poppins, sans-serif' }}>Choose what you'd like to create with your {photos.length} photos and {videos.length} videos</p>
      </div>

      {/* Uploaded Media Preview */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-12 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Your Uploaded Media</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3">
          {[...photos, ...videos].slice(0, 12).map((media, index) => (
            <div key={media.id} className="aspect-square bg-white/10 rounded-lg overflow-hidden shadow-sm">
              <img
                src={'thumbnail' in media ? media.thumbnail || media.url : media.url}
                alt={media.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {photos.length + videos.length > 12 && (
            <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-purple-200" style={{ fontFamily: 'Poppins, sans-serif' }}>+{photos.length + videos.length - 12}</span>
            </div>
          )}
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={option.disabled || !option.action ? undefined : option.action}
            disabled={option.disabled || !option.action}
            className={`group p-6 rounded-2xl border transition-all duration-300 text-left ${
              option.disabled || !option.action
                ? 'opacity-50 cursor-not-allowed border-white/10 bg-white/5' 
                : 'hover:scale-105 hover:-translate-y-2 border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 shadow-lg hover:shadow-xl'
            } ${option.featured ? 'ring-2 ring-purple-500/50' : ''}`}
            style={{ boxShadow: option.disabled || !option.action ? 'none' : '0 4px 12px rgba(0,0,0,0.3)' }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center ${
                option.disabled || !option.action ? 'opacity-50' : 'group-hover:scale-110 group-hover:rotate-6'
              } transition-all duration-300 shadow-md`}>
                <option.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {option.title}
                </h3>
                {option.featured && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/30 text-purple-200" style={{ fontFamily: 'Poppins, sans-serif' }}>FEATURED</span>
                )}
                {option.comingSoon && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/30 text-amber-200" style={{ fontFamily: 'Poppins, sans-serif' }}>AVAILABLE SOON</span>
                )}
              </div>
            </div>
            <p className="text-purple-200 group-hover:text-white transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {option.description}
            </p>
          </button>
        ))}
      </div>

      {/* Upload More Button */}
      <div className="text-center mt-12">
        <button
          onClick={() => onViewChange('upload')}
          className="inline-flex items-center space-x-3 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all hover:scale-105 border border-white/20 shadow-lg text-white"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <Upload className="w-5 h-5" />
          <span>Upload More Media</span>
        </button>
      </div>
    </div>
  );
}

export default App;