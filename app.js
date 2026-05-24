// ==================== ANIMATED BACKGROUND ====================
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const dots = [];
const dotCount = 60;

class Dot {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.6 + 0.2;
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

    // Draw connections with cyan color
    for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
            const dx = dots[i].x - dots[j].x;
            const dy = dots[i].y - dots[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                const alpha = (1 - distance / 120) * 0.15;
                ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                ctx.lineWidth = 1;
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
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modalMedia');
const modalCaption = document.getElementById('modalCaption');
const closeModal = document.querySelector('.close-modal');

let allMediaItems = [];
let mediaBySection = {
    mega1: [],
    mega2: [],
    leakz: []
};

// Media from ADDFROMHERE repository
const mediaFromADDFROMHERE = [
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (10).png',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (11).jpeg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (12).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (129).png',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (144).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (147).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (163).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (2).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (20).jpeg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (20).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (210).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (212).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (220).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (271).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (29).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (292).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (294).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (32).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (348).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (355).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (419).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (427).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (443).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (451).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (475).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (480).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (5).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (5).png',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (51).png',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (534).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (536).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (537).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (543).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (552).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (570).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (597).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (631).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (632).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (664).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (665).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (69).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (711).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (73).png',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (74).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (8).jpeg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (8).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (82).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (91).jpg',
    'PlugLeaks.net - Join Telegram @PlugLeaksHub (99).jpg'
];

// Split media into sections - 16-17 items per section
function splitMediaIntoSections() {
    const itemsPerSection = Math.ceil(mediaFromADDFROMHERE.length / 3);
    
    // MEGA Folder 1: items 0-15
    for (let i = 0; i < itemsPerSection && i < mediaFromADDFROMHERE.length; i++) {
        const file = mediaFromADDFROMHERE[i];
        const url = `https://raw.githubusercontent.com/dayers402-source/ADDFROMHERE/main/${encodeURIComponent(file)}`;
        mediaBySection.mega1.push({
            name: file,
            url: url,
            type: 'image',
            section: 'mega1'
        });
    }

    // MEGA Folder 2: items 16-31
    for (let i = itemsPerSection; i < itemsPerSection * 2 && i < mediaFromADDFROMHERE.length; i++) {
        const file = mediaFromADDFROMHERE[i];
        const url = `https://raw.githubusercontent.com/dayers402-source/ADDFROMHERE/main/${encodeURIComponent(file)}`;
        mediaBySection.mega2.push({
            name: file,
            url: url,
            type: 'image',
            section: 'mega2'
        });
    }

    // leakz.fun: remaining items
    for (let i = itemsPerSection * 2; i < mediaFromADDFROMHERE.length; i++) {
        const file = mediaFromADDFROMHERE[i];
        const url = `https://raw.githubusercontent.com/dayers402-source/ADDFROMHERE/main/${encodeURIComponent(file)}`;
        mediaBySection.leakz.push({
            name: file,
            url: url,
            type: 'image',
            section: 'leakz'
        });
    }
}

function renderGalleries() {
    const galleries = {
        mega1: document.querySelector('.mega1-gallery'),
        mega2: document.querySelector('.mega2-gallery'),
        leakz: document.querySelector('.leakz-gallery')
    };

    Object.entries(mediaBySection).forEach(([sectionId, items]) => {
        const gallery = galleries[sectionId];
        const section = document.querySelector(`[data-section-id="${sectionId}"]`);
        const itemCount = section.querySelector('.item-count');
        
        itemCount.textContent = `${items.length} items`;
        gallery.innerHTML = '';

        items.forEach((media, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.onclick = () => openModal(sectionId, index);

            item.innerHTML = `
                <img src="${media.url}" alt="${media.name}" loading="lazy" onload="this.style.opacity='1'" style="opacity: 0; transition: opacity 0.3s ease;">
                <div class="media-type">IMAGE</div>
                <div class="gallery-item-overlay">
                    <p class="gallery-item-label">${media.name}</p>
                </div>
            `;

            gallery.appendChild(item);
        });
    });
}

function openModal(sectionId, index) {
    const media = mediaBySection[sectionId][index];
    if (!media) return;
    
    modalMedia.innerHTML = `<img src="${media.url}" alt="${media.name}" style="max-width: 100%; max-height: 100%;">`;
    modalCaption.textContent = media.name;
    modal.classList.remove('hidden');
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

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('hidden')) {
        if (e.key === 'Escape') modal.classList.add('hidden');
    }
});

// Cursor hover on gallery items
document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.gallery-item')) {
        cursorDot.classList.add('hover');
    } else {
        cursorDot.classList.remove('hover');
    }
});

// Initialize
splitMediaIntoSections();
renderGalleries();