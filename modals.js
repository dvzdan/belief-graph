// modals.js
import { adjustNodeSize } from './script_current.js'; // or wherever it's defined
import { NODE_TYPE_NOTE } from './config.js';

// All modal popup creation and event handling logic
console.log("Loaded modals.js");
import { computeVisuals } from './visuals.js';
// Generic show/hide modal (if you want a unified interface, but not strictly required here)
export function showModal(modal) {
  document.body.appendChild(modal);
  centerModal(modal);
  modal.classList.remove('hidden');
  modal.focus && modal.focus();
}
export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    setTimeout(() => {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }, 200);
  }
}

// --- Edit Node Label Modal ---
export function openEditNodeLabelModal(node) {
  const nodeType = node.data('type');
  
  // Use simplified note editor for note nodes
  if (nodeType === NODE_TYPE_NOTE) {
    openEditNoteModal(node);
    return;
  }
  
  // Regular editor for other nodes
  openEditRegularNodeModal(node);
}

// Simplified editor for note nodes - just text, no hover
function openEditNoteModal(node) {
  // Remove any existing modal
  hideModal('edit-note-modal');

  const modal = document.createElement('div');
  modal.id = 'edit-note-modal';
  modal.className = 'hidden';
  modal.style.position = 'fixed';
  modal.style.background = '#fff';
  modal.style.padding = '24px 24px 18px 24px';
  modal.style.border = '2px solid #1976d2';
  modal.style.borderRadius = '8px';
  modal.style.zIndex = 10001;
  modal.style.boxShadow = '0 6px 30px #1976d255';
  modal.style.minWidth = '350px';

  // Title
  const title = document.createElement('div');
  title.textContent = 'Edit Note';
  title.className = 'modal-title';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '14px';
  modal.appendChild(title);
  makeDraggable(modal, ".modal-title");

  // Note text input
  const textLabel = document.createElement('label');
  textLabel.textContent = 'Note text:';
  textLabel.style.display = 'block';
  textLabel.style.marginBottom = '3px';
  modal.appendChild(textLabel);

  const textInput = document.createElement('textarea');
  textInput.style.width = '100%';
  textInput.style.height = '80px';
  textInput.style.marginBottom = '18px';
  textInput.style.resize = 'vertical';
  textInput.value = node.data('displayLabel') || node.data('origLabel') || '';
  modal.appendChild(textInput);

  // Save and Cancel buttons
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.disabled = !textInput.value.trim();
  saveBtn.style.margin = '0 12px 0 0';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';

  modal.appendChild(saveBtn);
  modal.appendChild(cancelBtn);

  // Validation
  textInput.addEventListener('input', () => {
    saveBtn.disabled = !textInput.value.trim();
  });

  // Save logic
  saveBtn.onclick = function() {
    const textVal = textInput.value.trim();
    if (!textVal) return;

    node.data('displayLabel', textVal);
    node.removeData('hoverLabel'); // Notes don't have hover labels
    node.removeData('isVirgin');
    adjustNodeSize(node);
    computeVisuals(window.cy);

    hideModal(modal.id);
    setTimeout(() => {
      if (window.convergeAll) window.convergeAll({ cy: window.cy });
      if (window.computeVisuals) window.computeVisuals(window.cy);
    }, 0);
  };

  cancelBtn.onclick = function() {
    hideModal(modal.id);
  };

  // ESC key closes modal
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      hideModal(modal.id);
      document.removeEventListener('keydown', escHandler);
    }
  });

  // Show modal
  showModal(modal);
  textInput.focus();
  textInput.select();
}

// Regular editor for non-note nodes
function openEditRegularNodeModal(node) {
  // Remove any existing modal
  hideModal('edit-label-modal');

  const modal = document.createElement('div');
  modal.id = 'edit-label-modal';
  modal.className = 'hidden';
  modal.style.position = 'fixed';
  modal.style.background = '#fff';
  modal.style.padding = '24px 24px 18px 24px';
  modal.style.border = '2px solid #1976d2';
  modal.style.borderRadius = '8px';
  modal.style.zIndex = 10001;
  modal.style.boxShadow = '0 6px 30px #1976d255';
  modal.style.minWidth = '350px';

  // Title
  const title = document.createElement('div');
  title.textContent = 'Edit Node Label';
  title.className = 'modal-title';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '14px';
  modal.appendChild(title);
  makeDraggable(modal, ".modal-title");

  // Display label (short)
  const displayLabelLabel = document.createElement('label');
  displayLabelLabel.textContent = 'Display title (short, 1–2 words):';
  displayLabelLabel.style.display = 'block';
  displayLabelLabel.style.marginBottom = '3px';
  modal.appendChild(displayLabelLabel);

  const displayInput = document.createElement('input');
  displayInput.type = 'text';
  displayInput.maxLength = 30;
  displayInput.style.width = '100%';
  displayInput.style.marginBottom = '10px';
  displayInput.value = node.data('displayLabel') || node.data('origLabel') || '';
  modal.appendChild(displayInput);

  // Hover label (long)
  const hoverLabelLabel = document.createElement('label');
  hoverLabelLabel.textContent = 'Hover title (full sentence, optional):';
  hoverLabelLabel.style.display = 'block';
  hoverLabelLabel.style.marginBottom = '3px';
  modal.appendChild(hoverLabelLabel);

  const hoverInput = document.createElement('input');
  hoverInput.type = 'text';
  hoverInput.style.width = '100%';
  hoverInput.style.marginBottom = '18px';
  hoverInput.value = node.data('hoverLabel') || '';
  modal.appendChild(hoverInput);

  // Save and Cancel buttons
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.disabled = !displayInput.value.trim();
  saveBtn.style.margin = '0 12px 0 0';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';

  modal.appendChild(saveBtn);
  modal.appendChild(cancelBtn);

  // Validation
  displayInput.addEventListener('input', () => {
    saveBtn.disabled = !displayInput.value.trim();
  });

  // Save logic
  saveBtn.onclick = function() {
    const displayVal = displayInput.value.trim();
    const hoverVal = hoverInput.value.trim();
    if (!displayVal) return;

    // For notes, don't limit the length; for other nodes, limit to 25 chars
    const finalDisplayVal = node.data('type') === NODE_TYPE_NOTE ? displayVal : displayVal.slice(0, 25);

    node.data('displayLabel', finalDisplayVal);
    node.data('hoverLabel', hoverVal);
    node.removeData('isVirgin');
    adjustNodeSize(node);
    computeVisuals(window.cy);

    hideModal(modal.id);
    setTimeout(() => {
      if (window.convergeAll) window.convergeAll({ cy: window.cy });
      if (window.computeVisuals) window.computeVisuals(window.cy);
    }, 0);
  };

  cancelBtn.onclick = function() {
    hideModal(modal.id);
  };

  // ESC key closes modal
  const escListener = (e) => {
    if (e.key === "Escape") {
      hideModal(modal.id);
      window.removeEventListener('keydown', escListener);
    }
  };
  window.addEventListener('keydown', escListener);

  showModal(modal);
  displayInput.focus();
}
function applyFloretColor(node, color, cy) {
  const floretNodes = node.predecessors('node').add(node);
  floretNodes.forEach(n => {
    n.data('floretColor', color);
    console.log('Set floretColor on', n.id(), 'to', color);
  });
  cy.style().update();
}

export function openVisualSignalsModal(node, cy) {
  hideModal('visual-signals-modal'); // remove any existing modal

  const modal = document.createElement('div');
  modal.id = 'visual-signals-modal';
  modal.className = 'hidden';
  modal.style.position = 'fixed';
  modal.style.background = '#fff';
  modal.style.padding = '24px 20px 18px 20px';
  modal.style.border = '2px solid #1976d2';
  modal.style.borderRadius = '8px';
  modal.style.zIndex = 10001;
  modal.style.boxShadow = '0 6px 30px #1976d255';
  modal.style.minWidth = '350px';

  modal.innerHTML = `
    <div class="modal-title" style="font-weight:bold; margin-bottom:14px; cursor:move;">
      Visual Signals for Node
      <button id="closeVisualSignalsModal"
              style="position:absolute; top:8px; right:8px; font-size:18px; background:none; border:none; cursor:pointer;">&times;</button>
    </div>
    <button id="increaseNodeSize">+</button>
    <button id="decreaseNodeSize">−</button>
    <span style="margin-left:10px; font-size:0.95em; color:#666;">Node Size</span>
    <br><br>
    <label>Text Color:
      <select id="textColorSelect">
        <option value="virgin">Standard Shade</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="purple">Purple</option>
            <option value="#f9a825">Orange (Central)</option>
    <option value="green">Green</option>
    <option value="#00897b">Teal</option>
    <option value="#d81b60">Magenta</option>
      </select>
    </label>
    <br><br>
    <label>Node Floret Color:
      <select id="floretColorSelect">
        <option value="virgin">Standard Shade</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="purple">Purple</option>
      </select>
    </label>
  `;

  showModal(modal);
  centerModal(modal);
  makeDraggable(modal, '.modal-title');

  // --- Ensure dropdowns reflect current node state ---
  // Text color dropdown
  const textColor = node.data('textColor') || 'virgin';
  document.getElementById('textColorSelect').value = textColor;

  // Floret color dropdown
  const floretColor = node.data('floretColor');
  if (!floretColor || floretColor === '#eee') {
    document.getElementById('floretColorSelect').value = 'virgin';
  } else {
    document.getElementById('floretColorSelect').value = floretColor;
  }

  // Close button handler
  const closeBtn = document.getElementById('closeVisualSignalsModal');
  closeBtn.onclick = () => hideModal(modal.id);

  // Node size handlers
  document.getElementById('increaseNodeSize').onclick = () => { adjustNodeSize(node, 1); computeVisuals(cy); };
document.getElementById('decreaseNodeSize').onclick = () => { adjustNodeSize(node, -1); computeVisuals(cy); };


  // Text color handler
  document.getElementById('textColorSelect').onchange = (e) => changeTextColor(node, e.target.value, cy);

  // Floret color handler
  document.getElementById('floretColorSelect').onchange = (e) => {
    let val = e.target.value === 'virgin' ? '#eee' : e.target.value;
    applyFloretColor(node, val, cy);
  };

  // Click outside modal closes it
  function outsideClickHandler(e) {
    if (!modal.contains(e.target)) {
      hideModal(modal.id);
      document.removeEventListener('mousedown', outsideClickHandler);
    }
  }
  document.addEventListener('mousedown', outsideClickHandler);
}

function changeTextColor(node, color, cy) {
  if (color === 'virgin') color = '#222'; // black (or use '#000' if you want true black)
  node.data('textColor', color);
  computeVisuals(cy);
}

function changeFloretColor(node, color, cy) {
  if (color === 'virgin') color = '#eee'; // light gray
  node.data('floretColor', color);
  computeVisuals(cy);
}



// --- Notes Modal ---
export function openNotesModal(node) {
  hideModal('notes-modal');

  const modal = document.createElement('div');
  modal.id = 'notes-modal';
  modal.className = 'hidden';
  modal.style.position = 'fixed';
  modal.style.background = '#fff';
  modal.style.padding = '24px 20px 18px 20px';
  modal.style.border = '2px solid #1976d2';
  modal.style.borderRadius = '8px';
  modal.style.zIndex = 10001;
  modal.style.boxShadow = '0 6px 30px #1976d255';
  modal.style.minWidth = '360px';

  // Title
  const title = document.createElement('div');
  title.textContent = 'View/Edit Notes';
  title.className = 'modal-title';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '12px';
  modal.appendChild(title);
  makeDraggable(modal, ".modal-title");

  // Textarea
  const textarea = document.createElement('textarea');
  textarea.style.width = '100%';
  textarea.style.minHeight = '60px';
  textarea.style.fontSize = '14px';
  textarea.style.border = '1px solid #bbb';
  textarea.style.borderRadius = '4px';
  textarea.value = node.data('notes') || '';
  modal.appendChild(textarea);

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.style.margin = '14px 10px 0 0';
  saveBtn.onclick = function() {
    node.data('notes', textarea.value.trim());
    hideModal(modal.id);
  };
  modal.appendChild(saveBtn);

  // Cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = function() {
    hideModal(modal.id);
  };
  modal.appendChild(cancelBtn);

  // ESC key closes modal
  const escListener = (e) => {
    if (e.key === "Escape") {
      hideModal(modal.id);
      window.removeEventListener('keydown', escListener);
    }
  };
  window.addEventListener('keydown', escListener);

  showModal(modal);
  textarea.focus();
}

// --- Rationale Modal (for edge or node) ---
export function openRationaleModal(element, type) {
  hideModal('rationale-modal');

  const modal = document.createElement('div');
  modal.id = 'rationale-modal';
  modal.className = 'hidden';
  modal.style.position = 'fixed';
  modal.style.background = '#fff';
  modal.style.padding = '24px 20px 18px 20px';
  modal.style.border = '2px solid #2e7d32';
  modal.style.borderRadius = '8px';
  modal.style.zIndex = 10001;
  modal.style.boxShadow = '0 6px 30px #2e7d3255';
  modal.style.minWidth = '360px';

  // Title
  const title = document.createElement('div');
  title.textContent = 'View/Edit Rationale';
  title.className = 'modal-title';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '12px';
  modal.appendChild(title);
  makeDraggable(modal, ".modal-title");

  // Textarea
  const textarea = document.createElement('textarea');
  textarea.style.width = '100%';
  textarea.style.minHeight = '60px';
  textarea.style.fontSize = '14px';
  textarea.style.border = '1px solid #bbb';
  textarea.style.borderRadius = '4px';
  textarea.value = element.data('rationale') || '';
  modal.appendChild(textarea);

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.style.margin = '14px 10px 0 0';
  saveBtn.onclick = function() {
    element.data('rationale', textarea.value.trim());
    hideModal(modal.id);
  };
  modal.appendChild(saveBtn);

  // Cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = function() {
    hideModal(modal.id);
  };
  modal.appendChild(cancelBtn);

  // ESC key closes modal
  const escListener = (e) => {
    if (e.key === "Escape") {
      hideModal(modal.id);
      window.removeEventListener('keydown', escListener);
    }
  };
  window.addEventListener('keydown', escListener);

  showModal(modal);
  textarea.focus();
}

// --- CPT Modal (Bayes) ---
export function openCPTModalTwoPerParent({ node, parentId, existing, onSave, onPrev }) {
  hideModal('cpt-modal');

  const modal = document.createElement('div');
  modal.id = 'cpt-modal';
  modal.className = 'hidden';
  modal.style.position = 'fixed';
  modal.style.background = '#fff';
  modal.style.padding = '24px 24px 18px 24px';
  modal.style.border = '2px solid #1976d2';
  modal.style.borderRadius = '8px';
  modal.style.zIndex = 10001;
  modal.style.boxShadow = '0 6px 30px #1976d255';
  modal.style.minWidth = '350px';

  // Title
  const title = document.createElement('div');
  title.textContent = `Set Conditional Probabilities (Node: ${node.id()}, Parent: ${parentId})`;
  title.className = 'modal-title';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '14px';
  modal.appendChild(title);
  makeDraggable(modal, ".modal-title");

  // Probability for parent 0
  const p0label = document.createElement('label');
  p0label.textContent = `P(${node.id()}=Yes | ${parentId}=No):`;
  p0label.style.display = 'block';
  modal.appendChild(p0label);
  const p0input = document.createElement('input');
  p0input.type = 'number';
  p0input.min = 0;
  p0input.max = 1;
  p0input.step = 0.01;
  p0input.value = existing?.p0 ?? '';
  modal.appendChild(p0input);

  // Probability for parent 1
  const p1label = document.createElement('label');
  p1label.textContent = `P(${node.id()}=Yes | ${parentId}=Yes):`;
  p1label.style.display = 'block';
  p1label.style.marginTop = '8px';
  modal.appendChild(p1label);
  const p1input = document.createElement('input');
  p1input.type = 'number';
  p1input.min = 0;
  p1input.max = 1;
  p1input.step = 0.01;
  p1input.value = existing?.p1 ?? '';
  modal.appendChild(p1input);

  // Save and Prev/Cancel buttons
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.style.margin = '10px 10px 0 0';

  saveBtn.onclick = function() {
    const p0 = parseFloat(p0input.value);
    const p1 = parseFloat(p1input.value);
    if (isNaN(p0) || isNaN(p1)) return;
    hideModal(modal.id);
    if (typeof onSave === 'function') onSave({ p0, p1 });
  };
  modal.appendChild(saveBtn);

  if (onPrev) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Prev';
    prevBtn.style.margin = '10px 10px 0 0';
    prevBtn.onclick = function() {
      hideModal(modal.id);
      if (typeof onPrev === 'function') onPrev();
    };
    modal.appendChild(prevBtn);
  }

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = function() {
    hideModal(modal.id);
  };
  modal.appendChild(cancelBtn);

  // ESC key closes modal
  const escListener = (e) => {
    if (e.key === "Escape") {
      hideModal(modal.id);
      window.removeEventListener('keydown', escListener);
    }
  };
  window.addEventListener('keydown', escListener);

  showModal(modal);
  p0input.focus();
}

// === Modal Utility Functions ===

// Center modal in viewport (call after appending to body)
function centerModal(modal) {
  modal.style.left = "0px";
  modal.style.top = "0px";
  modal.style.display = "block";
  const { innerWidth, innerHeight } = window;
  const rect = modal.getBoundingClientRect();
  modal.style.left = Math.round((innerWidth - rect.width) / 2) + "px";
  modal.style.top = Math.round((innerHeight - rect.height) / 2) + "px";
}

// Make modal draggable by handle (title bar or full modal)
function makeDraggable(modal, handleSelector = null) {
  let isDragging = false, startX, startY, origX, origY;
  const handle = handleSelector ? modal.querySelector(handleSelector) : modal;
  if (!handle) return;

  handle.style.cursor = "move";
  handle.onmousedown = function(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = modal.getBoundingClientRect();
    modal.style.left = rect.left + "px";
    modal.style.top  = rect.top + "px";
    origX = rect.left;
    origY = rect.top;
    document.body.style.userSelect = "none";
    e.preventDefault();
  };

  document.onmousemove = function(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    modal.style.left = (origX + dx) + "px";
    modal.style.top  = (origY + dy) + "px";
  };

  document.onmouseup = function() {
    isDragging = false;
    document.body.style.userSelect = "";
  };
}
