const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});
const menuBtn = document.getElementById("menu-btn");
      const menu = document.getElementById("mobile-menu");
      const iconOpen = document.getElementById("icon-open");
      const iconClose = document.getElementById("icon-close");

      function setMenu(open) {
        // état fermé / ouvert (la transition est gérée par Tailwind)
        menu.classList.toggle("opacity-0", !open);
        menu.classList.toggle("invisible", !open);
        menu.classList.toggle("-translate-y-4", !open);
        menu.classList.toggle("opacity-100", open);
        menu.classList.toggle("visible", open);
        menu.classList.toggle("translate-y-0", open);
        // bloque le scroll de la page quand le menu est ouvert
        document.body.classList.toggle("overflow-hidden", open);
        iconOpen.classList.toggle("hidden", open);
        iconClose.classList.toggle("hidden", !open);
        menuBtn.setAttribute("aria-expanded", open);
        menuBtn.setAttribute(
          "aria-label",
          open ? "Fermer le menu" : "Ouvrir le menu"
        );
      }

      menuBtn.addEventListener("click", () => {
        setMenu(menuBtn.getAttribute("aria-expanded") === "false");
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setMenu(false);
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth >= 768) setMenu(false);
      });

      // ferme le menu quand on clique sur un lien
      menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenu(false));
      });
