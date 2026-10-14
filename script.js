
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volume = document.getElementById("volume");
const autoplay = document.getElementById("autoplay");

const playlist = document.getElementById("playlist");
const albumCover = document.getElementById("albumCover");
const status = document.getElementById("status");

// Demo audio tracks require an internet connection.
const songs = [
    {
        title: "Dreams",
        artist: "Demo Artist",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title: "Melody",
        artist: "Demo Artist",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "Night Vibes",
        artist: "Demo Artist",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        title: "Relaxing Beats",
        artist: "Demo Artist",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    }
];

let currentSong = 0;

// Format seconds into minutes:seconds
function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Build playlist buttons
function createPlaylist() {
    playlist.innerHTML = "";

    songs.forEach((song, index) => {
        const button = document.createElement("button");
        button.className = "playlist-item";
        button.type = "button";

        const number = document.createElement("span");
        number.className = "track-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const details = document.createElement("span");
        details.className = "track-details";

        const title = document.createElement("strong");
        title.textContent = song.title;

        const artist = document.createElement("span");
        artist.textContent = song.artist;

        details.append(title, artist);
        button.append(number, details);

        button.addEventListener("click", () => {
            loadSong(index);
            playSong();
        });

        playlist.appendChild(button);
    });
}

// Highlight the selected song
function updatePlaylist() {
    document.querySelectorAll(".playlist-item").forEach(
        (item, index) => {
            const active = index === currentSong;

            item.classList.toggle("active", active);

            if (active) {
                item.setAttribute("aria-current", "true");
            } else {
                item.removeAttribute("aria-current");
            }
        }
    );
}

// Load selected song
function loadSong(index) {
    currentSong = (index + songs.length) % songs.length;

    const song = songs[currentSong];

    audio.pause();
    audio.src = song.src;
    audio.load();

    songTitle.textContent = song.title;
    artistName.textContent = song.artist;

    progress.value = 0;
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";

    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play music");

    albumCover.classList.remove("playing");
    status.textContent = "";

    updatePlaylist();
}

// Play music
async function playSong() {
    try {
        await audio.play();

        playBtn.textContent = "⏸";
        playBtn.setAttribute("aria-label", "Pause music");

        albumCover.classList.add("playing");
        status.textContent = "";
    } catch (error) {
        playBtn.textContent = "▶";
        albumCover.classList.remove("playing");

        status.textContent =
            "Unable to play audio. Check your internet connection.";
    }
}

// Pause music
function pauseSong() {
    audio.pause();

    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play music");

    albumCover.classList.remove("playing");
}

// Play/Pause button
playBtn.addEventListener("click", () => {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
});

// Next song
function nextSong() {
    loadSong(currentSong + 1);
    playSong();
}

nextBtn.addEventListener("click", nextSong);

// Previous song
function previousSong() {
    // If the current song has played for more than 3 seconds,
    // restart it. Otherwise, go to the previous song.
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    loadSong(currentSong - 1);
    playSong();
}

prevBtn.addEventListener("click", previousSong);

// Update progress and current time
audio.addEventListener("timeupdate", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        progress.value =
            (audio.currentTime / audio.duration) * 100;
    }

    currentTimeEl.textContent = formatTime(audio.currentTime);
});

// Display duration when metadata loads
audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
});

// Seek to a selected position
progress.addEventListener("input", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime =
            (Number(progress.value) / 100) * audio.duration;
    }
});

// Volume control
audio.volume = Number(volume.value);

volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
});

// Automatically play the next track if enabled
audio.addEventListener("ended", () => {
    if (autoplay.checked) {
        nextSong();
    } else {
        playBtn.textContent = "▶";
        playBtn.setAttribute("aria-label", "Play music");
        albumCover.classList.remove("playing");
        progress.value = 100;
    }
});

// Handle audio errors
audio.addEventListener("error", () => {
    status.textContent =
        "Audio could not load. Try another track or check your internet.";
});

// Initialize player
createPlaylist();
loadSong(0);
