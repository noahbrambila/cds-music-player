const fileInput = document.getElementById('file-input');
const prevBtn = document.getElementById('prev-btn');
const playBtn = document.getElementById('play-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const volumeSlider = document.getElementById('volume-slider');
const progressBar = document.querySelector('.progress-bar');
const progressContainer = document.querySelector('.progress-container');
const songTitle = document.querySelector('.song-title');
const artist = document.querySelector('.artist');
const playlist = document.querySelector('.playlist');
const albumArt = document.querySelector('.album-art');

let audio = new Audio();
let songs = [];
let currentSongIndex = 0;
let isShuffling = false;
let shuffledSongs = [];

fileInput.addEventListener('change', (e) => {
    songs = Array.from(e.target.files);
    if (songs.length > 0) {
        currentSongIndex = 0;
        loadSong(currentSongIndex);
        updatePlaylist();
        savePlaylist();
    }
});

window.addEventListener('load', () => {
    loadPlaylist();
    if (songs.length > 0) {
        loadSong(currentSongIndex);
        updatePlaylist();
    }
});

function loadSong(index) {
    // Ensure we have songs and valid index
    if (!songs || songs.length === 0 || index < 0 || index >= songs.length) {
        console.error('Invalid song index or empty songs array');
        return;
    }
    
    const song = songs[index];
    audio.src = URL.createObjectURL(song);

    window.jsmediatags.read(song, {
        onSuccess: function(tag) {
            songTitle.textContent = tag.tags.title || song.name.replace(/\.[^/.]+$/, "");
            artist.textContent = tag.tags.artist || 'Unknown Artist';

            // Handle album art with glassmorphism styling
            if (tag.tags.picture && tag.tags.picture.data && tag.tags.picture.data.length > 0) {
                const { data, format } = tag.tags.picture;
                let base64String = "";
                for (let i = 0; i < data.length; i++) {
                    base64String += String.fromCharCode(data[i]);
                }
                const imageUrl = `url(data:${format};base64,${window.btoa(base64String)})`;
                albumArt.style.backgroundImage = imageUrl;
                albumArt.style.backgroundSize = 'cover';
                albumArt.style.backgroundPosition = 'center';
                albumArt.style.backgroundRepeat = 'no-repeat';
                // Reset to glassmorphism background when image is present
                albumArt.style.backgroundColor = 'transparent';
            } else {
                // No album art available - use glassmorphism background
                albumArt.style.backgroundImage = '';
                albumArt.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }
        },
        onError: function(error) {
            console.log('Error reading metadata:', error);
            songTitle.textContent = song.name.replace(/\.[^/.]+$/, "");
            artist.textContent = 'Unknown Artist';
            albumArt.style.backgroundImage = '';
            albumArt.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        }
    });
}

function playSong() {
    audio.play();
    playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
}

function pauseSong() {
    audio.pause();
    playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
}

playBtn.addEventListener('click', () => {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
});

shuffleBtn.addEventListener('click', () => {
    if (songs.length === 0) return;
    
    isShuffling = !isShuffling;
    if (isShuffling) {
        shuffleBtn.classList.add('active');
        shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
        // Ensure the current song is in the shuffled list and set its index
        const currentSong = songs[currentSongIndex];
        const shuffledIndex = shuffledSongs.findIndex(song => song === currentSong);
        if (shuffledIndex !== -1) {
            currentSongIndex = shuffledIndex;
        } else {
            // If current song not found (e.g., new playlist), start from beginning of shuffled list
            currentSongIndex = 0;
        }
    } else {
        shuffleBtn.classList.remove('active');
        // Revert to original order and find the index of the current song
        if (shuffledSongs.length > 0 && currentSongIndex < shuffledSongs.length) {
            const currentSong = shuffledSongs[currentSongIndex];
            currentSongIndex = songs.findIndex(song => song === currentSong);
            if (currentSongIndex === -1) {
                currentSongIndex = 0; // Fallback if not found
            }
        }
    }
    
    // Load the song using the correct index
    const actualSongIndex = isShuffling ?
        songs.findIndex(song => song === shuffledSongs[currentSongIndex]) :
        currentSongIndex;
    
    if (actualSongIndex !== -1) {
        loadSong(actualSongIndex);
        // Update highlighting immediately for shuffle button
        updatePlaylistHighlight();
        if (!audio.paused) {
            playSong();
        }
    }
});

prevBtn.addEventListener('click', () => {
    if (songs.length === 0) return;
    
    const activeSongs = isShuffling ? shuffledSongs : songs;
    if (activeSongs.length === 0) return;
    
    currentSongIndex = (currentSongIndex - 1 + activeSongs.length) % activeSongs.length;
    
    // Get the actual song from the correct array
    const actualSongIndex = isShuffling ?
        songs.findIndex(song => song === shuffledSongs[currentSongIndex]) :
        currentSongIndex;
    
    if (actualSongIndex !== -1) {
        loadSong(actualSongIndex);
        // Update highlighting immediately for visual feedback
        updatePlaylistHighlight();
        playSong();
    }
});

nextBtn.addEventListener('click', () => {
    if (songs.length === 0) return;
    
    const activeSongs = isShuffling ? shuffledSongs : songs;
    if (activeSongs.length === 0) return;
    
    currentSongIndex = (currentSongIndex + 1) % activeSongs.length;
    
    // Get the actual song from the correct array
    const actualSongIndex = isShuffling ?
        songs.findIndex(song => song === shuffledSongs[currentSongIndex]) :
        currentSongIndex;
    
    if (actualSongIndex !== -1) {
        loadSong(actualSongIndex);
        // Update highlighting immediately for visual feedback
        updatePlaylistHighlight();
        playSong();
    }
});

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
    console.log('Volume changed to:', e.target.value);
});

audio.addEventListener('timeupdate', () => {
    const { currentTime, duration } = audio;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
});

audio.addEventListener('ended', () => {
    if (songs.length === 0) return;
    
    if (isShuffling) {
        const activeSongs = shuffledSongs;
        if (activeSongs.length === 0) return;
        
        currentSongIndex = (currentSongIndex + 1) % activeSongs.length;
        const actualSongIndex = songs.findIndex(song => song === shuffledSongs[currentSongIndex]);
        
        if (actualSongIndex !== -1) {
            loadSong(actualSongIndex);
            // Update highlighting immediately for auto-play
            updatePlaylistHighlight();
            playSong();
        }
    } else {
        // If not shuffling, play the next song in the original order
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        // Update highlighting immediately for auto-play
        updatePlaylistHighlight();
        playSong();
    }
});

progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
});

function updatePlaylist() {
    playlist.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.name.replace(/\.[^/.]+$/, "");
        li.setAttribute('data-index', index);
        li.addEventListener('click', () => {
            // Update currentSongIndex based on mode BEFORE loading song
            if (isShuffling) {
                // If shuffling is active, find the clicked song in the shuffled list
                const clickedSong = songs[index];
                const shuffledIndex = shuffledSongs.findIndex(s => s === clickedSong);
                if (shuffledIndex !== -1) {
                    currentSongIndex = shuffledIndex;
                } else {
                    currentSongIndex = 0; // Fallback
                }
            } else {
                currentSongIndex = index;
            }
            
            // Load the song and immediately update highlighting
            loadSong(index); // Always load using the original songs array index
            
            // Update highlighting immediately, not waiting for metadata
            updatePlaylistHighlight();
            
            playSong();
        });
        playlist.appendChild(li);
    });
    updatePlaylistHighlight();
}

// New function to highlight currently playing song
function updatePlaylistHighlight() {
    const playlistItems = playlist.querySelectorAll('li');
    playlistItems.forEach((item, index) => {
        item.classList.remove('playing');
    });
    
    // Find the currently playing song in the original songs array
    let currentActualIndex;
    
    if (isShuffling && shuffledSongs.length > 0 && currentSongIndex < shuffledSongs.length) {
        // Find the current shuffled song in the original songs array
        const currentShuffledSong = shuffledSongs[currentSongIndex];
        currentActualIndex = songs.findIndex(song => song === currentShuffledSong);
    } else {
        // Normal mode or fallback
        currentActualIndex = currentSongIndex;
    }
    
    // Ensure the index is valid
    if (currentActualIndex >= 0 && currentActualIndex < playlistItems.length) {
        playlistItems[currentActualIndex].classList.add('playing');
    }
}

function savePlaylist() {
    // We can't directly save the File objects, so we'll save their names and recreate them on load.
    // This is a simplified approach. For a more robust solution, we'd need to handle file storage differently.
    const songNames = songs.map(song => song.name);
    localStorage.setItem('playlist', JSON.stringify(songNames));
}

function loadPlaylist() {
    const savedPlaylist = localStorage.getItem('playlist');
    if (savedPlaylist) {
        const songNames = JSON.parse(savedPlaylist);
        // This is a placeholder. We can't recreate the File objects from names alone.
        // The user will need to re-upload the files.
        // A more advanced implementation would use the File System Access API.
        console.log("Saved playlist (names):", songNames);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent default spacebar action (e.g., scrolling)
        if (audio.paused) {
            playSong();
        } else {
            pauseSong();
        }
    }
});

// Performance-optimized gradient system with glassmorphism
let isUpdating = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Throttled mouse movement handler
function handleMouseMove(e) {
    if (!isUpdating) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        requestAnimationFrame(updateGradient);
        isUpdating = true;
    }
}

// Dynamic color generation based on position
function generateDynamicColors(x, y) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Calculate position ratios (0-1)
    const xRatio = x / window.innerWidth;
    const yRatio = y / window.innerHeight;
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) / Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
    
    // Dynamic color palette based on position
    const hue1 = Math.floor(250 + (xRatio * 60)); // Purple to blue range
    const hue2 = Math.floor(280 + (yRatio * 40)); // Deep purple range
    const saturation1 = Math.floor(70 + (distanceFromCenter * 30));
    const saturation2 = Math.floor(80 + ((1 - distanceFromCenter) * 20));
    const lightness1 = Math.floor(25 + (yRatio * 15));
    const lightness2 = Math.floor(10 + (xRatio * 20));
    
    return {
        color1: `hsl(${hue1}, ${saturation1}%, ${lightness1}%)`,
        color2: `hsl(${hue2}, ${saturation2}%, ${lightness2}%)`,
        color3: `hsl(${hue1 + 20}, ${saturation1 - 10}%, ${lightness1 - 5}%)`
    };
}

// Optimized gradient update function
function updateGradient() {
    const { color1, color2, color3 } = generateDynamicColors(mouseX, mouseY);
    
    // Use CSS custom properties for smooth transitions
    document.documentElement.style.setProperty('--gradient-x', `${mouseX}px`);
    document.documentElement.style.setProperty('--gradient-y', `${mouseY}px`);
    document.documentElement.style.setProperty('--gradient-color1', color1);
    document.documentElement.style.setProperty('--gradient-color2', color2);
    document.documentElement.style.setProperty('--gradient-color3', color3);
    
    isUpdating = false;
}

// Initialize gradient on load
function initializeGradient() {
    updateGradient();
    document.body.addEventListener('mousemove', handleMouseMove, { passive: true });
}

// Handle window resize for responsive gradient
function handleResize() {
    mouseX = Math.min(mouseX, window.innerWidth);
    mouseY = Math.min(mouseY, window.innerHeight);
    updateGradient();
}

// Initialize gradient system
window.addEventListener('load', initializeGradient);
window.addEventListener('resize', handleResize, { passive: true });

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    document.body.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', handleResize);
});