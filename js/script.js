(function () {
  "use strict";

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------
     Gummy jar illustration — rendered into any
     [data-jar-color] element (phase cards, shop cards, quiz result)
  --------------------------------------------------------- */
  function jarSvg(color, label) {
    var safeLabel = (label || "").toString().toUpperCase();
    return (
      '<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="60" cy="151" rx="36" ry="6" fill="#1E3226" opacity=".12"/>' +
      '<rect x="24" y="16" width="72" height="28" rx="12" fill="' + color + '"/>' +
      '<rect x="24" y="16" width="72" height="9" rx="6" fill="#fff" opacity=".2"/>' +
      '<rect x="34" y="38" width="52" height="16" rx="4" fill="' + color + '"/>' +
      '<rect x="14" y="50" width="92" height="96" rx="20" fill="#FBF8F1" stroke="' + color + '" stroke-width="2.5"/>' +
      '<circle cx="34" cy="122" r="9" fill="' + color + '"/>' +
      '<circle cx="52" cy="133" r="8" fill="' + color + '" opacity=".55"/>' +
      '<circle cx="71" cy="121" r="9" fill="' + color + '" opacity=".8"/>' +
      '<circle cx="87" cy="131" r="7" fill="' + color + '" opacity=".45"/>' +
      '<circle cx="61" cy="108" r="7" fill="' + color + '" opacity=".65"/>' +
      '<rect x="20" y="62" width="80" height="44" rx="10" fill="#FFFFFF" stroke="rgba(30,50,38,.08)"/>' +
      '<text x="60" y="83" text-anchor="middle" font-family="Fraunces, serif" font-size="16" font-weight="600" fill="#2F4A38">elateve</text>' +
      '<text x="60" y="98" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" letter-spacing="1.5" font-weight="700" fill="' + color + '">' + safeLabel + '</text>' +
      '</svg>'
    );
  }

  function renderJars(root) {
    (root || document).querySelectorAll("[data-jar-color]").forEach(function (el) {
      el.innerHTML = jarSvg(el.getAttribute("data-jar-color"), el.getAttribute("data-jar-label"));
    });
  }
  renderJars();

  /* ---------------------------------------------------------
     Phase / decade data — mirrors the cards in #decades and #shop
  --------------------------------------------------------- */
  var PHASES = {
    flow: {
      num: "Flow", era: "20s", name: "Flow", stage: "Active cycle · ages 18–35", color: "#4B6A4F",
      desc: "Cycle regularity, steady energy, and hormonal balance through your most active reproductive years.",
      actives: "Myo-Inositol, Folate, Zinc, KSM-66® Ashwagandha"
    },
    bloom: {
      num: "Bloom", era: "Bloom", name: "Bloom", stage: "The maternal window", color: "#8FA662",
      desc: "Nourishment built for pregnancy and postpartum, in whichever decade it finds you — for both of you.",
      actives: "Choline, Iron Bisglycinate, Algal DHA"
    },
    thrive: {
      num: "Thrive", era: "30s", name: "Thrive", stage: "Burnout recovery", color: "#5C8B86",
      desc: "For the season when you're running everyone else's life on empty. Energy and stress recovery, rebuilt from the inside.",
      actives: "CoQ10, Magnesium Glycinate, Rhodiola"
    },
    shift: {
      num: "Shift", era: "40s", name: "Shift", stage: "Perimenopause · ages 40–50", color: "#B97D62",
      desc: "Support through the hormonal swings, hot flashes, and mood shifts of the transition.",
      actives: "Black Cohosh, Vitex, Affron® Saffron"
    },
    wisdom: {
      num: "Wisdom", era: "50s+", name: "Wisdom", stage: "Post-menopause · 50+", color: "#A9895F",
      desc: "Bone density, cognitive clarity, and vitality for the chapter after menopause.",
      actives: "Calcium Hydroxyapatite, Maca, Lion's Mane"
    }
  };

  var PRIORITY_LABELS = {
    energy: "energy & stress resilience",
    hormones: "hormone & cycle balance",
    sleep: "sleep & mood",
    fertility: "fertility & maternal health",
    longevity: "bone, brain & long-term vitality"
  };

  /* ---------------------------------------------------------
     Quiz modal
  --------------------------------------------------------- */
  var quizModal = document.getElementById("quizModal");
  var quizProgressBar = document.getElementById("quizProgressBar");
  var quizSteps = quizModal ? Array.prototype.slice.call(quizModal.querySelectorAll(".quiz-step")) : [];
  var answers = { stage: null, age: null, priority: null };
  var stepOrder = ["0", "1", "2", "3", "result"];
  var currentStepIndex = 0;
  var lastFocusedEl = null;

  function showStep(index) {
    currentStepIndex = index;
    var key = stepOrder[index];
    quizSteps.forEach(function (step) {
      step.hidden = step.getAttribute("data-step") !== key;
    });
    var pct = (index / (stepOrder.length - 1)) * 100;
    if (quizProgressBar) quizProgressBar.style.width = pct + "%";
    var visible = quizModal.querySelector('.quiz-step:not([hidden])');
    if (visible) {
      var heading = visible.querySelector("h2");
      if (heading) heading.setAttribute("tabindex", "-1"), heading.focus();
    }
  }

  function openQuiz() {
    if (!quizModal) return;
    lastFocusedEl = document.activeElement;
    quizModal.hidden = false;
    document.body.style.overflow = "hidden";
    answers = { stage: null, age: null, priority: null };
    clearSelections();
    showStep(0);
    dismissPopup(true);
  }

  function closeQuiz() {
    if (!quizModal) return;
    quizModal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedEl && lastFocusedEl.focus) lastFocusedEl.focus();
  }

  function clearSelections() {
    quizModal.querySelectorAll(".quiz-option").forEach(function (btn) {
      btn.classList.remove("selected");
    });
  }

  function computeResult() {
    var phase = PHASES[answers.stage] || PHASES.flow;
    document.getElementById("quizResultPhaseNum").textContent = "Your decade: " + phase.era;
    document.getElementById("quizResultName").textContent = phase.name;
    document.getElementById("quizResultStage").textContent = phase.stage;
    document.getElementById("quizResultPouch").innerHTML = jarSvg(phase.color, phase.era);

    var desc = phase.desc;
    if (answers.priority && PRIORITY_LABELS[answers.priority]) {
      desc += " You told us " + PRIORITY_LABELS[answers.priority] + " matters most right now — that's exactly what this gummy is built around.";
    }
    document.getElementById("quizResultDesc").textContent = desc;
    document.getElementById("quizResultActives").innerHTML = "<strong>In every gummy:</strong> " + phase.actives;

    var resultCard = document.getElementById("quizResultCard");
    if (resultCard) resultCard.style.setProperty("--phase-color", phase.color);

    try {
      sessionStorage.setItem("elateve_phase_result", answers.stage);
    } catch (e) { /* storage unavailable — non-critical */ }
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-open-quiz]")) {
      e.preventDefault();
      openQuiz();
    }
    if (e.target.closest("[data-close-quiz]")) {
      e.preventDefault();
      closeQuiz();
    }
    if (e.target.closest("[data-quiz-next]")) {
      showStep(1);
    }
    if (e.target.closest("[data-quiz-restart]")) {
      answers = { stage: null, age: null, priority: null };
      clearSelections();
      showStep(0);
    }

    var optionBtn = e.target.closest(".quiz-option");
    if (optionBtn) {
      var group = optionBtn.closest(".quiz-options");
      var question = group.getAttribute("data-quiz-question");
      group.querySelectorAll(".quiz-option").forEach(function (b) { b.classList.remove("selected"); });
      optionBtn.classList.add("selected");
      answers[question] = optionBtn.getAttribute("data-value");

      setTimeout(function () {
        if (question === "stage") showStep(2);
        else if (question === "age") showStep(3);
        else if (question === "priority") {
          computeResult();
          showStep(4);
        }
      }, 220);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && quizModal && !quizModal.hidden) closeQuiz();
  });

  /* ---------------------------------------------------------
     Quiz popup teaser — once per session, after a short delay
  --------------------------------------------------------- */
  var quizPopup = document.getElementById("quizPopup");
  var quizPopupClose = document.getElementById("quizPopupClose");

  function dismissPopup(persist) {
    if (!quizPopup) return;
    quizPopup.hidden = true;
    if (persist) {
      try { sessionStorage.setItem("elateve_popup_dismissed", "1"); } catch (e) { /* ignore */ }
    }
  }

  if (quizPopup) {
    var alreadyDismissed = false;
    try { alreadyDismissed = sessionStorage.getItem("elateve_popup_dismissed") === "1"; } catch (e) { /* ignore */ }

    if (!alreadyDismissed) {
      setTimeout(function () {
        if (quizModal && !quizModal.hidden) return;
        quizPopup.hidden = false;
      }, 8000);
    }
    if (quizPopupClose) {
      quizPopupClose.addEventListener("click", function () { dismissPopup(true); });
    }
  }

  /* ---------------------------------------------------------
     Waitlist form (client-side only — no backend yet)
  --------------------------------------------------------- */
  var waitlistForm = document.getElementById("waitlistForm");
  var waitlistNote = document.getElementById("waitlistNote");
  if (waitlistForm) {
    waitlistForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("waitlistEmail").value.trim();
      if (!email) return;
      waitlistNote.textContent = "You're on the list! We'll email " + email + " the moment Elateve launches.";
      waitlistForm.reset();
    });
  }
})();
