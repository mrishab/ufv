// Interactive handlers for Ellucian Banner Student Profile replica

document.addEventListener('DOMContentLoaded', () => {
  // Tab switching logic for Curriculum, Hours & GPA card
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

  // Collapsible cards logic (chevrons & headers)
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
});
