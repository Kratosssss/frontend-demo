(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const motionToggle = document.querySelector("[data-motion-toggle]");
  const motionStatus = document.querySelector("[data-motion-status]");
  const motionLabel = document.querySelector("[data-motion-label]");
  const scrollFill = document.querySelector(".scroll-meter__fill");
  const scrollValue = document.querySelector("[data-scroll-value]");
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  const stage = document.querySelector("[data-pointer-stage]");
  const pointerX = document.querySelector("[data-pointer-x]");
  const pointerY = document.querySelector("[data-pointer-y]");
  const clock = document.querySelector("[data-clock]");
  const scrollLab = document.querySelector("[data-scroll-lab]");
  const sequenceStage = document.querySelector("[data-sequence-stage]");
  const labProgress = document.querySelector("[data-lab-progress]");
  const sceneCurrent = document.querySelector("[data-scene-current]");
  const sceneCopies = [...document.querySelectorAll("[data-scene-copy]")];
  const modeButtons = [...document.querySelectorAll(".mode-button[data-mode]")];
  const modeStage = document.querySelector("[data-mode-stage]");
  const modeName = document.querySelector("[data-mode-name]");
  const revealNodes = [...document.querySelectorAll("[data-reveal]")];
  const finaleSun = document.querySelector(".finale__sun");
  const entranceLink = document.querySelector('.hero .command-link[href="#scroll-lab"]');

  const labels = {
    running: { status: "LIVE SEQUENCE", button: "暂停动态", pressed: "false" },
    paused: { status: "SEQUENCE PAUSED", button: "继续动态", pressed: "true" },
    reduced: { status: "REDUCED MOTION", button: "启用动态", pressed: "true" }
  };
  const modeLabels = {
    orbit: "ORBIT / 连续方向",
    pulse: "PULSE / 强调反馈",
    trace: "TRACE / 路径关联"
  };

  let motion = prefersReduced.matches ? "reduced" : "running";
  let isPageVisible = !document.hidden;
  let scrollFrame = 0;
  let pointerFrame = 0;
  let clockTimer = 0;
  let pointerReturnTimer = 0;
  let labMetrics = { top: 0, range: 1 };
  let currentScene = 0;
  let currentMode = "orbit";
  let targetPointer = { x: 0, y: 0, rx: 0, ry: 0, readX: 50, readY: 50 };
  let appliedPointer = { x: 0, y: 0, rx: 0, ry: 0 };

  function isRunning() {
    return motion === "running" && isPageVisible;
  }

  function updateMotionUI() {
    const label = labels[motion];
    root.dataset.motion = motion;
    motionStatus.textContent = label.status;
    motionLabel.textContent = label.button;
    motionToggle.setAttribute("aria-label", label.button);
    motionToggle.setAttribute("aria-pressed", label.pressed);
  }

  function stopClock() {
    if (clockTimer) window.clearInterval(clockTimer);
    clockTimer = 0;
  }

  function updateClock() {
    const now = new Date();
    clock.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((unit) => String(unit).padStart(2, "0"))
      .join(":");
  }

  function syncClock() {
    stopClock();
    if (!isRunning()) return;
    updateClock();
    clockTimer = window.setInterval(updateClock, 1000);
  }

  function finishHero() {
    hero.classList.add("is-entered");
  }

  function showAllReveals() {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
    if (finaleSun) finaleSun.classList.add("is-visible");
  }

  function updateSceneVisibility(scene, exposeAll = false) {
    sceneCopies.forEach((copy, index) => {
      const active = index === scene;
      copy.classList.toggle("is-active", active);
      copy.hidden = !exposeAll && !active;
    });
  }

  function setMotion(nextMotion) {
    motion = nextMotion;
    updateMotionUI();
    if (motion !== "running") {
      finishHero();
      showAllReveals();
      resetPointer(true);
    }
    updateSceneVisibility(currentScene, motion === "reduced");
    syncClock();
    scheduleScrollUpdate();
  }

  function sceneFromProgress(progress) {
    if (motion !== "running") return progress < .5 ? (progress < .17 ? 0 : 1) : 2;
    if (currentScene === 0 && progress >= .343) return 1;
    if (currentScene === 1 && progress >= .676) return 2;
    if (currentScene === 1 && progress < .323) return 0;
    if (currentScene === 2 && progress < .656) return 1;
    return currentScene;
  }

  function setScene(scene) {
    if (scene === currentScene) return;
    currentScene = scene;
    scrollLab.dataset.scene = String(scene);
    sceneCurrent.textContent = String(scene + 1).padStart(2, "0");
    updateSceneVisibility(scene, motion === "reduced");
  }

  function applyLabProgress(progress) {
    if (!sequenceStage) return;
    const progressPercent = Math.round(progress * 100);
    labProgress.textContent = String(progressPercent).padStart(3, "0");
    scrollLab.style.setProperty("--lab-rail", String(progress));

    const scene = sceneFromProgress(progress);
    setScene(scene);
    if (motion !== "running") {
      applyLabStatic(scene);
      return;
    }

    const first = Math.min(progress / .333, 1);
    const second = Math.min(Math.max((progress - .333) / .333, 0), 1);
    const third = Math.min(Math.max((progress - .666) / .194, 0), 1);
    let objectX = -34 + first * 34;
    let objectY = 22 - first * 22;
    let satelliteX = -15 + first * 14;
    let satelliteY = 16 - first * 16;
    let ring = .7 + first * .3;
    let path = 0;
    let ghosts = Math.min(.56, first * .74);

    if (progress >= .333) {
      objectX = second * 22;
      objectY = second * -28;
      satelliteX = second * 15 - 1;
      satelliteY = second * -14;
      path = second;
      ghosts = Math.max(.24, .56 - second * .32);
    }
    if (progress >= .666) {
      objectX = 22;
      objectY = -28;
      satelliteX = 14;
      satelliteY = -14;
      path = 1;
      ghosts = .14;
      ring = 1 + Math.max(0, 1 - Math.abs(third - .78) * 8) * .24;
    }

    setSequenceValues({ objectX, objectY, satelliteX, satelliteY, ring, path, ghosts });
  }

  function applyLabStatic(scene) {
    const states = [
      { objectX: 0, objectY: 0, satelliteX: -1, satelliteY: 0, ring: 1, path: 0, ghosts: .5 },
      { objectX: 22, objectY: -28, satelliteX: 14, satelliteY: -14, ring: 1, path: 1, ghosts: .28 },
      { objectX: 22, objectY: -28, satelliteX: 14, satelliteY: -14, ring: 1.2, path: 1, ghosts: .12 }
    ];
    setSequenceValues(states[scene]);
  }

  function setSequenceValues(values) {
    sequenceStage.style.setProperty("--object-x", `${values.objectX}%`);
    sequenceStage.style.setProperty("--object-y", `${values.objectY}%`);
    sequenceStage.style.setProperty("--satellite-x", `${values.satelliteX}%`);
    sequenceStage.style.setProperty("--satellite-y", `${values.satelliteY}%`);
    sequenceStage.style.setProperty("--ring-scale", String(values.ring));
    sequenceStage.style.setProperty("--path-progress", String(values.path));
    sequenceStage.style.setProperty("--ghost-opacity", String(values.ghosts));
  }

  function measureLab() {
    if (!scrollLab) return;
    const rect = scrollLab.getBoundingClientRect();
    labMetrics = {
      top: window.scrollY + rect.top,
      range: Math.max(1, scrollLab.offsetHeight - window.innerHeight)
    };
  }

  function calculateScrollProgress() {
    const pageRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pageProgress = Math.max(0, Math.min(1, window.scrollY / pageRange));
    scrollFill.style.transform = `scaleX(${pageProgress})`;
    scrollValue.textContent = String(Math.round(pageProgress * 100)).padStart(3, "0");
    header.classList.toggle("is-scrolled", window.scrollY > 12);

    if (motion === "reduced") {
      applyLabStatic(currentScene);
      return;
    }
    const labProgressValue = Math.max(0, Math.min(1, (window.scrollY - labMetrics.top) / labMetrics.range));
    applyLabProgress(labProgressValue);
  }

  function scheduleScrollUpdate() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      calculateScrollProgress();
    });
  }

  function resetPointer(immediate = false) {
    targetPointer = { x: 0, y: 0, rx: 0, ry: 0, readX: 50, readY: 50 };
    if (immediate) {
      appliedPointer = { x: 0, y: 0, rx: 0, ry: 0 };
      stage.style.setProperty("--pointer-x", "0px");
      stage.style.setProperty("--pointer-y", "0px");
      stage.style.setProperty("--pointer-rx", "0deg");
      stage.style.setProperty("--pointer-ry", "0deg");
      pointerX.textContent = "050";
      pointerY.textContent = "050";
    }
  }

  function flushPointer() {
    pointerFrame = 0;
    if (!isRunning()) return;
    const ratio = .14;
    appliedPointer.x += (targetPointer.x - appliedPointer.x) * ratio;
    appliedPointer.y += (targetPointer.y - appliedPointer.y) * ratio;
    appliedPointer.rx += (targetPointer.rx - appliedPointer.rx) * ratio;
    appliedPointer.ry += (targetPointer.ry - appliedPointer.ry) * ratio;
    stage.style.setProperty("--pointer-x", `${appliedPointer.x.toFixed(2)}px`);
    stage.style.setProperty("--pointer-y", `${appliedPointer.y.toFixed(2)}px`);
    stage.style.setProperty("--pointer-rx", `${appliedPointer.rx.toFixed(2)}deg`);
    stage.style.setProperty("--pointer-ry", `${appliedPointer.ry.toFixed(2)}deg`);
    pointerX.textContent = String(Math.round(targetPointer.readX)).padStart(3, "0");
    pointerY.textContent = String(Math.round(targetPointer.readY)).padStart(3, "0");

    const stillMoving = Math.abs(targetPointer.x - appliedPointer.x) > .08 || Math.abs(targetPointer.y - appliedPointer.y) > .08 || Math.abs(targetPointer.rx - appliedPointer.rx) > .02 || Math.abs(targetPointer.ry - appliedPointer.ry) > .02;
    if (stillMoving) pointerFrame = requestAnimationFrame(flushPointer);
  }

  function schedulePointer() {
    if (!pointerFrame) pointerFrame = requestAnimationFrame(flushPointer);
  }

  function onPointerMove(event) {
    if (!isRunning() || !finePointer.matches) return;
    const rect = stage.getBoundingClientRect();
    const normalizedX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
    const normalizedY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
    targetPointer = {
      x: normalizedX * 8,
      y: normalizedY * 6,
      rx: normalizedY * -2,
      ry: normalizedX * 2.5,
      readX: (normalizedX + 1) * 50,
      readY: (normalizedY + 1) * 50
    };
    window.clearTimeout(pointerReturnTimer);
    schedulePointer();
  }

  function onPointerLeave() {
    window.clearTimeout(pointerReturnTimer);
    pointerReturnTimer = window.setTimeout(() => {
      resetPointer();
      schedulePointer();
    }, 420);
  }

  function selectMode(nextMode) {
    currentMode = nextMode;
    modeStage.dataset.mode = nextMode;
    modeName.textContent = modeLabels[nextMode];
    modeButtons.forEach((button) => {
      const active = button.dataset.mode === nextMode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function onModeKeydown(event) {
    const currentIndex = modeButtons.indexOf(event.currentTarget);
    let nextIndex = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex + modeButtons.length - 1) % modeButtons.length;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % modeButtons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = modeButtons.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    modeButtons[nextIndex].focus();
    selectMode(modeButtons[nextIndex].dataset.mode);
  }

  function installRevealObserver() {
    if (!("IntersectionObserver" in window)) {
      showAllReveals();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .2 });
    revealNodes.forEach((node, index) => {
      node.style.transitionDelay = `${(index % 3) * 80}ms`;
      observer.observe(node);
    });
    if (finaleSun) observer.observe(finaleSun);
  }

  function installModeObserver() {
    if (!("IntersectionObserver" in window)) {
      modeStage.classList.add("is-in-viewport");
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      modeStage.classList.toggle("is-in-viewport", entry.isIntersecting);
    }, { threshold: .12 });
    observer.observe(modeStage);
  }

  function handlePreferenceChange(event) {
    setMotion(event.matches ? "reduced" : "paused");
  }

  function handleVisibilityChange() {
    isPageVisible = !document.hidden;
    body.classList.toggle("is-document-hidden", !isPageVisible);
    if (!isPageVisible) {
      stopClock();
      resetPointer(true);
      return;
    }
    syncClock();
    scheduleScrollUpdate();
  }

  function scrollToLab(event) {
    event.preventDefault();
    const behavior = motion === "running" ? "smooth" : "auto";
    scrollLab.scrollIntoView({ behavior, block: "start" });
  }

  updateMotionUI();
  root.classList.add("motion-ready");
  updateSceneVisibility(0, motion === "reduced");
  measureLab();
  installRevealObserver();
  installModeObserver();
  syncClock();

  if (motion === "running") requestAnimationFrame(finishHero);
  else {
    finishHero();
    showAllReveals();
  }

  motionToggle.addEventListener("click", () => setMotion(motion === "running" ? "paused" : "running"));
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", () => { measureLab(); scheduleScrollUpdate(); }, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);
  prefersReduced.addEventListener("change", handlePreferenceChange);
  stage.addEventListener("pointermove", onPointerMove, { passive: true });
  stage.addEventListener("pointerleave", onPointerLeave, { passive: true });
  entranceLink.addEventListener("click", scrollToLab);
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => selectMode(button.dataset.mode));
    button.addEventListener("keydown", onModeKeydown);
  });
  finePointer.addEventListener("change", () => resetPointer(true));
  window.addEventListener("load", () => { measureLab(); scheduleScrollUpdate(); }, { once: true });
  scheduleScrollUpdate();
})();
