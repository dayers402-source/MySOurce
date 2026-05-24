// ==================== ANIMATED BACKGROUND ====================
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const dots = [];
const dotCount = 50;

class Dot {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize dots
for (let i = 0; i < dotCount; i++) {
    dots.push(new Dot());
}

function animateBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(dot => {
        dot.update();
        dot.draw();
    });

    // Draw connections between nearby dots
    for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
            const dx = dots[i].x - dots[j].x;
            const dy = dots[i].y - dots[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 150)})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(dots[i].x, dots[i].y);
                ctx.lineTo(dots[j].x, dots[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animateBackground);
}

animateBackground();

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ==================== CURSOR TRACKING ====================
const cursorDot = document.getElementById('cursor');
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
});

// ==================== MEDIA GALLERY ====================
const gallery = document.getElementById('gallery');
const loadingSpinner = document.getElementById('loadingSpinner');
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modalMedia');
const modalCaption = document.getElementById('modalCaption');
const closeModal = document.querySelector('.close-modal');
const currentSourceSpan = document.getElementById('currentSource');
const navItems = document.querySelectorAll('.nav-item');

let currentMediaArray = [];
let currentMediaIndex = 0;

// MEGA Folder configurations
const mediaConfigs = {
    mega1: {
        label: 'MEGA Folder 1',
        url: 'https://mega.nz/folder/qRkyjTpb#rl8oiMaH5TRilXg2IDP20A/folder/XN1m2DDQ',
        type: 'mega'
    },
    mega2: {
        label: 'MEGA Folder 2',
        url: 'https://mega.nz/folder/7vonTSbK#TlyyDVsXGC1xO327t6pAtw/folder/765miLDD',
        type: 'mega'
    },
    leakz: {
        label: 'leakz.fun',
        url: 'https://leakz.fun',
        type: 'website'
    }
};

// Load media from source (simulated - will need backend integration)
async function loadMedia(source) {
    loadingSpinner.classList.remove('hidden');
    gallery.innerHTML = '';

    const config = mediaConfigs[source];
    currentSourceSpan.textContent = config.label;

    try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Create sample media items
        currentMediaArray = [
            { type: 'image', src: 'https://via.placeholder.com/400x400?text=Image+1', label: 'Sample Image 1' },
            { type: 'image', src: 'https://via.placeholder.com/400x400?text=Image+2', label: 'Sample Image 2' },
            { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', label: 'Sample Video 1' },
            { type: 'image', src: 'https://via.placeholder.com/400x400?text=Image+3', label: 'Sample Image 3' },
        ];

        // Populate gallery
        currentMediaArray.forEach((media, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.onclick = () => openModal(index);

            if (media.type === 'image') {
                item.innerHTML = `
                    <img src="${media.src}" alt="${media.label}" loading="lazy">
                    <div class="media-type">IMAGE</div>
                    <div class="gallery-item-label">${media.label}</div>
                `;
            } else {
                item.innerHTML = `
                    <video preload="metadata">
                        <source src="${media.src}" type="video/mp4">
                    </video>
                    <div class="media-type">VIDEO</div>
                    <div class="gallery-item-label">${media.label}</div>
                `;
            }

            gallery.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading media:', error);
        gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Error loading media. Please try again.</p>';
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Open modal
function openModal(index) {
    currentMediaIndex = index;
    const media = currentMediaArray[index];

    modalMedia.innerHTML = '';

    if (media.type === 'image') {
        const img = document.createElement('img');
        img.src = media.src;
        modalMedia.appendChild(img);
    } else {
        const video = document.createElement('video');
        video.controls = true;
        video.style.width = '100%';
        video.style.height = 'auto';
        const source = document.createElement('source');
        source.src = media.src;
        source.type = 'video/mp4';
        video.appendChild(source);
        modalMedia.appendChild(video);
    }

    modalCaption.textContent = media.label || 'Media';
    modal.classList.remove('hidden');
}

// Navigation
function goToPrevious() {
    currentMediaIndex = (currentMediaIndex - 1 + currentMediaArray.length) % currentMediaArray.length;
    openModal(currentMediaIndex);
}

function goToNext() {
    currentMediaIndex = (currentMediaIndex + 1) % currentMediaArray.length;
    openModal(currentMediaIndex);
}

// Close modal
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

document.getElementById('prevBtn').addEventListener('click', goToPrevious);
document.getElementById('nextBtn').addEventListener('click', goToNext);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Escape') modal.classList.add('hidden');
    }
});

// Navigation menu
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        loadMedia(item.dataset.source);
    });

    // Cursor hover effect
    item.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hover');
    });
    item.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hover');
    });
});

// Cursor hover on gallery items
document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.gallery-item')) {
        cursorDot.classList.add('hover');
    } else {
        cursorDot.classList.remove('hover');
    }
});

// Load initial media
loadMedia('mega1');