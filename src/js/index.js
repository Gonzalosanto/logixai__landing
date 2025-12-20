document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');
  const navLinks = menu.querySelectorAll('a');

  const toggleMenu = () => {
    menu.classList.toggle('hidden');
    hamburgerIcon.classList.toggle('hidden');
    closeIcon.classList.toggle('hidden');
  };

  btn.addEventListener('click', toggleMenu);

  // Cerrar el menú automáticamente al hacer clic en un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (!menu.classList.contains('hidden')) {
        toggleMenu();
      }
    });
  });
});