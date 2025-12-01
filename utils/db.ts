
import { Song } from '../types';

const DB_NAME = 'MusicAppDB';
const STORE_NAME = 'songs';
const DB_VERSION = 1;

interface StoredSong extends Omit<Song, 'fileUrl'> {
  fileBlob: Blob;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveSongToDB = async (song: Song, file: File): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Explicitly select properties to store to avoid circular references or unwanted prototype chain data
    const storedSong = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        artUrl: song.artUrl,
        genre: song.genre,
        isLocal: song.isLocal,
        fileBlob: file // Store the file/blob directly
    };

    const request = store.put(storedSong);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getSongsFromDB = async (): Promise<Song[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result;
      if (!results) {
          resolve([]);
          return;
      }
      // Convert stored Blobs back to ObjectURLs for playback
      const songs = results.map((item: any) => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        artUrl: item.artUrl,
        genre: item.genre,
        isLocal: true,
        fileUrl: URL.createObjectURL(item.fileBlob)
      }));
      resolve(songs);
    };
    request.onerror = () => reject(request.error);
  });
};
