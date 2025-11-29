import React, { useState } from 'react';
import { Song } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  song?: Song | null;
  mode: 'share_song' | 'invite_friends';
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, song, mode }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all scale-100" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">
            {mode === 'share_song' ? 'Share Song' : 'Invite to Session'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
            <i className="fas fa-times text-gray-500"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {mode === 'share_song' && song && (
            <div className="flex flex-col items-center mb-6">
               <div className="w-32 h-32 rounded-lg shadow-lg overflow-hidden mb-4">
                  <img src={song.artUrl} className="w-full h-full object-cover" alt="Art" />
               </div>
               <h4 className="font-bold text-lg text-center leading-tight mb-1">{song.title}</h4>
               <p className="text-rose-500 font-medium text-sm">{song.artist}</p>
            </div>
          )}

          {mode === 'invite_friends' && (
             <div className="flex flex-col items-center mb-6">
                <div className="w-48 h-48 bg-gray-900 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden group cursor-pointer">
                    {/* Simulated QR Code Pattern */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover bg-center"></div>
                    <i className="fas fa-wifi text-4xl text-white z-10 animate-pulse"></i>
                    <div className="absolute bottom-3 text-white text-[10px] font-mono opacity-80">SCAN TO JOIN</div>
                </div>
                <p className="text-center text-sm text-gray-500 px-4">
                  Ask your friends to scan this code to join your offline Jam Session.
                </p>
             </div>
          )}

          {/* Action Grid */}
          <div className="grid grid-cols-4 gap-4 mb-2">
            <button className="flex flex-col items-center gap-2 group">
               <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <i className="fas fa-message text-green-600"></i>
               </div>
               <span className="text-[10px] font-medium text-gray-600">Message</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
               <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <i className="fab fa-twitter text-blue-500"></i>
               </div>
               <span className="text-[10px] font-medium text-gray-600">X</span>
            </button>
            <button className="flex flex-col items-center gap-2 group" onClick={handleCopy}>
               <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <i className={`fas ${copied ? 'fa-check' : 'fa-link'} ${copied ? 'text-green-500' : 'text-gray-600'}`}></i>
               </div>
               <span className="text-[10px] font-medium text-gray-600">{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
               <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                  <i className="fas fa-rss text-rose-500"></i>
               </div>
               <span className="text-[10px] font-medium text-gray-600">Nearby</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShareModal;
