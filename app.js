const steps = Array.from(document.querySelectorAll('.step'));
let currentStep = 0;

const startBtn = document.getElementById('startBtn');
if (startBtn) {
  startBtn.addEventListener('click', () => showStep(1));
}

// Handle Back / Next / Finish
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('backBtn')) {
    goBack();
  }
  if (e.target.classList.contains('nextBtn')) {
    handleNext(e);
  }
});

function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle('active', i === index);
  });
  currentStep = index;
}

function goBack() {
  if (currentStep > 0) {
    showStep(currentStep - 1);
  }
}

function handleNext(e) {
  // Intro step (0) → no validation
  if (currentStep === 0) {
    showStep(1);
    return;
  }

  const stepEl = steps[currentStep];
  const select = stepEl.querySelector('select[required]');

  if (select && !select.value) {
    alert('Please select an answer before continuing.');
    return;
  }

  // If it's the last question step, compute and redirect
  if (currentStep === steps.length - 1 || e.target.id === 'finishBtn') {
    computeAndRedirect();
  } else {
    showStep(currentStep + 1);
  }
}

function computeAndRedirect() {
  const selects = Array.from(document.querySelectorAll('select[data-dept]'));

  const totals = {
    brand: 0,
    operations: 0,
    finance: 0,
    rnd: 0,
    communication: 0,
    leadership: 0
  };

  selects.forEach(sel => {
    const dept = sel.dataset.dept;
    const value = Number(sel.value || 0);
    if (dept && totals.hasOwnProperty(dept)) {
      totals[dept] += value;
    }
  });

  const totalScore = Object.values(totals).reduce((a, b) => a + b, 0);

  const params = new URLSearchParams();
  params.set('brand', String(totals.brand));
  params.set('operations', String(totals.operations));
  params.set('finance', String(totals.finance));
  params.set('rnd', String(totals.rnd));
  params.set('communication', String(totals.communication));
  params.set('leadership', String(totals.leadership));
  params.set('total', String(totalScore));

  window.location.href = `results.html?${params.toString()}`;
}

// initial show
showStep(0);
