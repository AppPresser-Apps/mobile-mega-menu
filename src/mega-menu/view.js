document.addEventListener('DOMContentLoaded', () => {
  // 1. Select all potential top-level menu items and the mega menu triggers
  const allMenuItems = document.querySelectorAll('.wp-block-navigation-item'); // Standard WP class
  const megaTriggers = document.querySelectorAll('.has-mega-menu');
  const header = document.querySelector('header') || document.querySelector('.wp-block-template-part-header');

  // Function to close all open mega menus
  const closeAllMenus = () => {
      document.querySelectorAll('[data-menu-slug]').forEach(menu => {
          menu.classList.remove('is-active');
      });
  };

  // 2. Clear menus when hovering menu items that are NOT inside a mega menu (data-menu-slug)
  allMenuItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
          // Only close if this item is not inside a data-menu-slug container
          if (!item.closest('[data-menu-slug]')) {
              closeAllMenus();
          }
      });
  });

  // 3. Specifically open the target for mega menu triggers
  megaTriggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', (e) => {
          // Stop the 'allMenuItems' listener from fighting with this one
          e.stopPropagation();

          closeAllMenus(); // Fresh start
          const slug = trigger.getAttribute('data-mega-slug');
          const targetMenu = document.querySelector(`[data-menu-slug="${slug}"]`);

          if (targetMenu) {
              targetMenu.classList.add('is-active');
          }
      });
  });

  // 4. Close everything when leaving the header entirely
  if (header) {
      header.addEventListener('mouseleave', () => {
          closeAllMenus();
      });
  }
});
