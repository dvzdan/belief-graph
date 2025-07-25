
import { propagateBayesHeavy } from './bayes-logic.js';

let stepIndex = 0; // 0 = baseline, 1 = condTrue, 2 = condFalse, 3 = summary

    // State
    let baseline = 50, condTrue = 70, condFalse = 30, inverse = false;

    // DOM refs
    const stepBaseline = document.getElementById('step-baseline');
    const stepCondTrue = document.getElementById('step-cond-true');
    const stepCondFalse = document.getElementById('step-cond-false');
    const stepSummary = document.getElementById('step-summary');
    const modal = document.getElementById('bayes-modal');
const header = document.getElementById('bayes-modal-header');
let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;

header.style.cursor = 'move';

header.addEventListener('mousedown', function(e) {
  e.preventDefault();
  isDragging = true;
  
  // Get the current computed position of the modal
  const rect = modal.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
  
  // Convert to pixel-based positioning immediately
  modal.style.left = rect.left + 'px';
  modal.style.top = rect.top + 'px';
  modal.style.transform = 'none';
  modal.style.position = 'fixed';
  
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'move';
});

document.addEventListener('mouseup', function() {
  if (isDragging) {
    isDragging = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    e.preventDefault();
    const newLeft = e.clientX - dragOffsetX;
    const newTop = e.clientY - dragOffsetY;
    
    // Keep modal within viewport bounds
    const maxLeft = window.innerWidth - modal.offsetWidth;
    const maxTop = window.innerHeight - modal.offsetHeight;
    
    modal.style.left = Math.max(0, Math.min(maxLeft, newLeft)) + 'px';
    modal.style.top = Math.max(0, Math.min(maxTop, newTop)) + 'px';
  }
});


    // Baseline
    const baselineSlider = document.getElementById('baseline-slider');
    const baselineValue = document.getElementById('baseline-value');
    const setBaselineBtn = document.getElementById('set-baseline-btn');
    const baselineInputRow = document.getElementById('baseline-input-row');
    const baselineLockedRow = document.getElementById('baseline-locked-row');
    const baselineLockedValue = document.getElementById('baseline-locked-value');
    const inverseCheckbox = document.getElementById('inverse-checkbox');

    // Cond True
    const condTrueSlider = document.getElementById('cond-true-slider');
    const condTrueValue = document.getElementById('cond-true-value');
    const setCondTrueBtn = document.getElementById('set-cond-true-btn');
    const condTrueInputRow = document.getElementById('cond-true-input-row');
    const condTrueLockedRow = document.getElementById('cond-true-locked-row');
    const condTrueLockedValue = document.getElementById('cond-true-locked-value');
    const regionTrueLabel = document.getElementById('region-true-label');
    const ratioTrueLabel = document.getElementById('ratio-true-label');
    const condTrueWarning = document.getElementById('cond-true-warning');
    const parentTrueWord = document.getElementById('parent-true-word');
    const parentTrueWord2 = document.getElementById('parent-true-word2');

    // Cond False
    const condFalseSlider = document.getElementById('cond-false-slider');
    const condFalseValue = document.getElementById('cond-false-value');
    const setCondFalseBtn = document.getElementById('set-cond-false-btn');
    const condFalseInputRow = document.getElementById('cond-false-input-row');
    const condFalseLockedRow = document.getElementById('cond-false-locked-row');
    const condFalseLockedValue = document.getElementById('cond-false-locked-value');
    const regionFalseLabel = document.getElementById('region-false-label');
    const ratioFalseLabel = document.getElementById('ratio-false-label');
    const condFalseWarning = document.getElementById('cond-false-warning');
    const parentFalseWord = document.getElementById('parent-false-word');
    const parentFalseWord2 = document.getElementById('parent-false-word2');

    // Summary
    const summaryText = document.getElementById('summary-text');
    const okBtn = document.getElementById('ok-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // Qualitative labels
    function qualitativeRatio(ratio) {
      if (ratio < 0.85) return "Somewhat less likely";
      if (ratio < 1.10) return "About the same";
      if (ratio < 1.40) return "A bit more likely";
      if (ratio < 1.80) return "One and a half times more likely";
      if (ratio < 2.6) return "Twice as likely";
      if (ratio < 4.5) return "Much more likely";
      return "VASTLY more likely";
    }
document.getElementById('ok-btn').addEventListener('click', function() {
  document.getElementById('bayes-modal').classList.add('hidden');
});
document.getElementById('cancel-btn').addEventListener('click', function() {
  document.getElementById('bayes-modal').classList.add('hidden');
});

    // --- Baseline ---
    function updateBaseline() {
      baseline = Number(baselineSlider.value);
      baselineValue.textContent = baseline + "%";
    }
    baselineSlider.addEventListener('input', updateBaseline);
    inverseCheckbox.addEventListener('change', () => {
      inverse = inverseCheckbox.checked;
      parentTrueWord.textContent = inverse ? "false" : "true";
      parentTrueWord2.textContent = inverse ? "false" : "true";
      parentFalseWord.textContent = inverse ? "true" : "false";
      parentFalseWord2.textContent = inverse ? "true" : "false";
    });
setBaselineBtn.onclick = () => {
  baselineInputRow.classList.add('hidden');
  baselineLockedRow.classList.remove('hidden');
  baselineLockedValue.textContent = baseline + "%";
  stepIndex = 1;
  renderStep();
  condTrueSlider.value = Math.max(baseline, 50);
  condTrueValue.textContent = condTrueSlider.value + "%";
  updateCondTrue();
};

    document.getElementById('edit-baseline-btn').addEventListener('click', () => {
stepIndex = 0;
renderStep();
    });

    // --- Cond True ---
    function updateCondTrue() {
      condTrue = Number(condTrueSlider.value);
      condTrueValue.textContent = condTrue + "%";
      regionTrueLabel.textContent = `Allowed: ${baseline}%–100%`;
      let ratio = baseline === 0 ? 99 : condTrue / baseline;
      if (baseline === 0 && condTrue === 0) ratio = 1;
      ratioTrueLabel.textContent = `(${ratio.toFixed(2)}× baseline) — ${qualitativeRatio(ratio)}`;
      const legal = condTrue >= baseline && condTrue <= 100;
      setCondTrueBtn.disabled = !legal;
      condTrueWarning.textContent = legal ? "" : `Value must be between baseline (${baseline}%) and 100%`;
    }
    condTrueSlider.addEventListener('input', updateCondTrue);
setCondTrueBtn.onclick = () => {
  condTrueInputRow.classList.add('hidden');
  condTrueLockedRow.classList.remove('hidden');
  condTrueLockedValue.textContent = condTrue + "%";
  stepIndex = 2;
  renderStep();
  condFalseSlider.value = Math.min(baseline, 50);
  condFalseValue.textContent = condFalseSlider.value + "%";
  updateCondFalse();
};

    document.getElementById('edit-cond-true-btn').addEventListener('click', () => {
  stepIndex = 1;
  renderStep();
});

    // --- Cond False ---
    function updateCondFalse() {
      condFalse = Number(condFalseSlider.value);
      condFalseValue.textContent = condFalse + "%";
      regionFalseLabel.textContent = `Allowed: 0%–${baseline}%`;
      let ratio = baseline === 0 ? 1 : condFalse / baseline;
      ratioFalseLabel.textContent = `(${ratio.toFixed(2)}× baseline) — ${qualitativeRatio(ratio)}`;
      const legal = condFalse >= 0 && condFalse <= baseline;
      setCondFalseBtn.disabled = !legal;
      condFalseWarning.textContent = legal ? "" : `Value must be between 0% and baseline (${baseline}%)`;
    }
    condFalseSlider.addEventListener('input', updateCondFalse);
setCondFalseBtn.onclick = () => {
  condFalseInputRow.classList.add('hidden');
  condFalseLockedRow.classList.remove('hidden');
  condFalseLockedValue.textContent = condFalse + "%";
  stepIndex = 3;
  renderStep();
};
    document.getElementById('edit-cond-false-btn').addEventListener('click', () => {
  stepIndex = 2;
  renderStep();
    });

    // --- Summary ---
    function updateSummary() {
      const parentLabel = window._modalParentLabel || 'Parent';
      const childLabel = window._modalChildLabel || 'Child';
      
      let pos = inverse ? condFalse : condTrue;
      let neg = inverse ? condTrue : condFalse;
      let posTxt = inverse ? parentFalseWord.textContent : parentTrueWord.textContent;
      let negTxt = inverse ? parentTrueWord.textContent : parentFalseWord.textContent;
      let msg = `<b>Baseline:</b> ${baseline}%<br>
      <b>P(${childLabel} | ${parentLabel} is ${posTxt}):</b> ${pos}%<br>
      <b>P(${childLabel} | ${parentLabel} is ${negTxt}):</b> ${neg}%<br><br>`;
      let ratio = neg === 0 ? (pos === 0 ? 1 : 99) : pos / neg;
      msg += `Conditional likelihood ratio: <b>${ratio.toFixed(2)}×</b><br>`;
      msg += qualitativeRatio(ratio);
      summaryText.innerHTML = msg;
    }
okBtn.addEventListener('click', () => {
  document.getElementById('bayes-modal').classList.add('hidden');
  
  // Save modal values to the edge - HEAVY MODE DATA ONLY
  if (window._currentBayesEdge) {
    // Store CPT data in heavy-mode namespace
    window._currentBayesEdge.data('cpt', {
      baseline,
      condTrue,
      condFalse,
      inverse
    });
    
    // Mark as non-virgin for heavy mode only (don't touch lite mode data)
    // Note: We don't use 'isVirgin' since that conflicts with lite mode
    
    // Trigger heavy mode propagation only
    if (window.propagateBayesHeavy && window.cy) {
      window.propagateBayesHeavy(window.cy);
    }
    
    // Update visuals to reflect heavy mode changes
    if (window.computeVisuals && window.cy) {
      window.computeVisuals(window.cy);
    }
    
    console.log('Heavy mode CPT data saved:', {baseline, condTrue, condFalse, inverse});
  }
});

cancelBtn.addEventListener('click', () => {
  if (confirm('Cancel and discard changes to this conditional?')) {
    modal.classList.add('hidden');
    // Optionally, reset any Bayes modal state here.
  }
});

    // Initial render
    updateBaseline();
    updateCondTrue();
    updateCondFalse();
    updateSummary();


window.openBayesModalForEdge = function(edge) {
    console.log('openBayesModalForEdge called with:', edge);
  window._currentBayesEdge = edge;

  // Get actual node labels and clean them
  const sourceNode = edge.source();
  const targetNode = edge.target();
  
  // Extract clean labels by removing probability indicators
  function cleanLabel(rawLabel) {
    if (!rawLabel) return 'Node';
    // Remove everything from the last newline onward (probability display)
    const cleanedLabel = rawLabel.split('\n')[0].trim();
    return cleanedLabel || 'Node';
  }
  
  const parentLabel = cleanLabel(sourceNode.data('label'));
  const childLabel = cleanLabel(targetNode.data('label'));
  
  // Store labels for use in modal text
  window._modalParentLabel = parentLabel;
  window._modalChildLabel = childLabel;

  // If you want to prefill, set the modal's fields here from edge.data('cpt'):
  const cpt = edge.data('cpt') || {};
  document.getElementById('baseline-slider').value = cpt.baseline !== undefined ? cpt.baseline : 50;
  document.getElementById('baseline-value').textContent = (cpt.baseline !== undefined ? cpt.baseline : 50) + '%';
  document.getElementById('cond-true-slider').value = cpt.condTrue !== undefined ? cpt.condTrue : 70;
  document.getElementById('cond-true-value').textContent = (cpt.condTrue !== undefined ? cpt.condTrue : 70) + '%';
  document.getElementById('cond-false-slider').value = cpt.condFalse !== undefined ? cpt.condFalse : 30;
  document.getElementById('cond-false-value').textContent = (cpt.condFalse !== undefined ? cpt.condFalse : 30) + '%';
  document.getElementById('inverse-checkbox').checked = !!cpt.inverse;

  // Update the modal text with actual labels
  updateModalLabels();

  document.getElementById('bayes-modal').classList.remove('hidden');
  stepIndex = 0;
  renderStep();
};

// Function to update all the modal text with actual node labels
function updateModalLabels() {
  const parentLabel = window._modalParentLabel || 'Parent';
  const childLabel = window._modalChildLabel || 'Child';
  
  // Update step descriptions
  document.querySelector('#step-baseline .step-sub').textContent = 
    `Chance ${childLabel} is true if nothing is known about ${parentLabel}.`;
  
  document.querySelector('#step-cond-true .step-sub').textContent = 
    `Chance ${childLabel} is true if ${parentLabel} is true.`;
    
  document.querySelector('#step-cond-false .step-sub').textContent = 
    `Chance ${childLabel} is true if ${parentLabel} is false.`;
    
  // Update the inverse checkbox label
  const inverseLabel = document.querySelector('#step-baseline label');
  if (inverseLabel) {
    inverseLabel.innerHTML = `<input type="checkbox" id="inverse-checkbox">
      Inverse relationship: ${childLabel} more likely if ${parentLabel} is <b>false</b>`;
  }
}
function renderStep() {
  // Step visibility
  stepBaseline.classList.remove('hidden');
  stepCondTrue.classList.toggle('hidden', stepIndex < 1);
  stepCondFalse.classList.toggle('hidden', stepIndex < 2);
  stepSummary.classList.toggle('hidden', stepIndex !== 3);

  // Baseline row
  baselineInputRow.classList.toggle('hidden', stepIndex !== 0);
  baselineLockedRow.classList.toggle('hidden', stepIndex === 0);

  // Cond True row
  condTrueInputRow.classList.toggle('hidden', stepIndex !== 1);
  condTrueLockedRow.classList.toggle('hidden', stepIndex === 1 || stepIndex === 0);

  // Cond False row
  condFalseInputRow.classList.toggle('hidden', stepIndex !== 2);
  condFalseLockedRow.classList.toggle('hidden', stepIndex === 2 || stepIndex < 2);

  // Summary
  if (stepIndex === 3) updateSummary();
}
