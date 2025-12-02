// Get elements
const gallery = document.querySelector('.gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const caption = document.getElementById('caption');
const counter = document.getElementById('counter');
const closeBtn = document.querySelector('.close');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

// Add image controls
const addImageBtn = document.getElementById('addImageBtn');
const addImageForm = document.getElementById('addImageForm');
const imageUrlInput = document.getElementById('imageUrl');
const imageTitleInput = document.getElementById('imageTitle');
const submitImageBtn = document.getElementById('submitImage');
const cancelAddBtn = document.getElementById('cancelAdd');

let currentIndex = 0;
let images = [];

// Initialize gallery
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    images = []; // Reset images array
    
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const overlay = item.querySelector('.overlay span');
        
        images.push({
            src: img.src,
            alt: img.alt,
            caption: overlay.textContent
        });

        // Add click event to image (not delete button)
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(index);
        });

        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(index);
        });
    });

    // Add delete functionality to all delete buttons
    attachDeleteHandlers();
}

// Attach delete handlers to delete buttons
function attachDeleteHandlers() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteImage(btn.closest('.gallery-item'));
        });
    });
}

// Open lightbox
function openLightbox(index) {
    currentIndex = index;
    updateLightboxContent();
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close lightbox
function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto'; // Enable scrolling
}

// Update lightbox content
function updateLightboxContent() {
    const currentImage = images[currentIndex];
    lightboxImg.src = currentImage.src;
    lightboxImg.alt = currentImage.alt;
    caption.textContent = currentImage.caption;
    counter.textContent = `${currentIndex + 1} / ${images.length}`;
}

// Show next image
function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightboxContent();
}

// Show previous image
function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightboxContent();
}

// Event Listeners
closeBtn.addEventListener('click', closeLightbox);
nextBtn.addEventListener('click', showNext);
prevBtn.addEventListener('click', showPrev);

// Close lightbox when clicking outside the image
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'block') {
        switch(e.key) {
            case 'ArrowRight':
                showNext();
                break;
            case 'ArrowLeft':
                showPrev();
                break;
            case 'Escape':
                closeLightbox();
                break;
        }
    }
});

// Touch support for mobile swipe
let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            showNext(); // Swipe left - next image
        } else {
            showPrev(); // Swipe right - previous image
        }
    }
}

// Add new image to gallery
function addImage(imageUrl, imageTitle) {
    if (!imageUrl || !imageTitle) {
        alert('Please fill in both fields');
        return;
    }

    // Create new gallery item
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.style.animation = 'fadeIn 0.5s ease';
    
    galleryItem.innerHTML = `
        <button class="delete-btn" title="Delete image">&times;</button>
        <img src="${imageUrl}" alt="${imageTitle}" loading="lazy">
        <div class="overlay">
            <span>${imageTitle}</span>
        </div>
    `;

    // Add to gallery
    gallery.appendChild(galleryItem);

    // Re-initialize gallery to include new item
    initGallery();

    // Clear form and hide it
    imageUrlInput.value = '';
    imageTitleInput.value = '';
    addImageForm.classList.add('hidden');
}

// Delete image from gallery
function deleteImage(galleryItem) {
    if (confirm('Are you sure you want to delete this image?')) {
        galleryItem.style.animation = 'fadeOut 0.3s ease';
        
        setTimeout(() => {
            galleryItem.remove();
            initGallery(); // Re-initialize gallery after deletion
            
            // If lightbox is open and we deleted the current image, close it
            if (lightbox.style.display === 'block') {
                if (images.length === 0) {
                    closeLightbox();
                } else if (currentIndex >= images.length) {
                    currentIndex = images.length - 1;
                    updateLightboxContent();
                }
            }
        }, 300);
    }
}

// Show/Hide add image form
addImageBtn.addEventListener('click', () => {
    addImageForm.classList.toggle('hidden');
    if (!addImageForm.classList.contains('hidden')) {
        imageUrlInput.focus();
    }
});

// Submit new image
submitImageBtn.addEventListener('click', () => {
    addImage(imageUrlInput.value.trim(), imageTitleInput.value.trim());
});

// Cancel adding image
cancelAddBtn.addEventListener('click', () => {
    addImageForm.classList.add('hidden');
    imageUrlInput.value = '';
    imageTitleInput.value = '';
});

// Handle Enter key in form inputs
imageUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        imageTitleInput.focus();
    }
});

imageTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addImage(imageUrlInput.value.trim(), imageTitleInput.value.trim());
    }
});

// Initialize the gallery when DOM is loaded
initGallery();
