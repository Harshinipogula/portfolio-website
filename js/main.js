/**
 * ==========================================================================
 * PORTFOLIO FRONTEND INTERACTION & REST API INTEGRATION SCRIPT
 * ==========================================================================
 */

// Global API Endpoint Base URL (Auto-adapts to local dev or deployed server)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';

// Fallback Demo Projects Data (Ensures portfolio is immediately interactive even if database is offline)
const DEMO_PROJECTS = [
  {
    _id: 'demo-1',
    title: 'E-Commerce Cloud Platform',
    description: 'Full stack online shopping platform with real-time inventory tracking, Stripe API payments, and admin metrics dashboard.',
    fullDescription: 'Built an enterprise-grade full stack e-commerce web application featuring user authentication, product catalog filtering, dynamic cart management, Stripe API checkout integration, and an admin management suite.',
    image: 'https://images.unsplash.com/photo-1556742049-0a67daf4005a?auto=format&fit=crop&w=800&q=80',
    techStack: ['Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'CSS3', 'Stripe API'],
    liveUrl: 'https://example.com/ecommerce-demo',
    githubUrl: 'https://github.com/example/ecommerce-cloud',
    category: 'Full Stack',
    featured: true
  },
  {
    _id: 'demo-2',
    title: 'Task Orchestration & Kanban SaaS',
    description: 'Collaborative task management application with real-time drag-and-drop workflow and team velocity analytics.',
    fullDescription: 'A collaborative task management application enabling agile software teams to manage sprint backlogs, track project deadlines, assign team members, and visualize velocity charts.',
    image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=800&q=80',
    techStack: ['JavaScript', 'HTML5', 'CSS3', 'Node.js', 'Express.js', 'MongoDB'],
    liveUrl: 'https://example.com/kanban-demo',
    githubUrl: 'https://github.com/example/task-orchestrator',
    category: 'Full Stack',
    featured: true
  },
  {
    _id: 'demo-3',
    title: 'AI Prompt & Image Generator Studio',
    description: 'Creative studio application connecting generative AI endpoints to produce visual assets with style presets.',
    fullDescription: 'Integrated modern AI endpoints to generate customized high-resolution images from natural language text prompts, complete with prompt history, user favorites, and instant download options.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    techStack: ['HTML5', 'CSS Glassmorphism', 'Vanilla JS', 'REST API'],
    liveUrl: 'https://example.com/ai-studio-demo',
    githubUrl: 'https://github.com/example/ai-image-studio',
    category: 'Frontend',
    featured: false
  },
  {
    _id: 'demo-4',
    title: 'Rest API Analytics & Gateway Service',
    description: 'High-performance microservice API gateway tracking route performance metrics, request limits, and JWT security.',
    fullDescription: 'Developed a robust backend REST API service designed for secure authentication, JSON rate limiting, structured error logging, and Prometheus metric monitoring.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    techStack: ['Node.js', 'Express.js', 'MongoDB', 'JWT', 'Helmet', 'Docker'],
    liveUrl: 'https://example.com/api-gateway-demo',
    githubUrl: 'https://github.com/example/api-analytics-gateway',
    category: 'Backend',
    featured: false
  }
];

let allLoadedProjects = [];

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHeaderScroll();
  initMobileNav();
  initTypewriterEffect();
  initContactForm();
  initModalListeners();
  initBackToTop();
  loadProjects();
});

/* ==========================================================================
   1. THEME SWITCHING LOGIC (DARK / LIGHT MODE)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const htmlElement = document.documentElement;

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('portfolio_theme') || 'dark';
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('portfolio_theme', newTheme);
  });

  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      themeIcon.className = 'fa-solid fa-sun';
      themeIcon.style.color = '#f59e0b';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
      themeIcon.style.color = '#6366f1';
    }
  }
}

/* ==========================================================================
   2. NAVBAR SCROLL & ACTIVE LINK HIGHLIGHTING
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // ScrollSpy active link detection
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = navToggle.querySelector('i');
    if (navMenu.classList.contains('active')) {
      icon.className = 'fa-solid fa-xmark';
    } else {
      icon.className = 'fa-solid fa-bars';
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.querySelector('i').className = 'fa-solid fa-bars';
    });
  });
}

/* ==========================================================================
   4. TYPEWRITER EFFECT IN HERO BANNER
   ========================================================================== */
function initTypewriterEffect() {
  const typedContainer = document.getElementById('hero-typed');
  if (!typedContainer) return;

  const phrases = [
    'Full Stack Software Engineer',
    'Node.js & Express API Specialist',
    'MongoDB Database Architect',
    'Creative Frontend Developer'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      typedContainer.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      typedContainer.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      typeSpeed = 2000; // Pause at end of phrase
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
  }

  type();
}

/* ==========================================================================
   5. DYNAMIC PROJECTS FETCHING & CATEGORY FILTERING
   ========================================================================== */
async function loadProjects() {
  const container = document.getElementById('projects-container');
  container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;"><i class="fa-solid fa-spinner fa-spin fa-2x highlight-text"></i><p style="margin-top: 1rem; color: var(--text-secondary);">Loading projects from REST API...</p></div>';

  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      allLoadedProjects = result.data;
    } else {
      console.warn('Backend database empty or unreachable. Displaying portfolio demo projects.');
      allLoadedProjects = DEMO_PROJECTS;
    }
  } catch (error) {
    console.warn('API Fetch Error. Falling back to built-in showcase data:', error.message);
    allLoadedProjects = DEMO_PROJECTS;
  }

  renderProjects('All');
  setupCategoryFilters();
}

function renderProjects(category) {
  const container = document.getElementById('projects-container');
  const filtered = category === 'All'
    ? allLoadedProjects
    : allLoadedProjects.filter(p => p.category === category);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">No projects found in category "${category}".</div>`;
    return;
  }

  container.innerHTML = filtered.map(proj => `
    <div class="project-card">
      <div class="project-img-wrapper">
        <img src="${proj.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}" alt="${proj.title}" class="project-img">
        <span class="project-category-badge">${proj.category || 'Full Stack'}</span>
      </div>
      <div class="project-content">
        <h3 class="project-title">${proj.title}</h3>
        <p class="project-desc">${proj.description}</p>
        <div class="project-tech-stack">
          ${(proj.techStack || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        <div class="project-links">
          <button class="project-link-btn" onclick="openProjectModal('${proj._id}')">
            <i class="fa-solid fa-circle-info"></i> Details
          </button>
          <a href="${proj.liveUrl || '#'}" target="_blank" class="project-link-btn" style="margin-left: auto;">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Demo
          </a>
          <a href="${proj.githubUrl || '#'}" target="_blank" class="project-link-btn">
            <i class="fa-brands fa-github"></i> Code
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

function setupCategoryFilters() {
  const filterBtns = document.querySelectorAll('#projects-filter .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');
      renderProjects(cat);
    });
  });
}

/* ==========================================================================
   6. PROJECT DETAILS MODAL
   ========================================================================== */
function openProjectModal(projectId) {
  const modal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content');
  const proj = allLoadedProjects.find(p => p._id === projectId || p.id === projectId);

  if (!proj) return;

  modalContent.innerHTML = `
    <img src="${proj.image}" alt="${proj.title}" style="width:100%; height: 260px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
    <span class="project-category-badge" style="position: static; display: inline-block; margin-bottom: 0.8rem;">${proj.category}</span>
    <h2 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800; margin-bottom: 0.8rem;">${proj.title}</h2>
    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.7;">${proj.fullDescription || proj.description}</p>
    <div style="margin-bottom: 1.8rem;">
      <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.6rem;">Technologies Used</h4>
      <div class="project-tech-stack">
        ${(proj.techStack || []).map(tech => `<span class="tech-tag" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">${tech}</span>`).join('')}
      </div>
    </div>
    <div style="display: flex; gap: 1rem;">
      <a href="${proj.liveUrl || '#'}" target="_blank" class="btn btn-primary">
        <i class="fa-solid fa-arrow-up-right-from-square"></i> Visit Live Application
      </a>
      <a href="${proj.githubUrl || '#'}" target="_blank" class="btn btn-outline">
        <i class="fa-brands fa-github"></i> View GitHub Source
      </a>
    </div>
  `;

  modal.classList.add('active');
}

function initModalListeners() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

/* ==========================================================================
   7. CONTACT FORM AJAX SUBMISSION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('contact-alert');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Message...';

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      const result = await response.json();

      if (result.success) {
        alertBox.className = 'form-alert success';
        alertBox.textContent = '✅ Message sent successfully! I will respond to your inquiry shortly.';
        form.reset();
      } else {
        alertBox.className = 'form-alert error';
        alertBox.textContent = `⚠️ ${result.message || 'Failed to send message.'}`;
      }
    } catch (error) {
      // Graceful local submission fallback if offline
      alertBox.className = 'form-alert success';
      alertBox.textContent = '✅ Thank you! Message received (simulated local response while backend is starting).';
      form.reset();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
    }
  });
}

/* ==========================================================================
   8. BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
