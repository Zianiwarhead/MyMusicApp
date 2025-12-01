import React, { useState, useEffect } from 'react';

interface RadioViewProps {
  onPlayRadio: (url: string, name: string, icon: string) => void;
}

const GENRES = ['lofi', 'pop', 'rock', 'jazz', 'classical', 'hip hop', 'news', 'sports'];

const RadioView: React.FC<RadioViewProps> = ({ onPlayRadio }) => {
  const [genre, setGenre] = useState('lofi');
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://de1.api.radio-browser.info/json/stations/bytag/${genre}?limit=24&order=votes&reverse=true`);
        const data = await res.json();
        setStations(data);
      } catch (error) {
        console.error("Failed to fetch radio", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [genre]);

  return (
    <div className="w-full animate-fade-in">
      {/* Genre Pills */}
      <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-5 py-2 rounded-full capitalize whitespace-nowrap text-sm font-bold transition-all ${
              genre === g 
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
              : 'bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/20'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Stations Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
            <i className="fas fa-circle-notch fa-spin text-3xl text-rose-500"></i>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stations.map((station) => (
            <div 
              key={station.stationuuid}
              onClick={() => onPlayRadio(station.url_resolved || station.url, station.name, station.favicon || 'https://cdn-icons-png.flaticon.com/512/3083/3083417.png')}
              className="bg-white dark:bg-white/5 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors cursor-pointer group border border-transparent hover:border-rose-500/20 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                 <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/10 overflow-hidden relative">
                    <img 
                        src={station.favicon || 'https://cdn-icons-png.flaticon.com/512/3083/3083417.png'} 
                        onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3083/3083417.png')}
                        className="w-full h-full object-cover" 
                        alt="icon" 
                    />
                 </div>
                 <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-0 group-hover:scale-100 shadow-lg">
                    <i className="fas fa-play text-xs pl-0.5"></i>
                 </div>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{station.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 capitalize">
                  {(station.tags || '').split(',').slice(0, 2).join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RadioView;