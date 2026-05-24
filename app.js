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
const navItems = document.querySelectorAll('.nav-item');
const mediaSections = document.querySelectorAll('.media-section');
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modalMedia');
const modalCaption = document.getElementById('modalCaption');
const closeModal = document.querySelector('.close-modal');

let allMediaItems = [];
let currentModalIndex = 0;

// Load media from folders
async function loadAllMedia() {
    allMediaItems = [];
    
    const sections = [
        { id: 'mega1', folder: 'media/mega1' },
        { id: 'mega2', folder: 'media/mega2' },
        { id: 'leakz', folder: 'media/leakz' }
    ];

    for (const section of sections) {
        try {
            const response = await fetch(`https://api.github.com/repos/dayers402-source/MySOurce/contents/${section.folder}`);
            if (response.ok) {
                const files = await response.json();
                const mediaFiles = files.filter(f => {
                    const ext = f.name.split('.').pop().toLowerCase();
                    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm'].includes(ext);
                });

                mediaFiles.forEach(file => {
                    const ext = file.name.split('.').pop().toLowerCase();
                    const isVideo = ['mp4', 'webm'].includes(ext);
                    
                    allMediaItems.push({
                        name: file.name,
                        type: isVideo ? 'video' : 'image',
                        url: file.download_url,
                        section: section.id
                    });
                });
            }
        } catch (error) {
            console.log(`No media found in ${section.folder}`);
        }
    }

    renderGalleries();
}

function renderGalleries() {
    const sections = {
        mega1: document.querySelector('.mega1-gallery'),
        mega2: document.querySelector('.mega2-gallery'),
        leakz: document.querySelector('.leakz-gallery')
    };

    // Clear all galleries
    Object.values(sections).forEach(gallery => gallery.innerHTML = '');

    // Group media by section
    const grouped = {
        mega1: allMediaItems.filter(m => m.section === 'mega1'),
        mega2: allMediaItems.filter(m => m.section === 'mega2'),
        leakz: allMediaItems.filter(m => m.section === 'leakz')
    };

    // Render each section
    Object.entries(grouped).forEach(([sectionId, items]) => {
        const gallery = sections[sectionId];
        const section = document.querySelector(`[data-section-id="${sectionId}"]`);
        const itemCount = section.querySelector('.item-count');
        
        itemCount.textContent = `${items.length} items`;

        if (items.length === 0) {
            gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">📂 No media files yet</p>';
            return;
        }

        items.forEach((media, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.onclick = () => openModal(sectionId, index);

            if (media.type === 'image') {
                item.innerHTML = `
                    <img src="${media.url}" alt="${media.name}" loading="lazy">
                    <div class="media-type">IMAGE</div>
                    <div class="gallery-item-overlay">
                        <p class="gallery-item-label">${media.name}</p>
                    </div>
                `;
            } else {
                item.innerHTML = `
                    <video preload="metadata">
                        <source src="${media.url}" type="video/mp4">
                    </video>
                    <div class="media-type">VIDEO</div>
                    <div class="gallery-item-overlay">
                        <p class="gallery-item-label">${media.name}</p>
                    </div>
                `;
            }

            gallery.appendChild(item);
        });
    });
}

function openModal(sectionId, index) {
    const sectionMedia = allMediaItems.filter(m => m.section === sectionId);
    currentModalIndex = index;
    displayModalMedia(sectionId, index);
    modal.classList.remove('hidden');
}

function displayModalMedia(sectionId, index) {
    const sectionMedia = allMediaItems.filter(m => m.section === sectionId);
    if (!sectionMedia[index]) return;
    
    const media = sectionMedia[index];
    modalMedia.innerHTML = '';

    if (media.type === 'image') {
        const img = document.createElement('img');
        img.src = media.url;
        modalMedia.appendChild(img);
    } else {
        const video = document.createElement('video');
        video.controls = true;
        video.style.width = '100%';
        video.style.height = 'auto';
        const source = document.createElement('source');
        source.src = media.url;
        source.type = 'video/mp4';
        video.appendChild(source);
        modalMedia.appendChild(video);
    }

    modalCaption.textContent = media.name;
}

function goToPrevious() {
    // Implementation for previous
}

function goToNext() {
    // Implementation for next
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

// Navigation tabs
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const sectionId = item.dataset.section;
        
        if (sectionId === 'all') {
            mediaSections.forEach(s => s.style.display = 'block');
        } else {
            mediaSections.forEach(s => {
                s.style.display = s.dataset.sectionId === sectionId ? 'block' : 'none';
            });
        }
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
    if (e.target.closest('.gallery-item') || e.target.closest('.nav-item') || e.target.closest('.modal-btn')) {
        cursorDot.classList.add('hover');
    } else {
        cursorDot.classList.remove('hover');
    }
});

// Load media on page load
loadAllMedia();