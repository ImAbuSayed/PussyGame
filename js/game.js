const kitty = document.querySelector("#kitty");
const pepper = document.querySelector("#pepper");
const startBtn = document.getElementById("start");
const leaderboardBtn = document.getElementById("leaderboard");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const countdownElement = document.getElementById("countdown");
const nameModal = new bootstrap.Modal(document.getElementById('nameModal'));
const leaderboardModal = new bootstrap.Modal(document.getElementById('leaderboardModal'));
const startPlayingBtn = document.getElementById("startPlaying");
const playerNameInput = document.getElementById("playerName");
const leaderboardList = document.getElementById("leaderboardList");

let counter = 0;
let highScore = 0;
let isGameRunning = false;
let leaderboard = [];

const LEADERBOARD_KEY = 'pussyGameLeaderboard';

function jump() {
    if (kitty.classList.contains("animate")) return;
    kitty.classList.add("animate");
    setTimeout(() => kitty.classList.remove("animate"), 300);
}

function startGame() {
    nameModal.show();
}

function initializeGame(playerName) {
    if (isGameRunning) return;
    isGameRunning = true;
    counter = 0;
    scoreElement.textContent = "0";
    startBtn.style.display = "none";
    
    pepper.style.animation = "none";
    pepper.style.right = "-30px";
    
    countdownElement.style.display = "block";
    let countdown = 3;
    
    const countdownInterval = setInterval(() => {
        if (countdown > 0) {
            countdownElement.textContent = countdown;
            countdown--;
        } else if (countdown === 0) {
            countdownElement.textContent = "GO!";
            countdown--;
        } else {
            clearInterval(countdownInterval);
            countdownElement.style.display = "none";
            pepper.style.animation = "pepper 2s infinite linear";
            startGameLoop(playerName);
        }
    }, 1000);
}

function startGameLoop(playerName) {
    const gameLoop = setInterval(() => {
        const kittyRect = kitty.getBoundingClientRect();
        const pepperRect = pepper.getBoundingClientRect();

        if (
            pepperRect.left <= kittyRect.right &&
            pepperRect.right >= kittyRect.left &&
            pepperRect.top <= kittyRect.bottom &&
            pepperRect.bottom >= kittyRect.top
        ) {
            endGame(playerName);
            clearInterval(gameLoop);
        } else {
            counter++;
            let score = Math.floor(counter / 10);
            scoreElement.textContent = score;
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
            }
        }
    }, 10);
}

function endGame(playerName) {
    isGameRunning = false;
    pepper.style.animation = "none";
    startBtn.style.display = "inline-block";
    startBtn.textContent = "Play Again";
    updateLeaderboard(playerName, Math.floor(counter / 10));
}

function updateLeaderboard(playerName, score) {
    leaderboard.push({ name: playerName, score: score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5);
    saveLeaderboard();
    displayLeaderboard();
}

function saveLeaderboard() {
    try {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
        console.log('Leaderboard saved successfully');
    } catch (error) {
        console.error('Error saving leaderboard:', error);
    }
}

function loadLeaderboard() {
    try {
        const savedLeaderboard = localStorage.getItem(LEADERBOARD_KEY);
        if (savedLeaderboard) {
            leaderboard = JSON.parse(savedLeaderboard);
            if (leaderboard.length > 0) {
                highScore = leaderboard[0].score;
                highScoreElement.textContent = highScore;
            }
        } else {
            leaderboard = [];
        }
        displayLeaderboard();
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboard = [];
    }
}

function displayLeaderboard() {
    leaderboardList.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

// Event Listeners
document.addEventListener("keydown", (e) => {
    if ((e.code === "Space" || e.code === "ArrowUp") && isGameRunning) jump();
});

document.addEventListener("click", (e) => {
    if (isGameRunning && e.target !== startBtn && e.target !== leaderboardBtn) jump();
});

startBtn.addEventListener("click", startGame);

leaderboardBtn.addEventListener("click", () => {
    displayLeaderboard();
    leaderboardModal.show();
});

startPlayingBtn.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        nameModal.hide();
        initializeGame(playerName);
    }
});

// Touch events for mobile
document.addEventListener("touchstart", (e) => {
    if (isGameRunning && e.target !== startBtn && e.target !== leaderboardBtn) {
        e.preventDefault();
        jump();
    }
});

// Load leaderboard on page load
loadLeaderboard();

// Ensure pepper is not moving on page load
pepper.style.animation = "none";
pepper.style.right = "-30px";