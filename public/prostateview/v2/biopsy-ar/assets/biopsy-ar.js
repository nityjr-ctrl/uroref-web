const MODULES = {
  glandStage: "/prostateview/_astro/glandStage.CEGJ-wRY.js",
  lesionFrame: "/prostateview/_astro/lesionFrame.Dh22Jo2_.js",
  spatialTransition: "/prostateview/_astro/spatial-transition.CdxB1SFX.js",
  threeCore: "/prostateview/_astro/three.core.DhAoym26.js",
  modelViewer: "/prostateview/_astro/model-viewer.BIyK99QN.js",
};

const zoneOrder = [
  "left-anterior",
  "left-mid",
  "left-posterior",
  "right-anterior",
  "right-mid",
  "right-posterior",
];

const zoneLabels = {
  "left-anterior": "L-ant",
  "left-mid": "L-mid",
  "left-posterior": "L-post",
  "right-anterior": "R-ant",
  "right-mid": "R-mid",
  "right-posterior": "R-post",
};

const phaseLabels = [
  "Preparation",
  "Skin local",
  "Probe",
  "Identification",
  "Block",
  "Sampling",
];

function qs(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`Biopsy simulator missing ${selector}`);
  return element;
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function labelLevelFromDepth(depth) {
  if (depth >= 0.67) return "base";
  if (depth <= 0.33) return "apex";
  return "mid";
}

function levelCopy(level) {
  return level === "mid" ? "mid-gland" : level;
}

function depthToZ(depth, gland) {
  return (1 - depth * 2) * gland.RZ;
}

function normaliseSide(side) {
  return side === "right" ? "right" : "left";
}

function normaliseAp(ap) {
  if (ap === "anterior" || ap === "posterior" || ap === "mid") return ap;
  return "mid";
}

function deriveTargetSextant(record) {
  if (record.targetSextant && zoneOrder.includes(record.targetSextant)) return record.targetSextant;
  const side = normaliseSide(record.target?.side);
  const ap = normaliseAp(record.target?.ap);
  return `${side}-${ap}`;
}

function zoneParts(zone) {
  const [side, ap] = zone.split("-");
  return { side, ap };
}

function buildSamplingPlan(caseRecord, sampling) {
  const targetZone = deriveTargetSextant(caseRecord);
  const orderedZones = [targetZone, ...zoneOrder.filter((zone) => zone !== targetZone)];
  const quotas = new Map();
  for (const zone of zoneOrder) {
    quotas.set(zone, zone === targetZone ? sampling.targetCores : sampling.systematicCores);
  }
  return { targetZone, orderedZones, quotas };
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function axialPointForZone(zone, jitter = 0) {
  const { side, ap } = zoneParts(zone);
  const xBase = side === "left" ? 82 : 38;
  const yBase = ap === "anterior" ? 39 : ap === "posterior" ? 83 : 61;
  const offset = ((jitter % 4) - 1.5) * 3.4;
  return { x: xBase + offset, y: yBase + ((jitter % 3) - 1) * 2.4 };
}

function sagPointForZone(zone, depth, jitter = 0) {
  const { ap } = zoneParts(zone);
  const x = 34 + (1 - depth) * 118 + ((jitter % 3) - 1) * 3;
  const y = ap === "anterior" ? 45 : ap === "posterior" ? 88 : 67;
  return { x, y: y + ((jitter % 4) - 1.5) * 2 };
}

function sectorPath(zone) {
  const { side, ap } = zoneParts(zone);
  const x0 = side === "left" ? 60 : 17;
  const x1 = side === "left" ? 103 : 60;
  const y0 = ap === "anterior" ? 24 : ap === "posterior" ? 65 : 48;
  const y1 = ap === "anterior" ? 56 : ap === "posterior" ? 97 : 72;
  const cx = side === "left" ? 82 : 38;
  const cy = ap === "anterior" ? 39 : ap === "posterior" ? 83 : 60;
  return `M60 60 L${x0} ${y0} Q${cx} ${cy} ${x1} ${y0} L${x1} ${y1} Q${cx} ${cy} ${x0} ${y1} Z`;
}

function bindAccessibilityPanel() {
  const button = document.querySelector("[data-a11y-toggle]");
  const panel = document.querySelector("[data-a11y-panel]");
  if (!button || !panel) return;

  const syncInputs = () => {
    panel.querySelectorAll("[data-a11y]").forEach((input) => {
      input.checked = localStorage.getItem(`pv-a11y-${input.dataset.a11y}`) === "1";
    });
  };

  button.addEventListener("click", () => {
    const next = panel.hidden;
    panel.hidden = !next;
    button.setAttribute("aria-expanded", String(next));
    syncInputs();
  });

  panel.querySelectorAll("[data-theme-set]").forEach((themeButton) => {
    themeButton.addEventListener("click", () => {
      const theme = themeButton.dataset.themeSet;
      document.documentElement.classList.toggle("light", theme === "light");
      document.documentElement.classList.toggle("reading", theme === "reading");
      if (theme === "dark") localStorage.removeItem("pv-theme");
      else localStorage.setItem("pv-theme", theme);
    });
  });

  panel.querySelectorAll("[data-a11y]").forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.dataset.a11y;
      document.documentElement.classList.toggle(`a11y-${key}`, input.checked);
      localStorage.setItem(`pv-a11y-${key}`, input.checked ? "1" : "0");
    });
  });

  syncInputs();
}

class BiopsySimulator {
  constructor(root, data, modules) {
    this.root = root;
    this.data = data;
    this.modules = modules;
    this.caseRecord = data.case;
    this.technique = "tp";
    this.stepIndex = 0;
    this.depth = 0.3;
    this.visible = true;
    this.inView = true;
    this.dirty = true;
    this.disposed = false;
    this.frame = 0;
    this.autoTimer = 0;
    this.draggingProbe = false;
    this.lastPointerY = 0;
    this.abort = new AbortController();
    this.resizeObserver = null;
    this.viewportObserver = null;
    this.mutationObserver = null;
    this.toggles = {
      grid: true,
      needle: true,
      cores: true,
      labels: true,
      clock: true,
    };
    this.plan = buildSamplingPlan(this.caseRecord, data.sampling);
    this.counts = new Map(zoneOrder.map((zone) => [zone, 0]));
    this.cores = [];
    this.meshes = {};

    this.three = modules.three;
    this.glandStage = modules.glandStage;
    this.lesionFrame = modules.lesionFrame;
    this.transition = modules.transition;
    this.stage = null;

    this.canvas = qs(root, "[data-biopsy-canvas]");
    this.stageElement = qs(root, "[data-biopsy-stage]");
    this.loading = qs(root, "[data-biopsy-loading]");
    this.status = qs(root, "[data-biopsy-status]");
    this.slider = qs(root, "[data-probe-slider]");
    this.probeOutput = qs(root, "[data-probe-output]");
    this.techniqueLabel = qs(root, "[data-biopsy-technique-label]");
    this.techniqueName = qs(root, "[data-technique-name]");
    this.stepCounter = qs(root, "[data-step-counter]");
    this.stepPhase = qs(root, "[data-step-phase]");
    this.stepTitle = qs(root, "[data-step-title]");
    this.stepObjective = qs(root, "[data-step-objective]");
    this.stepSafety = qs(root, "[data-step-safety]");
    this.stepError = qs(root, "[data-step-error]");
    this.progressRail = qs(root, "[data-progress-rail]");
    this.prevButton = qs(root, "[data-prev-step]");
    this.autoButton = qs(root, "[data-auto-step]");
    this.nextButton = qs(root, "[data-next-step]");
    this.resetButton = qs(root, "[data-reset-step]");
    this.samplingCard = qs(root, "[data-sampling-card]");
    this.zoneChips = qs(root, "[data-zone-chips]");
    this.totalCounter = qs(root, "[data-total-counter]");
    this.samplingPrompt = qs(root, "[data-sampling-prompt]");
    this.takeCoreButton = qs(root, "[data-take-core]");
    this.samplingSummary = qs(root, "[data-sampling-summary]");
    this.sourceFooter = qs(root, "[data-source-footer]");
    this.axialLevel = qs(root, "[data-axial-level]");
    this.axialImg = qs(root, "[data-axial-img]");
    this.axialSector = qs(root, "[data-axial-sector]");
    this.axialLesion = qs(root, "[data-axial-lesion]");
    this.axialCores = qs(root, "[data-axial-cores]");
    this.sagSourceLabel = qs(root, "[data-sag-source-label]");
    this.sagDepth = qs(root, "[data-sag-depth]");
    this.sagProbe = qs(root, "[data-sag-probe]");
    this.sagNeedle = qs(root, "[data-sag-needle]");
    this.sagLesion = qs(root, "[data-sag-lesion]");
    this.sagCores = qs(root, "[data-sag-cores]");
    this.clockOverlay = qs(root, "[data-clock-overlay]");
    this.introCountdown = qs(root, "[data-intro-countdown]");

    this.bind();
    this.setupStage();
    this.applyCaseAssets();
    this.renderProgress();
    this.renderStep();
    this.renderSampling();
    this.updateProbeDepth(this.depth);
    this.loading.hidden = true;
    this.sourceFooter.textContent = data.sourceFooter;
    this.frame = requestAnimationFrame((time) => this.tick(time));
    this.playIntro();
    window.__biopsyDebug = {
      plan: () => this.debugPlan(),
      state: () => this.debugState(),
      takeCore: () => this.takeCore(),
      goToStep: (index) => this.goToStep(index),
      setDepth: (value) => this.updateProbeDepth(value),
    };
  }

  get steps() {
    return this.data.techniques[this.technique].steps;
  }

  get currentStep() {
    return this.steps[this.stepIndex];
  }

  get reducedMotion() {
    return this.transition.reducedMotion();
  }

  bind() {
    const signal = this.abort.signal;
    this.slider.addEventListener("input", () => {
      this.updateProbeDepth(Number(this.slider.value) / 1000);
    }, { signal });

    this.canvas.addEventListener("pointerdown", (event) => {
      this.draggingProbe = true;
      this.lastPointerY = event.clientY;
      this.canvas.setPointerCapture(event.pointerId);
    }, { signal });

    this.canvas.addEventListener("pointermove", (event) => {
      if (!this.draggingProbe) return;
      const delta = this.lastPointerY - event.clientY;
      this.lastPointerY = event.clientY;
      this.updateProbeDepth(this.depth + delta / 360);
    }, { signal });

    const endDrag = (event) => {
      this.draggingProbe = false;
      if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    };
    this.canvas.addEventListener("pointerup", endDrag, { signal });
    this.canvas.addEventListener("pointercancel", endDrag, { signal });

    this.prevButton.addEventListener("click", () => this.previousStep(), { signal });
    this.nextButton.addEventListener("click", () => this.nextStep(), { signal });
    this.resetButton.addEventListener("click", () => this.reset(), { signal });
    this.autoButton.addEventListener("click", () => this.toggleAuto(), { signal });
    this.takeCoreButton.addEventListener("click", () => this.takeCore(), { signal });

    this.root.querySelectorAll("[data-technique]").forEach((button) => {
      button.addEventListener("click", () => this.setTechnique(button.dataset.technique), { signal });
    });

    this.root.querySelectorAll("[data-toggle]").forEach((button) => {
      button.addEventListener("click", () => this.toggleOverlay(button.dataset.toggle, button), { signal });
    });

    document.addEventListener("visibilitychange", () => {
      this.visible = !document.hidden;
      this.requestRender();
    }, { signal });

    window.addEventListener("pagehide", () => this.destroy(), { signal });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.stageElement);

    if ("IntersectionObserver" in window) {
      this.viewportObserver = new IntersectionObserver((entries) => {
        this.inView = entries.some((entry) => entry.isIntersecting);
        this.requestRender();
      }, { rootMargin: "120px" });
      this.viewportObserver.observe(this.root);
    }

    this.mutationObserver = new MutationObserver(() => this.applyAccessibility());
    this.mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }

  setupStage() {
    const createStage = this.glandStage.createStage;
    const GLAND = this.glandStage.GLAND;
    const T = this.three;
    this.stage = createStage(this.canvas);
    this.stage.group.rotation.set(0, 0, 0);
    this.stage.camera.position.set(0, GLAND.RY * 0.36, GLAND.RZ * 3.65);
    this.stage.camera.lookAt(0, 0, 0);
    this.stage.setLesion(this.caseRecord.target);
    this.stage.setLabelsVisible(true);

    const Group = T.Group;
    const Mesh = T.Mesh;
    const MeshBasicMaterial = T.MeshBasicMaterial;
    const MeshStandardMaterial = T.MeshStandardMaterial;
    const CylinderGeometry = T.CylinderGeometry;
    const SphereGeometry = T.SphereGeometry;
    const TorusGeometry = T.TorusGeometry;
    const DoubleSide = T.DoubleSide;

    this.meshes.overlayGroup = new Group();
    this.meshes.overlayGroup.name = "biopsy_teaching_overlays";
    this.stage.group.add(this.meshes.overlayGroup);

    this.meshes.gridGroup = new Group();
    this.meshes.gridGroup.name = "six_sextant_grid_overlay";
    this.meshes.overlayGroup.add(this.meshes.gridGroup);

    const zoneMaterial = new MeshBasicMaterial({
      color: "#55d7df",
      transparent: true,
      opacity: 0.44,
      side: DoubleSide,
      depthWrite: false,
    });
    const targetMaterial = new MeshBasicMaterial({
      color: "#e2aa4d",
      transparent: true,
      opacity: 0.68,
      side: DoubleSide,
      depthWrite: false,
    });
    const ringGeometry = new TorusGeometry(0.32, 0.008, 8, 38);
    for (const zone of zoneOrder) {
      const point = this.zonePoint3D(zone, 0.5);
      const ring = new Mesh(ringGeometry, zone === this.plan.targetZone ? targetMaterial : zoneMaterial);
      ring.name = `sextant_${zone}`;
      ring.position.set(point.x, point.y, 0);
      ring.scale.set(zone.includes("mid") ? 0.95 : 0.82, zone.includes("mid") ? 0.72 : 0.58, 1);
      ring.userData.zone = zone;
      this.meshes.gridGroup.add(ring);
    }

    this.meshes.probeGroup = new Group();
    this.meshes.probeGroup.name = "schematic_probe_and_needle";
    this.meshes.overlayGroup.add(this.meshes.probeGroup);

    const probeMat = new MeshStandardMaterial({
      color: "#e8f2f1",
      roughness: 0.34,
      metalness: 0.12,
      transparent: true,
      opacity: 0.78,
    });
    this.meshes.probeShaft = new Mesh(new CylinderGeometry(0.055, 0.055, 1, 18), probeMat);
    this.meshes.probeShaft.name = "trus_probe_shaft_depth_control";
    this.meshes.probeShaft.rotation.x = Math.PI / 2;
    this.meshes.probeGroup.add(this.meshes.probeShaft);

    this.meshes.probeTip = new Mesh(new SphereGeometry(0.115, 22, 16), new MeshStandardMaterial({
      color: "#55d7df",
      emissive: "#12383a",
      emissiveIntensity: 0.7,
      roughness: 0.3,
    }));
    this.meshes.probeTip.name = "trus_probe_tip";
    this.meshes.probeGroup.add(this.meshes.probeTip);

    this.meshes.needle = new Mesh(new CylinderGeometry(0.016, 0.016, 1, 10), new MeshStandardMaterial({
      color: "#e2aa4d",
      emissive: "#3a2608",
      emissiveIntensity: 0.48,
      roughness: 0.25,
    }));
    this.meshes.needle.name = "schematic_needle_path";
    this.meshes.probeGroup.add(this.meshes.needle);

    this.meshes.blockGroup = new Group();
    this.meshes.blockGroup.name = "bilateral_periprostatic_block_markers";
    this.meshes.overlayGroup.add(this.meshes.blockGroup);
    const blockMaterial = new MeshBasicMaterial({
      color: "#8db7ff",
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    });
    for (const x of [-GLAND.RX * 0.58, GLAND.RX * 0.58]) {
      const block = new Mesh(new SphereGeometry(0.18, 18, 12), blockMaterial);
      block.position.set(x, -GLAND.RY * 0.88, 0.1);
      block.name = x < 0 ? "right_periprostatic_block" : "left_periprostatic_block";
      this.meshes.blockGroup.add(block);
    }
    this.meshes.blockGroup.visible = false;

    this.meshes.coreGroup = new Group();
    this.meshes.coreGroup.name = "biopsy_core_tracks";
    this.meshes.overlayGroup.add(this.meshes.coreGroup);

    this.applyAccessibility();
    this.resize();
  }

  applyCaseAssets() {
    const assets = this.caseRecord.assets;
    this.axialImg.src = assets.mriAxial || assets.mriSource;
    this.sagSourceLabel.textContent = assets.mriSagittal ? "sagittal source" : "schematic, not a source image";
    const axialPoint = this.lesionFrame.targetToAxial(this.caseRecord.target);
    this.axialLesion.setAttribute("cx", String(axialPoint.x));
    this.axialLesion.setAttribute("cy", String(axialPoint.y));
    const sagPoint = sagPointForZone(this.plan.targetZone, this.depth, 1);
    this.sagLesion.setAttribute("cx", String(sagPoint.x));
    this.sagLesion.setAttribute("cy", String(sagPoint.y));
  }

  applyAccessibility() {
    if (!this.stage) return;
    this.stage.setLabelsVisible(this.toggles.labels);
    if (this.reducedMotion) this.stopAuto();
    this.autoButton.disabled = this.reducedMotion;
    this.autoButton.title = this.reducedMotion ? "Less motion is on" : "";
    this.requestRender();
  }

  playIntro() {
    if (!this.stage || this.reducedMotion) {
      this.status.textContent = "Probe ready. Move out for apex, in for base.";
      return;
    }
    const Vector3 = this.three.Vector3;
    const camera = this.stage.camera;
    const toPosition = camera.position.clone();
    const fromPosition = new Vector3(0, 0, toPosition.length() * 0.72);
    camera.position.copy(fromPosition);
    camera.lookAt(0, 0, 0);
    this.status.textContent = "Read the flat gland. Lifting into 3D.";
    this.cancelIntro = this.transition.countdown(this.introCountdown, {
      values: ["2D", "3D"],
      stepMs: 360,
      signal: this.abort.signal,
      onComplete: () => {
        this.cancelIntro = this.transition.tweenCamera({
          camera,
          fromPosition,
          toPosition,
          durationMs: 900,
          signal: this.abort.signal,
          onUpdate: () => this.requestRender(),
          onComplete: () => {
            this.status.textContent = "Probe ready. Move out for apex, in for base.";
            this.requestRender();
          },
        });
      },
    });
  }

  resize() {
    if (!this.stage) return;
    const rect = this.stageElement.getBoundingClientRect();
    this.stage.resize(rect.width, rect.height);
    this.requestRender();
  }

  requestRender() {
    this.dirty = true;
  }

  tick() {
    if (this.disposed) return;
    this.frame = requestAnimationFrame((time) => this.tick(time));
    if (!this.visible || !this.inView || !this.stage) return;
    if (!this.dirty && !this.draggingProbe) return;
    this.stage.render();
    this.dirty = false;
  }

  setTechnique(technique) {
    if (!this.data.techniques[technique] || technique === this.technique) return;
    this.stopAuto();
    this.technique = technique;
    this.stepIndex = 0;
    this.root.querySelectorAll("[data-technique]").forEach((button) => {
      const active = button.dataset.technique === technique;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    this.techniqueName.textContent = this.data.techniques[technique].label;
    this.techniqueLabel.textContent = this.data.techniques[technique].label;
    this.renderStep();
    this.status.textContent = technique === "tp" ? "Transperineal under local anaesthetic selected." : "Light TRUS variant selected.";
    this.requestRender();
  }

  previousStep() {
    this.stopAuto();
    this.goToStep(this.stepIndex - 1);
  }

  nextStep() {
    if (this.stepIndex >= this.steps.length - 1) {
      this.reset();
      return;
    }
    this.goToStep(this.stepIndex + 1);
  }

  goToStep(index) {
    this.stepIndex = clamp(index, 0, this.steps.length - 1);
    this.renderStep();
    this.status.textContent = `${this.currentStep.title} ${this.currentStep.objective}`;
    this.requestRender();
  }

  renderStep() {
    const step = this.currentStep;
    this.stepCounter.textContent = `Step ${this.stepIndex + 1} of ${this.steps.length}`;
    this.stepPhase.textContent = phaseLabels[this.stepIndex] || "Teaching";
    this.stepTitle.textContent = step.title;
    this.stepObjective.textContent = step.objective;
    this.stepSafety.textContent = step.safety;
    this.stepError.textContent = step.commonError;
    this.prevButton.disabled = this.stepIndex === 0;
    this.nextButton.textContent = this.stepIndex >= this.steps.length - 1 ? "Restart" : "Next";
    this.samplingCard.hidden = this.stepIndex !== 5;
    if (this.meshes.blockGroup) this.meshes.blockGroup.visible = this.stepIndex >= 4;
    this.renderProgress();
    this.renderSampling();
    this.updateNeedle();
  }

  renderProgress() {
    this.progressRail.replaceChildren();
    for (let index = 0; index < this.steps.length; index += 1) {
      const dot = document.createElement("span");
      dot.className = "biopsy-progress-dot";
      if (index < this.stepIndex) dot.classList.add("is-done");
      if (index === this.stepIndex) dot.classList.add("is-current");
      dot.setAttribute("aria-label", `Step ${index + 1}: ${this.steps[index].title}`);
      this.progressRail.append(dot);
    }
  }

  reset() {
    this.stopAuto();
    this.stepIndex = 0;
    this.depth = 0.3;
    this.slider.value = "300";
    this.counts = new Map(zoneOrder.map((zone) => [zone, 0]));
    this.cores = [];
    this.clearCoreMeshes();
    this.axialCores.replaceChildren();
    this.sagCores.replaceChildren();
    this.samplingSummary.hidden = true;
    this.renderStep();
    this.updateProbeDepth(this.depth);
    this.status.textContent = "Walkthrough reset. Probe at the apex-side sweep.";
  }

  toggleAuto() {
    if (this.reducedMotion) {
      this.status.textContent = "Less motion is on. Auto-play is disabled.";
      return;
    }
    if (this.autoTimer) {
      this.stopAuto();
      return;
    }
    this.autoButton.textContent = "Pause";
    this.autoButton.setAttribute("aria-pressed", "true");
    this.status.textContent = "Auto-play running.";
    this.scheduleAuto();
  }

  scheduleAuto() {
    window.clearTimeout(this.autoTimer);
    this.autoTimer = window.setTimeout(() => {
      this.autoTimer = 0;
      if (this.stepIndex >= this.steps.length - 1) {
        this.stopAuto();
        return;
      }
      this.goToStep(this.stepIndex + 1);
      this.scheduleAuto();
    }, 2300);
  }

  stopAuto() {
    window.clearTimeout(this.autoTimer);
    this.autoTimer = 0;
    this.autoButton.textContent = "Auto-play";
    this.autoButton.setAttribute("aria-pressed", "false");
  }

  toggleOverlay(name, button) {
    this.toggles[name] = !this.toggles[name];
    button.classList.toggle("is-active", this.toggles[name]);
    button.setAttribute("aria-pressed", String(this.toggles[name]));
    if (name === "grid" && this.meshes.gridGroup) this.meshes.gridGroup.visible = this.toggles.grid;
    if (name === "needle" && this.meshes.needle) this.meshes.needle.visible = this.toggles.needle;
    if (name === "cores" && this.meshes.coreGroup) {
      this.meshes.coreGroup.visible = this.toggles.cores;
      this.axialCores.hidden = !this.toggles.cores;
      this.sagCores.hidden = !this.toggles.cores;
    }
    if (name === "labels" && this.stage) this.stage.setLabelsVisible(this.toggles.labels);
    if (name === "clock") this.clockOverlay.hidden = !this.toggles.clock;
    this.requestRender();
  }

  updateProbeDepth(value) {
    this.depth = clamp(Number(value));
    this.slider.value = String(Math.round(this.depth * 1000));
    const level = labelLevelFromDepth(this.depth);
    this.axialLevel.textContent = level.toUpperCase();
    this.probeOutput.value = `${levelCopy(level)} level, ${this.depth < 0.5 ? "probe out" : "probe in"}`;
    this.probeOutput.textContent = this.probeOutput.value;
    this.axialSector.setAttribute("d", sectorPath(this.activeZone() || this.plan.targetZone));
    this.updateStageProbe();
    this.updateSagittal();
    this.updateNeedle();
    this.requestRender();
  }

  updateStageProbe() {
    if (!this.stage || !this.meshes.probeShaft) return;
    const GLAND = this.glandStage.GLAND;
    const tipZ = depthToZ(this.depth, GLAND);
    const entryZ = GLAND.RZ + 1.18;
    const length = Math.max(0.1, entryZ - tipZ);
    const probeY = -GLAND.RY * 0.92;
    this.meshes.probeShaft.position.set(0, probeY, (entryZ + tipZ) / 2);
    this.meshes.probeShaft.scale.set(1, length, 1);
    this.meshes.probeTip.position.set(0, probeY, tipZ);
  }

  updateSagittal() {
    const x = 34 + (1 - this.depth) * 118;
    this.sagDepth.setAttribute("x1", String(x));
    this.sagDepth.setAttribute("x2", String(x));
    this.sagProbe.setAttribute("x2", String(x));
    this.sagProbe.setAttribute("y2", String(78 - this.depth * 8));
  }

  updateNeedle() {
    if (!this.meshes.needle) return;
    const GLAND = this.glandStage.GLAND;
    const T = this.three;
    const activeZone = this.activeZone() || this.plan.targetZone;
    const zonePoint = this.zonePoint3D(activeZone, this.depth);
    const entry = new T.Vector3(zonePoint.x * 0.55, -GLAND.RY * 1.36, GLAND.RZ + 0.86);
    const target = new T.Vector3(zonePoint.x, zonePoint.y, depthToZ(this.depth, GLAND));
    this.positionCylinderBetween(this.meshes.needle, entry, target);

    const sagPoint = sagPointForZone(activeZone, this.depth, this.cores.length);
    this.sagNeedle.setAttribute("x2", String(sagPoint.x));
    this.sagNeedle.setAttribute("y2", String(sagPoint.y));
  }

  zonePoint3D(zone, depth) {
    const GLAND = this.glandStage.GLAND;
    const { side, ap } = zoneParts(zone);
    return {
      x: side === "left" ? GLAND.RX * 0.52 : -GLAND.RX * 0.52,
      y: ap === "anterior" ? GLAND.RY * 0.5 : ap === "posterior" ? -GLAND.RY * 0.62 : -GLAND.RY * 0.08,
      z: depthToZ(depth, GLAND),
    };
  }

  positionCylinderBetween(mesh, start, end) {
    const T = this.three;
    const direction = end.clone().sub(start);
    const length = Math.max(0.001, direction.length());
    mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
    mesh.scale.set(1, length, 1);
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), direction.normalize());
  }

  activeZone() {
    return this.plan.orderedZones.find((zone) => this.counts.get(zone) < this.plan.quotas.get(zone)) || null;
  }

  renderSampling() {
    const total = this.cores.length;
    this.totalCounter.textContent = `${total} / 14`;
    this.zoneChips.replaceChildren();
    const active = this.activeZone();
    for (const zone of zoneOrder) {
      const chip = document.createElement("div");
      chip.className = "biopsy-zone-chip";
      if (zone === active) chip.classList.add("is-active");
      if (this.counts.get(zone) >= this.plan.quotas.get(zone)) chip.classList.add("is-complete");
      chip.innerHTML = `<span>${zoneLabels[zone]}</span><strong>${this.counts.get(zone)}/${this.plan.quotas.get(zone)}</strong>`;
      this.zoneChips.append(chip);
    }

    if (!active) {
      this.takeCoreButton.disabled = true;
      this.samplingPrompt.textContent = "Sampling complete.";
      this.showSamplingSummary();
      return;
    }

    const isTarget = active === this.plan.targetZone;
    this.takeCoreButton.disabled = this.stepIndex !== 5;
    this.samplingPrompt.textContent = isTarget
      ? `Complete targeted cores in ${this.zoneCopy(active)} PZ first.`
      : `Targeted cores complete. Continue systematic cores in ${this.zoneCopy(active)} PZ.`;
  }

  takeCore() {
    if (this.stepIndex !== 5) {
      this.goToStep(5);
    }
    const zone = this.activeZone();
    if (!zone) {
      this.status.textContent = "The 14-core teaching plan is already complete.";
      return this.debugState();
    }
    const quota = this.plan.quotas.get(zone);
    const count = this.counts.get(zone);
    if (count >= quota) {
      this.status.textContent = `${this.zoneCopy(zone)} PZ quota is complete. Move to the next sextant.`;
      this.renderSampling();
      return this.debugState();
    }

    const type = zone === this.plan.targetZone ? "targeted" : "systematic";
    const core = {
      zone,
      type,
      depth: this.depth,
      index: this.cores.length + 1,
      zoneIndex: count + 1,
    };
    this.cores.push(core);
    this.counts.set(zone, count + 1);
    this.addCoreTrack(core);
    this.plotCoreOnMri(core);

    const next = this.activeZone();
    if (!next) {
      this.status.textContent = "Sampling complete. 14 cores taken with target and systematic coverage.";
    } else if (next !== zone) {
      this.status.textContent = `${this.zoneCopy(zone)} PZ quota met. Next: ${this.zoneCopy(next)} PZ.`;
    } else {
      this.status.textContent = `${type} core ${core.zoneIndex} recorded in ${this.zoneCopy(zone)} PZ.`;
    }
    this.renderSampling();
    this.requestRender();
    return this.debugState();
  }

  addCoreTrack(core) {
    if (!this.meshes.coreGroup) return;
    const T = this.three;
    const GLAND = this.glandStage.GLAND;
    const Mesh = T.Mesh;
    const CylinderGeometry = T.CylinderGeometry;
    const MeshBasicMaterial = T.MeshBasicMaterial;
    const point = this.zonePoint3D(core.zone, core.depth);
    const jitter = (core.zoneIndex - 1.5) * 0.065;
    const start = new T.Vector3(point.x * 0.5 + jitter, -GLAND.RY * 1.4, GLAND.RZ + 0.94);
    const end = new T.Vector3(point.x + jitter, point.y, point.z);
    const track = new Mesh(new CylinderGeometry(0.012, 0.012, 1, 8), new MeshBasicMaterial({
      color: core.type === "targeted" ? "#5ce0a5" : "#8db7ff",
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    }));
    track.name = `core_${core.index}_${core.zone}`;
    this.positionCylinderBetween(track, start, end);
    this.meshes.coreGroup.add(track);
  }

  plotCoreOnMri(core) {
    const axial = axialPointForZone(core.zone, core.zoneIndex + this.cores.length);
    const axialLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    axialLine.setAttribute("x1", String(axial.x - 10));
    axialLine.setAttribute("y1", String(axial.y + 10));
    axialLine.setAttribute("x2", String(axial.x + 10));
    axialLine.setAttribute("y2", String(axial.y - 10));
    axialLine.setAttribute("class", "biopsy-core-line");
    this.axialCores.append(axialLine);

    const axialDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    axialDot.setAttribute("cx", String(axial.x));
    axialDot.setAttribute("cy", String(axial.y));
    axialDot.setAttribute("r", "2.4");
    axialDot.setAttribute("class", "biopsy-core-dot");
    this.axialCores.append(axialDot);

    const sag = sagPointForZone(core.zone, core.depth, core.zoneIndex + this.cores.length);
    const sagLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    sagLine.setAttribute("x1", "154");
    sagLine.setAttribute("y1", "103");
    sagLine.setAttribute("x2", String(sag.x));
    sagLine.setAttribute("y2", String(sag.y));
    sagLine.setAttribute("class", "biopsy-core-line");
    this.sagCores.append(sagLine);
  }

  showSamplingSummary() {
    const left = [...this.counts.entries()]
      .filter(([zone]) => zone.startsWith("left"))
      .reduce((sum, [, count]) => sum + count, 0);
    const right = [...this.counts.entries()]
      .filter(([zone]) => zone.startsWith("right"))
      .reduce((sum, [, count]) => sum + count, 0);
    const breakdown = zoneOrder
      .map((zone) => `${zoneLabels[zone]} ${this.counts.get(zone)}/${this.plan.quotas.get(zone)}`)
      .join(", ");
    this.samplingSummary.hidden = false;
    this.samplingSummary.innerHTML = `<strong>Complete:</strong> 14 cores, target zone sampled 4 times, systematic coverage complete. ${left} left, ${right} right. ${escapeText(breakdown)}.`;
  }

  zoneCopy(zone) {
    const { side, ap } = zoneParts(zone);
    return `${side} ${ap}`;
  }

  clearCoreMeshes() {
    if (!this.meshes.coreGroup) return;
    while (this.meshes.coreGroup.children.length) {
      const child = this.meshes.coreGroup.children[0];
      this.meshes.coreGroup.remove(child);
      this.disposeObject(child);
    }
  }

  disposeObject(object) {
    object.traverse?.((child) => {
      if (child.geometry) child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : child.material ? [child.material] : [];
      for (const material of materials) {
        if (material.map) material.map.dispose();
        material.dispose();
      }
    });
  }

  debugPlan() {
    return zoneOrder.map((zone) => ({
      zone,
      cores: this.plan.quotas.get(zone),
      type: zone === this.plan.targetZone ? "targeted" : "systematic",
    }));
  }

  debugState() {
    return {
      technique: this.technique,
      stepIndex: this.stepIndex,
      depth: this.depth,
      targetSextant: this.plan.targetZone,
      total: this.cores.length,
      counts: Object.fromEntries(this.counts),
      plan: this.debugPlan(),
    };
  }

  destroy() {
    if (this.disposed) return;
    this.disposed = true;
    this.cancelIntro?.();
    window.clearTimeout(this.autoTimer);
    cancelAnimationFrame(this.frame);
    this.abort.abort();
    this.resizeObserver?.disconnect();
    this.viewportObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.stage?.dispose();
  }
}

async function loadSimulator(root) {
  if (root.dataset.biopsyMounted === "true") return;
  root.dataset.biopsyMounted = "true";
  const dataScript = qs(root, "[data-biopsy-data]");
  const data = JSON.parse(dataScript.textContent || "{}");
  const [glandStageModule, lesionFrameModule, transitionModule, threeModule] = await Promise.all([
    import(MODULES.glandStage),
    import(MODULES.lesionFrame),
    import(MODULES.spatialTransition),
    import(MODULES.threeCore),
  ]);
  const modules = {
    glandStage: {
      GLAND: glandStageModule.G,
      createStage: glandStageModule.c,
    },
    lesionFrame: {
      targetToAxial: lesionFrameModule.b,
      targetTo3D: lesionFrameModule.e,
      levelFraction: lesionFrameModule.s,
      labelTarget: lesionFrameModule.c,
    },
    transition: {
      reducedMotion: transitionModule.p,
      countdown: transitionModule.a,
      tweenCamera: transitionModule.r,
    },
    three: {
      Group: threeModule.am,
      Mesh: threeModule.b0,
      MeshBasicMaterial: threeModule.b1,
      MeshStandardMaterial: threeModule.b5,
      CylinderGeometry: threeModule.R,
      SphereGeometry: threeModule.cH,
      TorusGeometry: threeModule.cV,
      Vector3: threeModule.dd,
      DoubleSide: threeModule.$,
    },
  };
  return new BiopsySimulator(root, data, modules);
}

function lazyMountSimulators() {
  document.querySelectorAll("[data-biopsy-sim]").forEach((root) => {
    if (!("IntersectionObserver" in window)) {
      loadSimulator(root).catch((error) => {
        const status = root.querySelector("[data-biopsy-status]");
        if (status) status.textContent = "3D simulator could not load. Refresh or use the MRI panels.";
        console.error(error);
      });
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      loadSimulator(root).catch((error) => {
        const status = root.querySelector("[data-biopsy-status]");
        if (status) status.textContent = "3D simulator could not load. Refresh or use the MRI panels.";
        console.error(error);
      });
    }, { rootMargin: "260px" });
    observer.observe(root);
  });
}

function lazyLoadAr() {
  const block = document.querySelector("[data-biopsy-ar-block]");
  if (!block) return;
  const viewer = block.querySelector("model-viewer");
  const launch = block.querySelector("[data-ar-launch]");
  const status = block.querySelector("[data-ar-status]");
  const usdz = viewer?.getAttribute("ios-src") || "/prostateview/models/biopsy/anatomical-scaffold.usdz";
  let loaded = false;

  const load = async () => {
    if (loaded) return;
    loaded = true;
    try {
      await import(MODULES.modelViewer);
      if (status) status.textContent = "AR scaffold ready where supported.";
      viewer?.addEventListener("ar-status", (event) => {
        if (!status) return;
        if (event.detail.status === "failed") status.textContent = "AR unsupported in this browser. Use the iOS Quick Look link where available.";
        if (event.detail.status === "session-started") status.textContent = "AR session started.";
        if (event.detail.status === "not-presenting") status.textContent = "AR scaffold ready where supported.";
      });
    } catch (error) {
      if (status) status.textContent = "AR scaffold could not load in this browser.";
      console.error(error);
    }
  };

  launch?.addEventListener("click", async () => {
    await load();
    if (viewer && typeof viewer.activateAR === "function") {
      try {
        await viewer.activateAR();
        return;
      } catch (error) {
        if (status) status.textContent = "AR launch failed. Opening iOS Quick Look asset.";
      }
    }
    window.location.href = usdz;
  });

  if (!("IntersectionObserver" in window)) {
    load();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    load();
  }, { rootMargin: "320px" });
  observer.observe(block);
}

bindAccessibilityPanel();
lazyMountSimulators();
lazyLoadAr();
