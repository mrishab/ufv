// Interactive handlers for Ellucian Banner Student Profile replica

document.addEventListener('DOMContentLoaded', () => {
  // 1. Tab switching logic for Curriculum, Hours & GPA card
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      tabPanes.forEach(pane => pane.classList.remove('active'));

      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      const activePane = document.getElementById(targetTab);
      if (activePane) {
        activePane.classList.add('active');
      }
    });
  });

  // 2. Collapsible cards logic (chevrons & headers)
  const cardHeaders = document.querySelectorAll('.card-header');

  cardHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.card');
      const body = card.querySelector('.card-body');
      const chevron = header.querySelector('.chevron-btn');

      if (body) {
        if (body.style.display === 'none') {
          body.style.display = '';
          if (chevron) chevron.classList.remove('collapsed');
        } else {
          body.style.display = 'none';
          if (chevron) chevron.classList.add('collapsed');
        }
      }
    });
  });

  // 3. Dynamic Profile Integration from ProfileStore (localStorage)
  if (typeof ProfileStore !== 'undefined') {
    // Render profile details from localStorage (or defaults)
    ProfileStore.applyProfileToDocument();

    // Synchronize across tabs when localStorage is updated
    window.addEventListener('storage', (e) => {
      if (!e.key || e.key === ProfileStore.STORAGE_KEY) {
        ProfileStore.applyProfileToDocument();
      }
    });
  }

  // 4. Secret Page Access Handlers
  const settingsBtn = document.getElementById('header-settings-btn') || document.querySelector('.header-icon-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'secret.html';
    });
  }

  // Double clicking avatar or header user also opens secret page
  const sidebarAvatar = document.querySelector('.sidebar-avatar');
  if (sidebarAvatar) {
    sidebarAvatar.style.cursor = 'pointer';
    sidebarAvatar.title = 'Double click to open profile settings';
    sidebarAvatar.addEventListener('dblclick', () => {
      window.location.href = 'secret.html';
    });
  }

  // Secret keyboard combination: Ctrl + Shift + S or Alt + S
  window.addEventListener('keydown', (e) => {
    if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key && e.key.toLowerCase() === 's') ||
        (e.altKey && e.key && e.key.toLowerCase() === 's')) {
      e.preventDefault();
      window.location.href = 'secret.html';
    }
  });

  // Secret typing trigger: typing "secret" anywhere on page
  let secretTypeBuffer = '';
  window.addEventListener('keydown', (e) => {
    if (!e.key || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    secretTypeBuffer = (secretTypeBuffer + e.key.toLowerCase()).slice(-6);
    if (secretTypeBuffer === 'secret') {
      window.location.href = 'secret.html';
    }
  });
});
