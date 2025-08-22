const fileInput = document.getElementById('file-input');
const prevBtn = document.getElementById('prev-btn');
const playBtn = document.getElementById('play-btn');
const nextBtn = document.getElementById('next-btn');
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
    const song = songs[index];
    audio.src = URL.createObjectURL(song);

    window.jsmediatags.read(song, {
        onSuccess: function(tag) {
            songTitle.textContent = tag.tags.title || song.name.replace(/\.[^/.]+$/, "");
            artist.textContent = tag.tags.artist || 'Unknown Artist';

            const { data, format } = tag.tags.picture;
            if (data) {
                let base64String = "";
                for (let i = 0; i < data.length; i++) {
                    base64String += String.fromCharCode(data[i]);
                }
                albumArt.style.backgroundImage = `url(data:${format};base64,${window.btoa(base64String)})`;
                albumArt.style.backgroundSize = 'cover';
            } else {
                albumArt.style.backgroundImage = '';
                albumArt.style.backgroundColor = '#e0e0e0';
            }
        },
        onError: function(error) {
            console.log(error);
            songTitle.textContent = song.name.replace(/\.[^/.]+$/, "");
            artist.textContent = 'Unknown Artist';
            albumArt.style.backgroundImage = '';
            albumArt.style.backgroundColor = '#e0e0e0';
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

prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    playSong();
});

nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    playSong();
});

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

audio.addEventListener('timeupdate', () => {
    const { currentTime, duration } = audio;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
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
        li.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            playSong();
        });
        playlist.appendChild(li);
    });
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