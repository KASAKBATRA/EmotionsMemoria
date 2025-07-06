import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Lock, Unlock, Calendar, Heart, Save, Edit3, Clock, Eye, EyeOff } from 'lucide-react';
import { Photo } from '../types';

interface MemoryJournalProps {
  photos: Photo[];
  onBack: () => void;
}

interface JournalEntry {
  id: string;
  photoId: string;
  title: string;
  content: string;
  isPrivate: boolean;
  unlockDate?: Date;
  createdAt: Date;
  mood: string;
  tags: string[];
}

const MemoryJournal: React.FC<MemoryJournalProps> = ({ photos, onBack }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  useEffect(() => {
    // Load existing entries from localStorage
    const savedEntries = localStorage.getItem('memoryJournalEntries');
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
        unlockDate: entry.unlockDate ? new Date(entry.unlockDate) : undefined
      }));
      setEntries(parsed);
    }
  }, []);

  const saveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('memoryJournalEntries', JSON.stringify(newEntries));
  };

  const startWriting = (photo: Photo) => {
    setSelectedPhoto(photo);
    const existingEntry = entries.find(e => e.photoId === photo.id);
    
    if (existingEntry) {
      setCurrentEntry(existingEntry);
    } else {
      setCurrentEntry({
        photoId: photo.id,
        title: '',
        content: '',
        isPrivate: true,
        mood: 'reflective',
        tags: []
      });
    }
    setIsWriting(true);
  };

  const saveEntry = () => {
    if (!selectedPhoto || !currentEntry.content) return;

    const entry: JournalEntry = {
      id: currentEntry.id || crypto.randomUUID(),
      photoId: selectedPhoto.id,
      title: currentEntry.title || `Memory from ${selectedPhoto.uploadedAt.toLocaleDateString()}`,
      content: currentEntry.content,
      isPrivate: currentEntry.isPrivate || false,
      unlockDate: currentEntry.unlockDate,
      createdAt: currentEntry.createdAt || new Date(),
      mood: currentEntry.mood || 'reflective',
      tags: currentEntry.tags || []
    };

    const updatedEntries = currentEntry.id 
      ? entries.map(e => e.id === currentEntry.id ? entry : e)
      : [...entries, entry];

    saveEntries(updatedEntries);
    setIsWriting(false);
    setCurrentEntry({});
    setSelectedPhoto(null);
  };

  const getPhotoForEntry = (photoId: string) => {
    return photos.find(p => p.id === photoId);
  };

  const isEntryLocked = (entry: JournalEntry) => {
    return entry.unlockDate && entry.unlockDate > new Date();
  };

  const formatUnlockDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Unlocked';
    if (diffDays === 1) return 'Unlocks tomorrow';
    if (diffDays <= 7) return `Unlocks in ${diffDays} days`;
    if (diffDays <= 30) return `Unlocks in ${Math.ceil(diffDays / 7)} weeks`;
    return `Unlocks in ${Math.ceil(diffDays / 30)} months`;
  };

  const journalPrompts = [
    "What's something you never told anyone about this day?",
    "What were you thinking about in this moment?",
    "How did this moment change you?",
    "What would you tell your past self about this day?",
    "What emotions were you hiding behind your smile?",
    "What was the story behind this photo that no one knows?",
    "What did this moment teach you about yourself?",
    "What were you hoping for in this moment?"
  ];

  const moods = [
    { value: 'happy', emoji: '😊', color: 'text-yellow-400' },
    { value: 'nostalgic', emoji: '🌅', color: 'text-orange-400' },
    { value: 'peaceful', emoji: '🕊️', color: 'text-blue-400' },
    { value: 'reflective', emoji: '🤔', color: 'text-purple-400' },
    { value: 'grateful', emoji: '🙏', color: 'text-green-400' },
    { value: 'bittersweet', emoji: '😌', color: 'text-pink-400' }
  ];

  const photosWithoutEntries = photos.filter(photo => 
    !entries.some(entry => entry.photoId === photo.id)
  );

  if (isWriting && selectedPhoto) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsWriting(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white">Write Your Memory</h2>
              <p className="text-white/70">Share what this moment means to you</p>
            </div>
          </div>
          
          <button
            onClick={saveEntry}
            disabled={!currentEntry.content}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>Save Entry</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Photo */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="w-full h-auto rounded-lg mb-4"
            />
            <div className="text-center">
              <h3 className="text-white font-semibold">{selectedPhoto.name}</h3>
              <p className="text-white/70 text-sm">{selectedPhoto.uploadedAt.toLocaleDateString()}</p>
            </div>
          </div>

          {/* Writing Interface */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Title (optional)</label>
                <input
                  type="text"
                  value={currentEntry.title || ''}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give this memory a title..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Prompt */}
              <div className="bg-purple-500/20 rounded-lg p-4">
                <p className="text-purple-200 text-sm italic">
                  💭 {journalPrompts[Math.floor(Math.random() * journalPrompts.length)]}
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Your thoughts</label>
                <textarea
                  value={currentEntry.content || ''}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write about this memory... What were you feeling? What was happening that the photo doesn't show?"
                  rows={8}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setCurrentEntry(prev => ({ ...prev, mood: mood.value }))}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        currentEntry.mood === mood.value
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <span>{mood.emoji}</span>
                      <span className="capitalize">{mood.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={currentEntry.isPrivate || false}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, isPrivate: e.target.checked }))}
                      className="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Keep this entry private</span>
                  </label>
                  {currentEntry.isPrivate ? (
                    <Lock className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Unlock className="w-5 h-5 text-green-400" />
                  )}
                </div>

                {currentEntry.isPrivate && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Unlock date (optional)
                    </label>
                    <input
                      type="date"
                      value={currentEntry.unlockDate ? currentEntry.unlockDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setCurrentEntry(prev => ({ 
                        ...prev, 
                        unlockDate: e.target.value ? new Date(e.target.value) : undefined 
                      }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-white/60 text-xs mt-1">
                      Set a future date to create a time capsule
                    </p>
                  </div>
                )}
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
            <h2 className="text-3xl font-bold text-white">Memory Journal</h2>
            <p className="text-white/70">{entries.length} entries • {photosWithoutEntries.length} photos waiting</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-500' : 'hover:bg-white/10'} transition-colors`}
            >
              <BookOpen className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-purple-500' : 'hover:bg-white/10'} transition-colors`}
            >
              <Calendar className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Photos without entries */}
      {photosWithoutEntries.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold text-white mb-6">Photos Waiting for Your Story</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {photosWithoutEntries.slice(0, 12).map((photo) => (
              <div
                key={photo.id}
                className="group cursor-pointer bg-white/5 backdrop-blur-md rounded-lg overflow-hidden border border-white/20 hover:border-white/40 transition-all hover:scale-105"
                onClick={() => startWriting(photo)}
              >
                <div className="aspect-square relative">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {photosWithoutEntries.length > 12 && (
            <p className="text-white/60 text-center mt-4">
              +{photosWithoutEntries.length - 12} more photos waiting for your stories
            </p>
          )}
        </div>
      )}

      {/* Existing Entries */}
      {entries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => {
            const photo = getPhotoForEntry(entry.photoId);
            const isLocked = isEntryLocked(entry);
            const mood = moods.find(m => m.value === entry.mood);
            
            if (!photo) return null;

            return (
              <div
                key={entry.id}
                className="group bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all hover:scale-105"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Privacy/Lock Status */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    {entry.isPrivate && (
                      <div className="bg-purple-500/80 backdrop-blur-sm rounded-full p-2">
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-white" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Mood */}
                  {mood && (
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-sm">{mood.emoji}</span>
                    </div>
                  )}
                  
                  {/* Unlock Date */}
                  {isLocked && entry.unlockDate && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-purple-500/80 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                        <Clock className="w-4 h-4 text-white mx-auto mb-1" />
                        <p className="text-white text-xs">{formatUnlockDate(entry.unlockDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-white font-semibold mb-2 line-clamp-1">{entry.title}</h3>
                  
                  {isLocked ? (
                    <div className="text-center py-4">
                      <Lock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-white/60 text-sm">This memory is locked</p>
                      <p className="text-purple-400 text-xs">{formatUnlockDate(entry.unlockDate!)}</p>
                    </div>
                  ) : (
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-3 mb-4">
                      {entry.content}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{entry.createdAt.toLocaleDateString()}</span>
                    <button
                      onClick={() => startWriting(photo)}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
          <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Start Your Memory Journal</h3>
          <p className="text-white/70 mb-6">
            Click on any photo above to begin writing about your memories and feelings
          </p>
          <div className="bg-purple-500/20 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-purple-200 text-sm italic">
              💭 "What's something you never told anyone about this day?"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryJournal;