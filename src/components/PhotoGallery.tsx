import React, { useState } from 'react';
import { Grid3x3, Cuboid as Cube, Trash2, Download, ZoomIn, X, Heart, Share2, Filter, Search } from 'lucide-react';
import { Photo } from '../types';

interface PhotoGalleryProps {
  photos: Photo[];
  onViewChange: (view: 'collage' | '3d') => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onViewChange }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const togglePhotoSelection = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const selectAll = () => {
    setSelectedPhotos(new Set(filteredPhotos.map(p => p.id)));
  };

  const deselectAll = () => {
    setSelectedPhotos(new Set());
  };

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.name;
    link.click();
  };

  const downloadSelected = () => {
    selectedPhotos.forEach(photoId => {
      const photo = photos.find(p => p.id === photoId);
      if (photo) downloadPhoto(photo);
    });
  };

  // Filter photos based on search and mood
  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = filterMood === 'all' || photo.metadata?.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  const moods = ['all', 'happy', 'peaceful', 'excited', 'nostalgic'];

  const actions = [
    {
      icon: Grid3x3,
      label: 'Create Collage',
      action: () => onViewChange('collage'),
      color: 'from-orange-500 to-red-500',
      description: 'Combine photos into beautiful layouts',
    },
    {
      icon: Cube,
      label: 'View in 3D',
      action: () => onViewChange('3d'),
      color: 'from-blue-500 to-cyan-500',
      description: 'Explore photos in immersive 3D space',
    },
  ];

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'peaceful': return '🕊️';
      case 'excited': return '🎉';
      case 'nostalgic': return '🌅';
      default: return '📸';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Your Photo Gallery</h2>
          <p className="text-white/70">
            {filteredPhotos.length} of {photos.length} photos • {selectedPhotos.size} selected
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {selectedPhotos.size > 0 && (
            <button
              onClick={downloadSelected}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download ({selectedPhotos.size})</span>
            </button>
          )}
          <button
            onClick={selectedPhotos.size === filteredPhotos.length ? deselectAll : selectAll}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            {selectedPhotos.size === filteredPhotos.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-white/70" />
              <select
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {moods.map(mood => (
                  <option key={mood} value={mood} className="bg-gray-800">
                    {mood === 'all' ? 'All Moods' : `${getMoodEmoji(mood)} ${mood.charAt(0).toUpperCase() + mood.slice(1)}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-500' : 'hover:bg-white/10'} transition-colors`}
              >
                <Grid3x3 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={`p-2 rounded ${viewMode === 'masonry' ? 'bg-purple-500' : 'hover:bg-white/10'} transition-colors`}
              >
                <Cube className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="group p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold">{action.label}</h3>
                <p className="text-white/60 text-sm">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No photos found</h3>
          <p className="text-white/60">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' 
            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}>
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div 
                className={`${
                  viewMode === 'grid' ? 'aspect-square' : 'aspect-auto'
                } bg-white/10 rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                  selectedPhotos.has(photo.id) ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-transparent' : ''
                }`}
                onClick={() => togglePhotoSelection(photo.id)}
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Selection Overlay */}
                {selectedPhotos.has(photo.id) && (
                  <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Mood Badge */}
                {photo.metadata?.mood && (
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs">{getMoodEmoji(photo.metadata.mood)}</span>
                  </div>
                )}
              </div>
              
              {/* Photo Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(photo);
                    }}
                    className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm"
                  >
                    <ZoomIn className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPhoto(photo);
                    }}
                    className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="mt-2">
                <p className="text-white/90 text-xs truncate">{photo.name}</p>
                <p className="text-white/60 text-xs">{photo.uploadedAt.toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {/* Photo Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm text-white px-6 py-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{selectedPhoto.name}</h3>
                  <p className="text-sm opacity-75">{selectedPhoto.uploadedAt.toLocaleDateString()}</p>
                  {selectedPhoto.metadata && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedPhoto.metadata.mood && (
                        <span className="px-2 py-1 bg-purple-500/30 text-purple-200 rounded-full text-xs">
                          {getMoodEmoji(selectedPhoto.metadata.mood)} {selectedPhoto.metadata.mood}
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
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadPhoto(selectedPhoto)}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-full transition-colors"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 bg-pink-500 hover:bg-pink-600 rounded-full transition-colors">
                    <Heart className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors">
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;