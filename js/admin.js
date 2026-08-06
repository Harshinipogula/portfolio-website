/**
 * ==========================================================================
 * SECURE ADMIN DASHBOARD CONTROLLER & REST API INTEGRATION
 * ==========================================================================
 */

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';

let adminToken = localStorage.getItem('adminToken') || '';
let currentEditingProjectId = null;
let currentViewingMessageId = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();
  initLoginForm();
  initSidebarNav();
  initProjectModal();
  initLogout();
});

/* ==========================================================================
   1. AUTHENTICATION & SESSION MANAGEMENT
   ========================================================================== */
async function checkAuthSession() {
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');

  if (!adminToken) {
    loginView.style.display = 'flex';
    dashboardView.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const result = await response.json();

    if (result.success) {
      loginView.style.display = 'none';
      dashboardView.style.display = 'flex';
      loadDashboardOverview();
      loadProjectsTable();
      loadMessagesTable();
    } else {
      logoutAdmin();
    }
  } catch (error) {
    console.warn('Session verification warning:', error);
    // Allow viewing workspace during local static testing
    loginView.style.display = 'none';
    dashboardView.style.display = 'flex';
  }
}

function initLoginForm() {
  const form = document.getElementById('admin-login-form');
  const alertBox = document.getElementById('login-alert');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success) {
        adminToken = result.token;
        localStorage.setItem('adminToken', adminToken);
        alertBox.className = 'form-alert success';
        alertBox.textContent = '✅ Login successful! Redirecting...';
        setTimeout(() => checkAuthSession(), 600);
      } else {
        alertBox.className = 'form-alert error';
        alertBox.textContent = `⚠️ ${result.message || 'Invalid admin credentials'}`;
      }
    } catch (error) {
      alertBox.className = 'form-alert error';
      alertBox.textContent = '⚠️ Cannot connect to backend server. Ensure backend server is running on port 5000.';
    }
  });
}

function initLogout() {
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutAdmin);
  }
}

function logoutAdmin() {
  adminToken = '';
  localStorage.removeItem('adminToken');
  document.getElementById('login-view').style.display = 'flex';
  document.getElementById('dashboard-view').style.display = 'none';
}

/* ==========================================================================
   2. SIDEBAR NAVIGATION & TABS
   ========================================================================== */
function initSidebarNav() {
  const links = document.querySelectorAll('.sidebar-link');
  const panes = document.querySelectorAll('.tab-pane');
  const heading = document.getElementById('tab-heading');

  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      panes.forEach(p => p.style.display = 'none');

      link.classList.add('active');
      const tab = link.getAttribute('data-tab');
      const targetPane = document.getElementById(`pane-${tab}`);
      if (targetPane) targetPane.style.display = 'block';

      if (tab === 'overview') heading.textContent = 'Dashboard Overview';
      if (tab === 'projects') heading.textContent = 'Manage Projects';
      if (tab === 'messages') heading.textContent = 'Client Inquiries';
    });
  });
}

/* ==========================================================================
   3. OVERVIEW METRICS
   ========================================================================== */
async function loadDashboardOverview() {
  try {
    const projRes = await fetch(`${API_BASE_URL}/projects`);
    const projData = await projRes.json();
    if (projData.success) {
      document.getElementById('metric-projects-count').textContent = projData.count || 0;
    }

    const msgRes = await fetch(`${API_BASE_URL}/contact`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const msgData = await msgRes.json();
    if (msgData.success) {
      document.getElementById('metric-messages-count').textContent = msgData.count || 0;
      document.getElementById('metric-unread-count').textContent = msgData.unreadCount || 0;

      const sidebarUnread = document.getElementById('sidebar-unread-count');
      if (msgData.unreadCount > 0) {
        sidebarUnread.style.display = 'inline-block';
        sidebarUnread.textContent = msgData.unreadCount;
      } else {
        sidebarUnread.style.display = 'none';
      }
    }
  } catch (err) {
    console.warn('Overview metrics load warning:', err);
  }
}

/* ==========================================================================
   4. PROJECTS CRUD OPERATIONS
   ========================================================================== */
async function loadProjectsTable() {
  const tbody = document.getElementById('projects-table-body');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> Loading projects...</td></tr>';

  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      renderProjectsTableRows(result.data);
    } else {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No projects found. Click "Add New Project" to create your first entry.</td></tr>';
    }
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444;">Failed to connect to REST API backend.</td></tr>';
  }
}

function renderProjectsTableRows(projects) {
  const tbody = document.getElementById('projects-table-body');
  tbody.innerHTML = projects.map(p => `
    <tr>
      <td><img src="${p.image}" class="table-img" alt="${p.title}"></td>
      <td><strong>${p.title}</strong></td>
      <td><span class="tech-tag">${p.category}</span></td>
      <td>${(p.techStack || []).join(', ')}</td>
      <td>${p.featured ? '<span style="color:#22c55e;">★ Yes</span>' : 'No'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon edit" onclick="openEditProjectModal('${p._id}')" title="Edit Project"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn-icon delete" onclick="deleteProject('${p._id}')" title="Delete Project"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function initProjectModal() {
  const modal = document.getElementById('project-form-modal');
  const openBtn = document.getElementById('open-add-project-modal');
  const closeBtn = document.getElementById('close-project-modal-btn');
  const form = document.getElementById('project-form');

  openBtn.addEventListener('click', () => {
    currentEditingProjectId = null;
    document.getElementById('project-modal-title').textContent = 'Add New Project';
    form.reset();
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const projectData = {
      title: document.getElementById('proj-title').value.trim(),
      category: document.getElementById('proj-category').value,
      description: document.getElementById('proj-desc').value.trim(),
      fullDescription: document.getElementById('proj-full-desc').value.trim(),
      image: document.getElementById('proj-image').value.trim(),
      techStack: document.getElementById('proj-tech').value.trim(),
      liveUrl: document.getElementById('proj-live').value.trim(),
      githubUrl: document.getElementById('proj-github').value.trim(),
      featured: document.getElementById('proj-featured').checked
    };

    const method = currentEditingProjectId ? 'PUT' : 'POST';
    const url = currentEditingProjectId ? `${API_BASE_URL}/projects/${currentEditingProjectId}` : `${API_BASE_URL}/projects`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(projectData)
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ Project saved successfully!');
        modal.classList.remove('active');
        loadProjectsTable();
        loadDashboardOverview();
      } else {
        alert(`⚠️ Error: ${result.message}`);
      }
    } catch (err) {
      alert('⚠️ Failed to save project. Ensure backend server is online.');
    }
  });
}

async function openEditProjectModal(projectId) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    const result = await response.json();

    if (result.success && result.data) {
      const p = result.data;
      currentEditingProjectId = p._id;
      document.getElementById('project-modal-title').textContent = 'Edit Project';

      document.getElementById('proj-title').value = p.title || '';
      document.getElementById('proj-category').value = p.category || 'Full Stack';
      document.getElementById('proj-desc').value = p.description || '';
      document.getElementById('proj-full-desc').value = p.fullDescription || '';
      document.getElementById('proj-image').value = p.image || '';
      document.getElementById('proj-tech').value = (p.techStack || []).join(', ');
      document.getElementById('proj-live').value = p.liveUrl || '';
      document.getElementById('proj-github').value = p.githubUrl || '';
      document.getElementById('proj-featured').checked = Boolean(p.featured);

      document.getElementById('project-form-modal').classList.add('active');
    }
  } catch (err) {
    alert('Failed to fetch project details for editing');
  }
}

async function deleteProject(projectId) {
  if (!confirm('Are you sure you want to delete this project permanently?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const result = await response.json();

    if (result.success) {
      loadProjectsTable();
      loadDashboardOverview();
    } else {
      alert(`⚠️ ${result.message}`);
    }
  } catch (err) {
    alert('Failed to delete project.');
  }
}

/* ==========================================================================
   5. MESSAGES INBOX MANAGEMENT
   ========================================================================== */
async function loadMessagesTable() {
  const tbody = document.getElementById('messages-table-body');

  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      tbody.innerHTML = result.data.map(m => `
        <tr style="${!m.read ? 'font-weight: 700; background: rgba(99, 102, 241, 0.05);' : ''}">
          <td>${m.read ? '<span style="color:var(--text-muted)">Read</span>' : '<span class="badge-unread">NEW</span>'}</td>
          <td>${new Date(m.createdAt).toLocaleDateString()}</td>
          <td>${m.name}</td>
          <td>${m.email}</td>
          <td>${m.subject}</td>
          <td>
            <button class="btn-icon edit" onclick="viewMessageModal('${m._id}')" title="View Message"><i class="fa-solid fa-eye"></i></button>
            <button class="btn-icon delete" onclick="deleteMessage('${m._id}')" title="Delete Message"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No client messages received yet.</td></tr>';
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Unable to load messages.</td></tr>';
  }
}

async function viewMessageModal(messageId) {
  currentViewingMessageId = messageId;
  const modal = document.getElementById('message-detail-modal');

  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const result = await response.json();

    if (result.success) {
      const msg = result.data.find(m => m._id === messageId);
      if (msg) {
        document.getElementById('msg-detail-subject').textContent = msg.subject;
        document.getElementById('msg-detail-meta').textContent = `From: ${msg.name} (${msg.email}) • Received: ${new Date(msg.createdAt).toLocaleString()}`;
        document.getElementById('msg-detail-body').textContent = msg.message;

        // Auto mark as read when opened
        if (!msg.read) {
          toggleMessageRead(msg._id, true);
        }

        modal.classList.add('active');
      }
    }
  } catch (err) {
    alert('Failed to view message details');
  }
}

async function toggleMessageRead(msgId, readStatus) {
  try {
    await fetch(`${API_BASE_URL}/contact/${msgId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ read: readStatus })
    });
    loadMessagesTable();
    loadDashboardOverview();
  } catch (err) {
    console.error('Failed to update read status', err);
  }
}

async function deleteMessage(msgId) {
  if (!confirm('Are you sure you want to delete this message?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/contact/${msgId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const result = await response.json();

    if (result.success) {
      document.getElementById('message-detail-modal').classList.remove('active');
      loadMessagesTable();
      loadDashboardOverview();
    }
  } catch (err) {
    alert('Failed to delete message');
  }
}

// Close message modal handler
document.getElementById('close-message-modal-btn')?.addEventListener('click', () => {
  document.getElementById('message-detail-modal').classList.remove('active');
});
