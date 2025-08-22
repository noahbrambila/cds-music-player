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

let audio = new Audio();
let songs = [];
let currentSongIndex = 0;

fileInput.addEventListener('change', (e) => {
    songs = Array.from(e.target.files);
    if (songs.length > 0) {
        loadSong(currentSongIndex);
        updatePlaylist();
    }
});

function loadSong(index) {
    const song = songs[index];
    audio.src = URL.createObjectURL(song);
    songTitle.textContent = song.name.replace(/\.[^/.]+$/, "");
    artist.textContent = 'Unknown Artist'; // Placeholder
}

function playSong() {
    audio.play();
    playBtn.textContent = 'Pause';
}

function pauseSong() {
    audio.pause();
    playBtn.textContent = 'Play';
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