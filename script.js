// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Scroll-spy: highlight active nav link based on visible section
const sections = document.querySelectorAll('main .category');
const navAnchors = document.querySelectorAll('.nav-links a');

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('data-section') === id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

sections.forEach(section => spyObserver.observe(section));

// Pop-in animation for polaroid cards as they enter the viewport
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.polaroid').forEach(card => cardObserver.observe(card));

// Photo carousels: build dots, wire prev/next arrows, resize the frame
// to fit each photo's own aspect ratio (so mixed portrait/landscape
// photos in the same card don't get warped into one fixed box).
const MIN_STACK_HEIGHT = 160;
const MAX_STACK_HEIGHT = 420;

function applyStackHeight(stack, img) {
  if (!img.naturalWidth || !img.naturalHeight) return;
  const width = stack.clientWidth;
  const ratioHeight = width * (img.naturalHeight / img.naturalWidth);
  const height = Math.min(MAX_STACK_HEIGHT, Math.max(MIN_STACK_HEIGHT, ratioHeight));
  stack.style.height = `${height}px`;
}

document.querySelectorAll('.photo-stack').forEach(stack => {
  const track = stack.querySelector('.photo-track');
  const images = Array.from(track.querySelectorAll('img'));
  const prevBtn = stack.querySelector('.photo-arrow-prev');
  const nextBtn = stack.querySelector('.photo-arrow-next');
  const dotsContainer = stack.querySelector('.photo-dots');

  function setHeightForIndex(i) {
    const img = images[i];
    if (img.complete) {
      applyStackHeight(stack, img);
    } else {
      img.addEventListener('load', () => applyStackHeight(stack, img), { once: true });
    }
  }

  // Single-photo cards still need to size themselves to that photo.
  setHeightForIndex(0);

  if (images.length <= 1) return;

  let index = 0;

  const dots = images.map((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(i);
    });
    dotsContainer.appendChild(dot);
    return dot;
  });

  function goTo(i) {
    index = (i + images.length) % images.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
    setHeightForIndex(index);
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    goTo(index - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    goTo(index + 1);
  });

  goTo(0);
});

// Lightbox: click a photo to view it enlarged in the center of the screen
const lightbox = document.createElement('div');
lightbox.className = 'lightbox-overlay';
lightbox.innerHTML = `
  <button class="lightbox-close" aria-label="Close">&times;</button>
  <img src="" alt="">
`;
document.body.appendChild(lightbox);
const lightboxImg = lightbox.querySelector('img');

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.add('open');
}

function closeLightbox() {
  lightbox.classList.remove('open');
}

document.querySelectorAll('.photo-track img').forEach(img => {
  img.addEventListener('click', () => openLightbox(img.src, img.alt));
});

// Click anywhere on the dark backdrop (not the image itself) to close
lightbox.addEventListener('click', (e) => {
  if (e.target !== lightboxImg) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
