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
     Scroll reveal — subtle fade/rise for a more dynamic feel
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("in-view"); });
    }
  }

  /* ---------------------------------------------------------
     Phase data — mirrors the rows in #shop
  --------------------------------------------------------- */
  var CORE_5 = "Collagen, Magnesium, Omega-3, Vitamin C & D";

  var PHASES = {
    thrive: {
      code: "PH-01", name: "Thrive", vibe: "Reproductive foundation", accent: "#A3B19B", formula: "FORMULA NO. 5401",
      desc: "Cycle regularity and reproductive health, precisely supported.",
      boost: "Myo-Inositol, Folate, Zinc, KSM-66® Ashwagandha"
    },
    bloom: {
      code: "PH-02", name: "Bloom", vibe: "Maternal journey", accent: "#D8C4A0", formula: "FORMULA NO. 5493",
      desc: "Preconception, pregnancy, and postpartum, nourished with intention.",
      boost: "Choline, Iron Bisglycinate, Algal DHA"
    },
    shift: {
      code: "PH-03", name: "Shift", vibe: "Hormonal transition", accent: "#C88A75", formula: "FORMULA NO. 5402",
      desc: "Perimenopause's hormonal shifts, met with precision.",
      boost: "Black Cohosh, Vitex, Affron® Saffron"
    },
    wisdom: {
      code: "PH-04", name: "Wisdom", vibe: "Post-menopause, longevity", accent: "#7F8C8D", formula: "FORMULA NO. 5433",
      desc: "Cognitive clarity and long-term vitality, sustained for life.",
      boost: "Calcium Hydroxyapatite, Maca, Lion's Mane"
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
  var answers = { stage: null, indicator: null, priority: null };
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
    answers = { stage: null, indicator: null, priority: null };
    clearSelections();
    showStep(0);
    collapseStageFinder();
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
    var phase = PHASES[answers.stage] || PHASES.thrive;
    document.getElementById("quizResultPhaseNum").textContent = phase.code;
    document.getElementById("quizResultName").textContent = phase.name;
    document.getElementById("quizResultStage").textContent = phase.vibe;

    var desc = phase.desc;
    if (answers.priority && PRIORITY_LABELS[answers.priority]) {
      desc += " You told us " + PRIORITY_LABELS[answers.priority] + " matters most right now — that's exactly what this formula is built around.";
    }
    document.getElementById("quizResultDesc").textContent = desc;
    document.getElementById("quizResultActives").innerHTML =
      "<strong>Core 5</strong> + " + phase.boost + "<br>" + phase.formula;

    var resultCard = document.getElementById("quizResultCard");
    if (resultCard) resultCard.style.setProperty("--accent", phase.accent);

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
      answers = { stage: null, indicator: null, priority: null };
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
        else if (question === "indicator") showStep(3);
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
     Stage finder — collapsed pill, appears after scrolling past
     the hero; expands to the fuller panel on click.
  --------------------------------------------------------- */
  var stageFinder = document.getElementById("stageFinder");
  var stageFinderToggle = document.getElementById("stageFinderToggle");
  var stageFinderPanel = document.getElementById("stageFinderPanel");
  var stageFinderClose = document.getElementById("stageFinderClose");
  var heroEl = document.querySelector(".hero");

  function collapseStageFinder() {
    if (!stageFinder) return;
    stageFinder.classList.remove("expanded");
    if (stageFinderPanel) stageFinderPanel.hidden = true;
    if (stageFinderToggle) stageFinderToggle.setAttribute("aria-expanded", "false");
  }

  if (stageFinder && stageFinderToggle && stageFinderPanel) {
    stageFinderToggle.addEventListener("click", function () {
      stageFinder.classList.add("expanded");
      stageFinderPanel.hidden = false;
      stageFinderToggle.setAttribute("aria-expanded", "true");
    });
    if (stageFinderClose) {
      stageFinderClose.addEventListener("click", collapseStageFinder);
    }

    var revealStageFinder = function () {
      var threshold = heroEl ? heroEl.offsetHeight - 80 : 400;
      if (window.scrollY > threshold) {
        stageFinder.hidden = false;
        window.removeEventListener("scroll", revealStageFinder);
      }
    };
    window.addEventListener("scroll", revealStageFinder, { passive: true });
    revealStageFinder();
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
