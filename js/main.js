// --- Botón subir página ---
const btn = document.getElementById("btnSubir");

window.onscroll = function() {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
};

btn.onclick = function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- Menú hamburguesa ---
const menuToggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");

// abrir/cerrar menú hamburguesa
menuToggle.addEventListener("click", () => {
  sideMenu.classList.toggle("open");
  document.body.classList.toggle("menu-open"); // bloquea/desbloquea scroll
});

// --- Dropdown móvil ---
document.addEventListener("DOMContentLoaded", function() {
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener("click", function(e) {
      e.stopPropagation(); // Evita cerrar el menú principal
      this.parentElement.classList.toggle("active");
    });
  });

  // cerrar menú al tocar enlaces normales (que NO son dropdown)
  const links = sideMenu.querySelectorAll("a:not(.dropdown-toggle)");
  links.forEach(link => {
    link.addEventListener("click", function() {
      sideMenu.classList.remove("open");
      document.body.classList.remove("menu-open"); // reactivar scroll
    });
  });
});
