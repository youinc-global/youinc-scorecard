// ---------------------------
// STEP SYSTEM SETUP
// ---------------------------
const steps = Array.from(document.querySelectorAll(".step"));
let currentStep = 0;

function showStep(n) {
  steps.forEach((s, i) => {
    s.classList.toggle("active", i === n);
  });
  currentStep = n;
}

// ---------------------------
// EMAIL VALIDATION
// ---------------------------
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ---------------------------
// BUTTON HANDLERS
// ---------------------------
document.addEventListener("click", function (e) {
  if (e.target.id === "startBtn") {
    showStep(1);
  }

  if (e.target.classList.contains("nextBtn")) {
    handleNext();
  }

  if (e.target.classList.contains("backBtn")) {
    if (currentStep > 0) showStep(currentStep - 1);
  }
});

// ---------------------------
// VALIDATE + ADVANCE STEP
// ---------------------------
function handleNext() {
  const stepEl = steps[currentStep];

  // Required fields in this step
  const requiredFields = stepEl.querySelectorAll(
    "select[required], input[required]"
  );

  for (const field of requiredFields) {
    if (!field.value || !field.value.trim()) {
      alert("Please fill in all required fields before continuing.");
      return;
    }

    // Email validation
    if (
      field.type === "email" &&
      !isValidEmail(field.value.trim())
    ) {
      alert("Please enter a valid email address.");
      return;
    }
  }

  // If it's the last question step → compute + redirect
  if (currentStep === steps.length - 1) {
    computeAndRedirect();
  } else {
    showStep(currentStep + 1);
  }
}

// ---------------------------
// COMPUTE SCORE + SAVE TO SUPABASE + REDIRECT
// ---------------------------
async function computeAndRedirect() {
  const selects = Array.from(document.querySelectorAll("select[data-dept]"));

  const totals = {
    brand: 0,
    operations: 0,
    finance: 0,
    rnd: 0,
    communication: 0,
    leadership: 0,
  };

  selects.forEach((sel) => {
    const dept = sel.dataset.dept;
    const value = Number(sel.value || 0);
    if (dept && totals.hasOwnProperty(dept)) {
      totals[dept] += value;
    }
  });

  const totalScore = Object.values(totals).reduce((a, b) => a + b, 0);

  // PHASE LOGIC
  function getPhase(score) {
    if (score <= 20) return "Survival";
    if (score <= 40) return "Rebuild";
    if (score <= 60) return "Stability";
    if (score <= 80) return "Growth";
    if (score <= 100) return "Momentum";
    return "Mastery";
  }
  const phase = getPhase(totalScore);

  // USER DETAILS
  const nameField = document.querySelector('input[name="fullName"]');
  const emailField = document.querySelector('input[name="email"]');
  const fullName = nameField ? nameField.value.trim() : "";
  const email = emailField ? emailField.value.trim() : "";

  // ---------------------------
  // SAVE TO SUPABASE
  // ---------------------------
  const { error } = await supabaseClient
    .from("youinc_scores")
    .insert({
      full_name: fullName,
      email: email,
      phase: phase,
      score_brand: totals.brand,
      score_operations: totals.operations,
      score_finance: totals.finance,
      score_rnd: totals.rnd,
      score_communication: totals.communication,
      score_leadership: totals.leadership,
      total_score: totalScore,
    });

  if (error) {
    console.error("Supabase Error:", error);
    alert("Something went wrong saving your results. Please try again.");
    return;
  }

  // ---------------------------
  // REDIRECT WITH SCORES
  // ---------------------------
  const params = new URLSearchParams();
  params.set("name", fullName);
  params.set("brand", totals.brand);
  params.set("operations", totals.operations);
  params.set("finance", totals.finance);
  params.set("rnd", totals.rnd);
  params.set("communication", totals.communication);
  params.set("leadership", totals.leadership);
  params.set("total", totalScore);

  window.location.href = `results.html?${params.toString()}`;
}
