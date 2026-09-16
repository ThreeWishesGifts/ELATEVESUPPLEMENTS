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
     Phase data — mirrors the cards in #phases
  --------------------------------------------------------- */
  var PHASES = {
    flow: {
      num: "Phase 01", name: "Flow", stage: "Active cycle · ages 18–35", color: "#4B6A4F",
      desc: "Cycle regularity, stress resilience, and hormonal balance through the reproductive years.",
      actives: "Myo-Inositol, Folate, Zinc, KSM-66® Ashwagandha"
    },
    bloom: {
      num: "Phase 02", name: "Bloom", stage: "The maternal window", color: "#8FA662",
      desc: "Nourishment built for pregnancy and postpartum — for both of you.",
      actives: "Choline, Iron Bisglycinate, Algal DHA"
    },
    thrive: {
      num: "Phase 03", name: "Thrive", stage: "Burnout recovery", color: "#5C8B86",
      desc: "For the season when you're running everyone else's life on empty. Energy and stress recovery, rebuilt from the inside.",
      actives: "CoQ10, Magnesium Glycinate, Rhodiola"
    },
    shift: {
      num: "Phase 04", name: "Shift", stage: "Perimenopause · ages 40–50", color: "#B97D62",
      desc: "Support through the hormonal swings, hot flashes, and mood shifts of the transition.",
      actives: "Black Cohosh, Vitex, Affron® Saffron"
    },
    wisdom: {
      num: "Phase 05", name: "Wisdom", stage: "Post-menopause · 50+", color: "#A9895F",
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

  function pouchSvg(color) {
    return '<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M18 20c0-7 6-12 14-12h36c8 0 14 5 14 12v82c0 10-8 18-18 18H36c-10 0-18-8-18-18V20z" fill="' + color + '"/>' +
      '<path d="M18 20c0-7 6-12 14-12h36c8 0 14 5 14 12v6H18z" fill="#000" opacity=".12"/>' +
      '<circle cx="50" cy="55" r="14" fill="#fff" opacity=".9"/>' +
      '<path d="M50 47c-5 0-8 4-8 8s3 8 8 8 3-5 3-8-3-8-3-8z" fill="' + color + '"/>' +
      '</svg>';
  }

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
    document.getElementById("quizResultPhaseNum").textContent = phase.num;
    document.getElementById("quizResultName").textContent = phase.name;
    document.getElementById("quizResultStage").textContent = phase.stage;
    document.getElementById("quizResultPouch").innerHTML = pouchSvg(phase.color);

    var desc = phase.desc;
    if (answers.priority && PRIORITY_LABELS[answers.priority]) {
      desc += " You told us " + PRIORITY_LABELS[answers.priority] + " matters most right now — that's exactly what this phase is built around.";
    }
    document.getElementById("quizResultDesc").textContent = desc;
    document.getElementById("quizResultActives").innerHTML = "<strong>Key actives:</strong> " + phase.actives;

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
