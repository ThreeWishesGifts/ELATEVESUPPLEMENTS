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
     Phase / decade data — mirrors the cards in #shop
  --------------------------------------------------------- */
  var CORE_5 = "Collagen, Magnesium, Omega-3, Vit C, Vit D";

  var PHASES = {
    bloom: {
      era: "Ages 18–29", name: "Bloom", stage: "Citrus botanical · your foundational decade", color: "#9DBFA6", img: "assets/vials/bloom.png",
      desc: "Cycle regularity, steady energy, and reproductive health for your foundational decade — including support through pregnancy and postpartum.",
      boost: "B-Complex, Zinc, Thiamine"
    },
    thrive: {
      era: "Ages 30–39", name: "Thrive", stage: "Berry botanical · the decade of demands", color: "#4F8C8A", img: "assets/vials/thrive.png",
      desc: "For the decade of demands — fertility, energy, and stress recovery while you're building the life you want.",
      boost: "Choline, Active Folate, CoQ10"
    },
    balance: {
      era: "Ages 40–49", name: "Balance", stage: "Ginger hibiscus · perimenopause", color: "#C99A3E", img: "assets/vials/balance.png",
      desc: "Support through perimenopause's hormonal swings, mood shifts, and changing energy.",
      boost: "Ashwagandha, Maca, Resveratrol"
    },
    prime: {
      era: "Ages 50–59", name: "Prime", stage: "Blond orange · menopause & beyond", color: "#BD6A3E", img: "assets/vials/prime.png",
      desc: "Bone density and hormonal support as you move through menopause and into what's next.",
      boost: "Vitamin K2, Calcium, Phytoestrogens"
    },
    wisdom: {
      era: "Ages 60+", name: "Wisdom", stage: "Pomegranate vanilla · long-term vitality", color: "#6B4A6E", img: "assets/vials/wisdom.png",
      desc: "Cognitive clarity, joint comfort, and long-term vitality for the decades of wisdom.",
      boost: "Curcumin, Boswellia, NMN"
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
    var phase = PHASES[answers.stage] || PHASES.bloom;
    document.getElementById("quizResultPhaseNum").textContent = "Your decade: " + phase.era;
    document.getElementById("quizResultName").textContent = phase.name;
    document.getElementById("quizResultStage").textContent = phase.stage;
    document.getElementById("quizResultVial").innerHTML =
      '<img src="' + phase.img + '" alt="Elateve ' + phase.name + ' liquid shot vial">';

    var desc = phase.desc;
    if (answers.priority && PRIORITY_LABELS[answers.priority]) {
      desc += " You told us " + PRIORITY_LABELS[answers.priority] + " matters most right now — that's exactly what this shot is built around.";
    }
    document.getElementById("quizResultDesc").textContent = desc;
    document.getElementById("quizResultActives").innerHTML =
      "<strong>Core 5:</strong> " + CORE_5 + "<br><strong>Plus for you:</strong> " + phase.boost;

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
