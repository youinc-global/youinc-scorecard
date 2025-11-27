// YOU INC Scorecard — client side logic
// 24 questions, scale 1-5
const steps = Array.from(document.querySelectorAll('.step'));
const progressBar = document.getElementById('progressBar');
const form = document.getElementById('scoreForm');

let current = 0;
const totalQuestionSteps = 24; // excludes intro + contact
const answers = new Array(24).fill(null); // index 0..23

// create choice buttons (1..5) for each .choices container
document.querySelectorAll('.choices').forEach(container => {
  for (let i=1;i<=5;i++){
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'choice';
    c.textContent = i;
    c.dataset.value = i;
    container.appendChild(c);
  }
});

// helper: update progress
function updateProgress(){
  // compute how many question steps completed (answers not null)
  const done = answers.filter(v => v!==null).length;
  const percent = Math.round((done / totalQuestionSteps) * 100);
  progressBar.style.width = `${percent}%`;
}

// navigation functions
function showStep(index){
  steps.forEach(s => s.classList.remove('active'));
  if (index < 0) index = 0;
  if (index > steps.length -1) index = steps.length -1;
  steps[index].classList.add('active');
  current = index;
  updateProgress();
  // focus optional
  const firstBtn = steps[index].querySelector('.choice');
  if(firstBtn) firstBtn.focus();
}

// start button
document.querySelectorAll('.startBtn').forEach(b=>b.addEventListener('click', ()=> showStep(1)));

// next/back
document.addEventListener('click', (e) => {
  if (e.target.matches('.nextBtn')) {
    // find next step index
    const idx = steps.indexOf(e.target.closest('.step'));
    showStep(idx + 1);
  }
  if (e.target.matches('.backBtn')) {
    const idx = steps.indexOf(e.target.closest('.step'));
    showStep(idx - 1);
  }
});

// choice selection logic
document.addEventListener('click', (e) => {
  if (e.target.matches('.choice')) {
    const btn = e.target;
    const container = btn.closest('.choices');
    const value = Number(btn.dataset.value);
    const qIndex = Number(container.dataset.index); // 0..23

    // mark selected visually
    container.querySelectorAll('.choice').forEach(x => x.classList.remove('selected'));
    btn.classList.add('selected');

    // save answer
    answers[qIndex] = value;
    updateProgress();
    // small auto-advance: go to next step after short delay
    setTimeout(() => {
      const idx = steps.indexOf(container.closest('.step'));
      if (idx < steps.length - 1) showStep(idx + 1);
    }, 180);
  }
});

// when user clicks final "See results" (submitBtn)
document.addEventListener('click', (e) => {
  if (e.target.matches('.submitBtn') || e.target.matches('.submitFinally')) {
    // if they clicked .submitBtn from step 24 (without optional email), jump to contact step
    const idx = steps.indexOf(e.target.closest('.step'));
    // check if all answers present
    const incomplete = answers.some(v => v === null);
    if (incomplete && e.target.matches('.submitBtn')) {
      // move to contact step anyway (we keep allowing user to finish)
      const contactStep = steps.findIndex(s => s.dataset.step === 'contact');
      if (contactStep > -1) showStep(contactStep);
      return;
    }
    // gather optional email
    const emailInput = document.querySelector('#email');
    const email = emailInput ? emailInput.value.trim() : '';

    // compute dept totals
    const depts = {
      brand: answers.slice(0,4).reduce((a,b)=>a+(b||0),0),
      operations: answers.slice(4,8).reduce((a,b)=>a+(b||0),0),
      finance: answers.slice(8,12).reduce((a,b)=>a+(b||0),0),
      rnd: answers.slice(12,16).reduce((a,b)=>a+(b||0),0),
      communication: answers.slice(16,20).reduce((a,b)=>a+(b||0),0),
      leadership: answers.slice(20,24).reduce((a,b)=>a+(b||0),0)
    };
    const total = Object.values(depts).reduce((a,b)=>a+b,0);

    // build query string safely (numeric values only)
    const params = new URLSearchParams();
    params.set('brand', depts.brand);
    params.set('operations', depts.operations);
    params.set('finance', depts.finance);
    params.set('rnd', depts.rnd);
    params.set('communication', depts.communication);
    params.set('leadership', depts.leadership);
    params.set('total', total);
    if (email) params.set('email', encodeURIComponent(email)); // optional (you may remove if you prefer)

    // redirect to results page
    window.location.href = `results.html?${params.toString()}`;
  }
});

// initial show
showStep(0);
updateProgress();
