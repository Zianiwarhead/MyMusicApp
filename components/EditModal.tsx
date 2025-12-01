
import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  onSave: (updatedSong: Song) => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, song, onSave }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (song) {
        setTitle(song.title);
        setArtist(song.artist);
        setCoverUrl(song.artUrl);
    }
  }, [song]);

  if (!isOpen || !song) return null;

  // Helper: Convert File to Base64 (Persistent Storage)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const base64 = await fileToBase64(file);
          setCoverUrl(base64);
      }
  };

  // --- Advanced Drag & Drop ---

  const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
          setIsDragging(true);
      }
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
          setIsDragging(false);
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      // 1. Check for Local Files (Desktop Drag)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
              const base64 = await fileToBase64(file);
              setCoverUrl(base64);
          }
          return;
      }

      // 2. Check for Web Images (Browser/Web Drag)
      // This grabs the URL directly from the dragged element
      const imageUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:image'))) {
          setCoverUrl(imageUrl);
      }
  };

  const handleSave = () => {
      onSave({
          ...song,
          title,
          artist,
          artUrl: coverUrl
      });
  };

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1c1c1e] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 border border-gray-200 dark:border-white/10" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Track</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                <i className="fas fa-times text-gray-500"></i>
            </button>
        </div>
        
        <div className="flex flex-col gap-5">
            {/* Cover Art Input */}
            <div className="flex justify-center">
                <div 
                    className={`w-40 h-40 rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden relative group transition-all cursor-pointer ${isDragging ? 'ring-4 ring-rose-500 scale-105' : 'shadow-lg'}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <img src={coverUrl} className={`w-full h-full object-cover transition-opacity ${isDragging ? 'opacity-50' : ''}`} alt="Cover" />
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <i className={`fas ${isDragging ? 'fa-arrow-down' : 'fa-camera'} text-white text-3xl mb-2`}></i>
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                            {isDragging ? 'Drop Here' : 'Change Art'}
                        </span>
                    </div>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                </div>
            </div>
            
            <p className="text-center text-xs text-gray-400">
                Drag an image from the web or your computer
            </p>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1.5 block ml-1">Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 ring-rose-500 transition-all font-medium"
                        placeholder="Song Title"
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1.5 block ml-1">Artist</label>
                    <input 
                        type="text" 
                        value={artist} 
                        onChange={(e) => setArtist(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 ring-rose-500 transition-all font-medium"
                         placeholder="Artist Name"
                    />
                </div>
            </div>

            <button 
                onClick={handleSave}
                className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all"
            >
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
