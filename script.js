const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// Reveal sections as they enter the viewport.
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

// Reading progress indicator.
const progress = document.getElementById('progress');
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${percentage}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Highlight the navigation item for the current section.
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach(section => sectionObserver.observe(section));

document.getElementById('year').textContent = new Date().getFullYear();

// Optional soundtrack player. Add a licensed audio file at assets/portfolio-track.mp3.
const audio = document.getElementById('portfolioAudio');
const playButton = document.getElementById('playButton');
const seekBar = document.getElementById('seekBar');
const volume = document.getElementById('volume');
const currentTimeLabel = document.getElementById('currentTime');
const durationLabel = document.getElementById('duration');
const visualizer = document.getElementById('visualizer');
const musicNote = document.getElementById('musicNote');

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

audio.volume = Number(volume.value);
volume.addEventListener('input', () => { audio.volume = Number(volume.value); });

playButton.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play();
      playButton.textContent = 'Ⅱ';
      playButton.setAttribute('aria-label', 'Pause music');
      visualizer.classList.add('playing');
      musicNote.textContent = 'Now playing your portfolio soundtrack.';
    } catch (error) {
      musicNote.textContent = 'Audio not found yet. Add a licensed MP3 at assets/portfolio-track.mp3.';
    }
  } else {
    audio.pause();
  }
});

audio.addEventListener('pause', () => {
  playButton.textContent = '▶';
  playButton.setAttribute('aria-label', 'Play music');
  visualizer.classList.remove('playing');
});
audio.addEventListener('ended', () => { seekBar.value = 0; });
audio.addEventListener('loadedmetadata', () => { durationLabel.textContent = formatTime(audio.duration); });
audio.addEventListener('timeupdate', () => {
  currentTimeLabel.textContent = formatTime(audio.currentTime);
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    seekBar.value = (audio.currentTime / audio.duration) * 100;
  }
});
seekBar.addEventListener('input', () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(seekBar.value) / 100) * audio.duration;
  }
});

// Ambient starfield: lightweight canvas animation, respects reduced-motion settings.
const starCanvas = document.getElementById('starfield');
const starCtx = starCanvas.getContext('2d');
let stars = [];
let starWidth = 0;
let starHeight = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function seedStars() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  starWidth = window.innerWidth;
  starHeight = window.innerHeight;
  starCanvas.width = starWidth * dpr;
  starCanvas.height = starHeight * dpr;
  starCanvas.style.width = `${starWidth}px`;
  starCanvas.style.height = `${starHeight}px`;
  starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: Math.min(95, Math.floor(starWidth / 13)) }, () => ({
    x: Math.random() * starWidth,
    y: Math.random() * starHeight,
    radius: Math.random() * 1.25 + 0.25,
    speed: Math.random() * 0.22 + 0.04,
    phase: Math.random() * Math.PI * 2
  }));
}
function drawStars(time = 0) {
  starCtx.clearRect(0, 0, starWidth, starHeight);
  stars.forEach(star => {
    const alpha = 0.22 + (Math.sin(time * 0.0007 + star.phase) + 1) * 0.2;
    starCtx.beginPath();
    starCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    starCtx.fillStyle = `rgba(166, 174, 255, ${alpha})`;
    starCtx.fill();
    if (!reduceMotion) {
      star.y -= star.speed;
      if (star.y < -3) { star.y = starHeight + 3; star.x = Math.random() * starWidth; }
    }
  });
  if (!reduceMotion) requestAnimationFrame(drawStars);
}
seedStars();
drawStars();
window.addEventListener('resize', () => { seedStars(); if (reduceMotion) drawStars(); });

// Switch the site's accent palette.
const modeToggle = document.getElementById('modeToggle');
modeToggle.addEventListener('click', () => {
  const active = document.body.classList.toggle('cyber-mode');
  modeToggle.innerHTML = `<span class="mode-indicator"></span> ${active ? 'CYBER MODE ON' : 'CYBER MODE'}`;
});

// Quick navigation overlay, also available with Ctrl/Cmd + K.
const commandTrigger = document.getElementById('commandTrigger');
const commandOverlay = document.getElementById('commandOverlay');
const commandClose = document.getElementById('commandClose');
function openCommand() {
  commandOverlay.classList.add('open');
  commandOverlay.setAttribute('aria-hidden', 'false');
  commandClose.focus();
}
function closeCommand() {
  commandOverlay.classList.remove('open');
  commandOverlay.setAttribute('aria-hidden', 'true');
  commandTrigger.focus();
}
commandTrigger.addEventListener('click', openCommand);
commandClose.addEventListener('click', closeCommand);
commandOverlay.addEventListener('click', event => {
  if (event.target === commandOverlay) closeCommand();
});
commandOverlay.querySelectorAll('a').forEach(link => link.addEventListener('click', closeCommand));
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openCommand();
  }
  if (event.key === 'Escape' && commandOverlay.classList.contains('open')) closeCommand();
});
