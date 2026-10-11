/* motion.js — portfolio Karl Eméry (index + cv)
   Dépend de : gsap, ScrollTrigger, Lenis (chargés avant ce fichier).
   Aucune donnée externe injectée : uniquement textContent, jamais innerHTML. */
(() => {
  window.__motion = true; // signale au filet de sécurité du <head> que le script tourne
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const loader = $("#loader");
  let curtain = $("#curtain");
  const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: (k) => { try { sessionStorage.removeItem(k); } catch (e) {} },
  };

  // Le préloader ne joue qu'à la première visite de la session
  const firstVisit = !store.get("seen");
  store.set("seen", "1");

  // Pas de GSAP ou mouvement réduit -> on retire les voiles et on s'arrête
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || !window.ScrollTrigger || reduced) {
    loader && loader.remove();
    curtain && curtain.remove();
    document.documentElement.classList.remove("is-arriving");
    document.documentElement.style.visibility = "";
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Page sans rideau dans le HTML (ex. contact, CSP stricte) : on le crée en JS
  if (!curtain) {
    curtain = document.createElement("div");
    curtain.id = "curtain";
    curtain.setAttribute("aria-hidden", "true");
    curtain.style.cssText =
      "position:fixed;inset:0;z-index:9998;background:#1B4332;transform:scaleY(0);transform-origin:bottom;pointer-events:none";
    document.body.appendChild(curtain);
  }

  // Anciennes animations CSS (.reveal) : GSAP prend le relais
  $$(".reveal").forEach((el) => {
    el.classList.remove("reveal", "reveal-up", "reveal-left", "reveal-right");
    el.style.animation = "";
    el.style.animationDelay = "";
  });

  /* ---------- Scroll fluide (Lenis) ---------- */
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------- Outils ---------- */
  const splitLetters = (el) => {
    const txt = el.textContent.trim();
    el.textContent = "";
    el.setAttribute("aria-label", txt);
    const letters = [];
    const words = txt.split(/\s+/);
    words.forEach((word, wi) => {
      // Chaque mot reste insécable : le titre ne peut plus casser lettre par lettre
      const w = document.createElement("span");
      w.setAttribute("aria-hidden", "true");
      w.style.cssText = "display:inline-block;white-space:nowrap";
      [...word].forEach((ch) => {
        const mask = document.createElement("span");
        mask.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em";
        const inner = document.createElement("span");
        inner.style.display = "inline-block";
        inner.textContent = ch;
        mask.appendChild(inner);
        w.appendChild(mask);
        letters.push(inner);
      });
      el.appendChild(w);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return letters;
  };
  const m = (n) => $(`[data-m="${n}"]`);

  // Apparition au scroll, par lots, une seule fois
  const onScroll = (targets, vars = {}) => {
    const els = typeof targets === "string" ? $$(targets) : targets;
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: vars.y ?? 36, transition: "none" });
    ScrollTrigger.batch(els, {
      start: vars.start || "top 90%", once: true,
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1, y: 0, duration: 1.1, ease: "expo.out",
        stagger: vars.stagger ?? 0.07, clearProps: "opacity,transform,transition",
      }),
    });
  };
  // Titre en lettres qui monte depuis un masque quand il entre à l'écran
  const titleOnScroll = (h) => {
    const l = splitLetters(h);
    gsap.set(l, { yPercent: 115, rotate: 6 });
    ScrollTrigger.create({ trigger: h, start: "top 85%", once: true,
      onEnter: () => gsap.to(l, { yPercent: 0, rotate: 0, duration: 1.2, ease: "expo.out", stagger: 0.05 }) });
  };

  /* ---------- Page : ACCUEIL ---------- */
  const initHome = () => {
    const title = $("section h1");
    const letters = title ? splitLetters(title) : [];
    const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    tl.fromTo(m("block"), { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "expo.inOut" }, 0)
      .from("header nav > *", { y: -24, opacity: 0, duration: 1, stagger: 0.1 }, 0.2)
      .from(letters, { yPercent: 115, rotate: 7, duration: 1.3, stagger: 0.07 }, 0.35)
      .from(m("card"), { y: 90, opacity: 0, duration: 1.5 }, 0.6)
      .from(m("photo"), { scale: 1.4, duration: 2, ease: "power3.out" }, 0.6)
      .from(m("rule"), { scaleX: 0, duration: 0.9 }, 1.3)
      .from(m("sub"), { y: 24, opacity: 0, duration: 1 }, 0.9)
      .from(m("cta").children, { y: 30, opacity: 0, duration: 1, stagger: 0.12 }, 1.05)
      .from(m("bio"), { y: 30, opacity: 0, duration: 1.2 }, 1.25);

    const st = { trigger: "section", start: "top top", end: "bottom top", scrub: 0.8 };
    gsap.to(m("card"), { yPercent: -10, ease: "none", scrollTrigger: st });
    if (title) gsap.to(title, { yPercent: -18, ease: "none", scrollTrigger: st });
    return tl;
  };

  /* ---------- Page : CV ---------- */
  const initCv = () => {
    const sections = $$("section");
    const first = sections[0];
    const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });

    const cvTitle = $("h2", first);
    const cvLetters = cvTitle ? splitLetters(cvTitle) : [];
    const panel = $(".order-first", first);
    const sticky = $$('[class*="md:sticky"] h3');          // Formation, Compétence, Certifications
    const formation = sticky[0] ? splitLetters(sticky[0]) : [];

    tl.from("header nav > *", { y: -24, opacity: 0, duration: 1, stagger: 0.1 }, 0.1)
      .from(cvLetters, { yPercent: 115, rotate: 7, duration: 1.3, stagger: 0.09 }, 0.25);
    if (panel) tl.fromTo(panel, { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 1.5, ease: "expo.inOut" }, 0.15);
    tl.from(formation, { yPercent: 115, rotate: 6, duration: 1.2, stagger: 0.05 }, 0.7);

    // Parcours : chaque ligne (date puis intitulé) apparaît en descendant
    $$(".pb-2 > div.flex", first).forEach((row) => onScroll([...row.children], { y: 44, stagger: 0.15 }));
    // Titres des sections suivantes
    sticky.slice(1).forEach(titleOnScroll);
    // Compétences, certifications, téléchargement
    onScroll("section:nth-of-type(2) h3.font-display, section:nth-of-type(2) li", { y: 28, stagger: 0.06 });
    onScroll("section:nth-of-type(3) .pb-20 h3", { y: 40, stagger: 0.15 });
    onScroll("section:last-of-type p, a[download]", { y: 30, stagger: 0.12 });
    return tl;
  };

  /* ---------- Page : PROJETS ---------- */
  const initProjets = () => {
    const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    const h = $("section > h1");
    const l = h ? splitLetters(h) : [];
    tl.from("header nav > *", { y: -24, opacity: 0, duration: 1, stagger: 0.1 }, 0.1)
      .from(l, { yPercent: 115, rotate: 7, duration: 1.2, stagger: 0.06 }, 0.25);

    // Chaque projet : la carte s'ouvre en clip-path, puis texte et média suivent
    const fill = (t, card, at) => {
      const [txt, media] = card.children;
      gsap.set([...txt.children, media], { transition: "none" });
      t.fromTo(card,
          { clipPath: "inset(10% 6% 10% 6% round 1rem)", opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0% round 1rem)", opacity: 1, duration: 1.4,
            onComplete: () => gsap.set(card, { clearProps: "clipPath" }) }, at)
       .from([...txt.children], { y: 30, opacity: 0, duration: 1, stagger: 0.1,
            clearProps: "opacity,transform,transition" }, at + 0.25)
       .from(media, { y: 50, opacity: 0, duration: 1.3,
            clearProps: "opacity,transform,transition" }, at + 0.35);
    };
    $$("section .rounded-2xl").forEach((card, i) => {
      if (i === 0) fill(tl, card, 0.6);                    // visible dès l'arrivée
      else fill(gsap.timeline({ defaults: { ease: "expo.out" },
        scrollTrigger: { trigger: card, start: "top 85%", once: true } }), card, 0);

      // Parallaxe : la vidéo glisse doucement dans son cadre
      const v = $("video", card);
      if (v) gsap.fromTo(v, { yPercent: -6, scale: 1.15 }, { yPercent: 6, scale: 1.15, ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
    });
    return tl;
  };

  /* ---------- Page : CONTACT ---------- */
  const initContact = () => {
    const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    const h = $("main > h2");
    const l = h ? splitLetters(h) : [];
    const card = $("main > section");
    tl.from("header nav > *", { y: -24, opacity: 0, duration: 1, stagger: 0.1 }, 0.1)
      .from(l, { yPercent: 115, rotate: 7, duration: 1.3, stagger: 0.06 }, 0.25);
    if (card) {
      const left = card.children[0];
      const items = [...left.children[0].children, ...$$("ul > li", left)];
      const fields = $$("form > div, form > button", card);
      const all = [...items, ...fields];
      gsap.set(all, { transition: "none" });
      tl.fromTo(card, { clipPath: "inset(8% 5% 8% 5% round 1.5rem)", opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0% round 1.5rem)", opacity: 1, duration: 1.5,
            onComplete: () => gsap.set(card, { clearProps: "clipPath" }) }, 0.45)
        .from(items, { y: 30, opacity: 0, duration: 1, stagger: 0.1,
            clearProps: "opacity,transform,transition" }, 0.85)
        .from(fields, { y: 30, opacity: 0, duration: 1, stagger: 0.08,
            clearProps: "opacity,transform,transition" }, 1.0);
    }
    return tl;
  };

  /* ---------- Pages légales (confidentialité, mentions, cookies) ---------- */
  // Mode sobre et générique : titre en lettres, puis blocs de texte qui apparaissent en douceur.
  const initLegal = () => {
    const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    const root = $("main") || $("section") || document.body;
    const inPage = (el) => !el.closest("header, footer, nav");
    const h = $$("h1, h2", root).find(inPage);
    const l = h ? splitLetters(h) : [];
    tl.from("header nav > *", { y: -24, opacity: 0, duration: 1, stagger: 0.1 }, 0.1)
      .from(l, { yPercent: 115, rotate: 7, duration: 1.2, stagger: 0.05 }, 0.25);

    // Blocs de lecture, sans doublons (un <ul> compte pour tous ses <li>)
    const cand = $$("h2, h3, h4, p, ul, ol, table, blockquote", root).filter((el) => inPage(el) && el !== h);
    const set = new Set(cand);
    const blocks = cand.filter((el) => {
      for (let a = el.parentElement; a && a !== root; a = a.parentElement) if (set.has(a)) return false;
      return true;
    });
    // Ce qui est déjà visible à l'arrivée entre avec le titre, le reste au scroll
    const fold = blocks.filter((el) => el.getBoundingClientRect().top < innerHeight * 0.9);
    const rest = blocks.filter((el) => !fold.includes(el));
    if (fold.length) {
      gsap.set(fold, { transition: "none" });
      tl.from(fold, { y: 28, opacity: 0, duration: 1, stagger: 0.06,
        clearProps: "opacity,transform,transition" }, 0.7);
    }
    onScroll(rest, { y: 28, stagger: 0.05 });
    return tl;
  };

  /* ---------- Page générique ---------- */
  const initGeneric = () =>
    gsap.timeline({ paused: true }).from("header nav > *", { y: -24, opacity: 0, duration: 1, stagger: 0.1, ease: "expo.out" });

  const page = m("block") ? "home" : document.body.dataset.page;
  const intro = ({ home: initHome, cv: initCv, projets: initProjets, contact: initContact, legal: initLegal }[page] || initGeneric)();
  const play = (at = 0) => gsap.delayedCall(at, () => intro.play());

  // Pied de page (toutes pages)
  const foot = $("footer");
  if (foot) onScroll(foot.querySelectorAll("li, h2, h2 + *"), { y: 24, stagger: 0.06, start: "top 95%" });

  /* ---------- Démarrage : preloader, ou arrivée depuis une transition ---------- */
  lenis.stop();
  if (store.get("arriving") && curtain) {
    store.del("arriving");
    loader && loader.remove(); // sinon il réapparaît quand on retire "is-arriving"
    gsap.set(curtain, { scaleY: 1, transformOrigin: "top" });
    document.documentElement.classList.remove("is-arriving");
    gsap.to(curtain, { scaleY: 0, duration: 0.8, ease: "expo.inOut", onComplete: () => lenis.start() });
    play(0.2);
  } else if (loader && firstVisit) {
    const count = $("#loader-count");
    const o = { v: 0 };
    gsap.timeline()
      .to(o, { v: 100, duration: 1.2, ease: "power2.inOut",
        onUpdate: () => { count.textContent = Math.round(o.v); } })
      .to(loader.children, { opacity: 0, y: -20, duration: 0.4, stagger: 0.05 }, "+=0.05")
      .to(loader, { yPercent: -100, duration: 0.9, ease: "expo.inOut",
        onComplete: () => { loader.remove(); lenis.start(); } })
      .add(() => play(0), "-=0.55");
  } else {
    loader && loader.remove();
    lenis.start();
    play(0.1);
  }

  document.documentElement.style.visibility = "";

  /* ---------- Transitions de page : rideau vert ---------- */
  if (curtain) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey) return;
      let u;
      try { u = new URL(a.href, location.href); } catch (err) { return; }
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
      if (u.pathname === location.pathname) { e.preventDefault(); return; }
      e.preventDefault();
      lenis.stop();
      gsap.set(curtain, { transformOrigin: "bottom" });
      gsap.to(curtain, { scaleY: 1, duration: 0.75, ease: "power4.inOut",
        onComplete: () => { store.set("arriving", "1"); location.href = u.href; } });
    });
    addEventListener("pageshow", (e) => {
      if (e.persisted) { gsap.set(curtain, { scaleY: 0 }); lenis.start(); }
    });
  }

  /* ---------- Curseur (souris uniquement) ---------- */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const ring = document.createElement("div");
    ring.setAttribute("aria-hidden", "true");
    ring.style.cssText =
      "position:fixed;left:0;top:0;width:38px;height:38px;margin:-19px 0 0 -19px;" +
      "border:1px solid #D4A373;border-radius:50%;pointer-events:none;z-index:10000;opacity:0";
    document.body.appendChild(ring);
    const xTo = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    addEventListener("mousemove", (e) => {
      xTo(e.clientX); yTo(e.clientY);
      gsap.to(ring, { opacity: 1, duration: 0.3, overwrite: "auto" });
    });
    document.addEventListener("mouseleave", () => gsap.to(ring, { opacity: 0, duration: 0.3 }));
    $$("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () =>
        gsap.to(ring, { scale: 1.9, backgroundColor: "rgba(212,163,115,.22)", duration: 0.4, ease: "expo.out" }));
      el.addEventListener("mouseleave", () =>
        gsap.to(ring, { scale: 1, backgroundColor: "rgba(212,163,115,0)", duration: 0.4, ease: "expo.out" }));
    });

    // Icônes sociales et bouton de téléchargement magnétiques
    $$('[data-m="card"] a[aria-label], footer a[aria-label], a[download]').forEach((a) => {
      const k = a.hasAttribute("download") ? 0.25 : 0.5;
      const qx = gsap.quickTo(a, "x", { duration: 0.6, ease: "elastic.out(1,0.5)" });
      const qy = gsap.quickTo(a, "y", { duration: 0.6, ease: "elastic.out(1,0.5)" });
      a.addEventListener("mousemove", (e) => {
        const r = a.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * k);
        qy((e.clientY - (r.top + r.height / 2)) * k);
      });
      a.addEventListener("mouseleave", () => { qx(0); qy(0); });
    });
  }
})();