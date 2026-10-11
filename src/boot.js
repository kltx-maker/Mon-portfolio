/* boot.js — pour les pages à CSP stricte (pas de script ni de style inline).
   Si on arrive depuis une transition, on masque la page jusqu'à ce que motion.js
   ait posé le rideau, pour éviter un flash de contenu. */
(function () {
  try {
    if (!sessionStorage.getItem("arriving")) return;
    var d = document.documentElement;
    d.style.visibility = "hidden";
    setTimeout(function () {
      if (!window.__motion) d.style.visibility = "";
    }, 3000);
  } catch (e) {}
})();