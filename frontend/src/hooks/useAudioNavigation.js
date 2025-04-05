import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

export const useAudioNavigation = () => {
    const navigate = useNavigate();
    const { songs, currentTrack, play, shuffle, queue } = useAudio();

    const getNextSong = () => {
        if (!currentTrack) return null;
        
        // First check queue
        if (queue.length > 0) {
            return queue[0];
        }

        const currentIndex = songs.findIndex(song => song._id === currentTrack._id);
        
        // Handle shuffle mode
        if (shuffle) {
            const remainingSongs = songs.filter(song => song._id !== currentTrack._id);
            return remainingSongs[Math.floor(Math.random() * remainingSongs.length)];
        }

        // Normal play mode
        const nextIndex = (currentIndex + 1) % songs.length;
        return songs[nextIndex];
    };

    const getPreviousSong = () => {
        if (!currentTrack) return null;
        
        const currentIndex = songs.findIndex(song => song._id === currentTrack._id);
        
        // Handle shuffle mode
        if (shuffle) {
            const remainingSongs = songs.filter(song => song._id !== currentTrack._id);
            return remainingSongs[Math.floor(Math.random() * remainingSongs.length)];
        }

        // Normal play mode
        const previousIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
        return songs[previousIndex];
    };

    const playNext = (shouldNavigate = false) => {
        const nextSong = getNextSong();
        if (nextSong) {
            play(nextSong);
            if (shouldNavigate) {
                navigate(`/songs/${nextSong._id}`);
            }
        }
    };

    const playPrevious = (shouldNavigate = false) => {
        const previousSong = getPreviousSong();
        if (previousSong) {
            play(previousSong);
            if (shouldNavigate) {
                navigate(`/songs/${previousSong._id}`);
            }
        }
    };

    return { playNext, playPrevious };
};
