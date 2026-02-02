// Configuration
const CONFIG = {
  ui: {
    width: 44,    
    radius: 12,   
    blur: '20px'  
  },
  colors: {
    defaultBrush: '#333333',
    defaultBg: '#F5F5FA',
    active: '#000000',
    inactive: '#8E8E93'
  }
};

// Globals
let pg;      
let ui = {}; 
let state = {
  tool: 'pen',       
  isHoveringUI: false, 
  isDrawing: false    
};
const TOOLS = ['pen', 'spray', 'eraser'];

// Main Sketch
function setup() {
  initCanvas();
  injectStyles();
  createToolbar();
  createToggleBtn();
  updateToolState();
}

function draw() {
  background(ui.bgPicker.color());
  image(pg, 0, 0);
  if (mouseIsPressed && state.isDrawing) {
    handlePainting();
  }
}

// Initialization and Canvas Logic
function initCanvas() {
  let body = select('body');
  body.style('margin', '0');
  body.style('overflow', 'hidden');
  body.style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  createCanvas(windowWidth, windowHeight);

  pg = createGraphics(windowWidth, windowHeight);
  pg.clear();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  let newPg = createGraphics(windowWidth, windowHeight);
  newPg.image(pg, 0, 0);
  pg = newPg;
}

// Input Logic

function mousePressed() {
  if (!state.isHoveringUI) {
    state.isDrawing = true;
  }
}

function mouseReleased() {
  state.isDrawing = false;
}

function handlePainting() {
  const c = ui.brushPicker.color();
  const s = ui.sizeSlider.value();
  
  pg.strokeWeight(s);
  pg.strokeCap(ROUND);
  pg.strokeJoin(ROUND);

  switch (state.tool) {
    case 'pen': 
      pg.stroke(c);
      pg.line(pmouseX, pmouseY, mouseX, mouseY);
      break;
      
    case 'eraser': 
      pg.erase();
      pg.line(pmouseX, pmouseY, mouseX, mouseY);
      pg.noErase();
      break;
      
    case 'spray': 
      pg.stroke(c);
      pg.strokeWeight(1);

      const density = map(s, 2, 80, 10, 100);
      for (let i = 0; i < density; i++) {
        const r = sqrt(random()) * s; 
        const theta = random(TWO_PI);
        pg.point(mouseX + cos(theta) * r, mouseY + sin(theta) * r);
      }
      break;
  }
}

// UI Construction

function createToolbar() {

  const bar = createDiv('');
  bar.class('glass-panel floating-bar');
  
  bar.mouseOver(() => state.isHoveringUI = true);
  bar.mouseOut(() => state.isHoveringUI = false); 
  ui.toolbar = bar;

  const closeBtn = createButton('✕');
  closeBtn.parent(bar).class('tool-btn close-btn');
  closeBtn.mousePressed(toggleToolbar);
  closeBtn.mouseOver(() => state.isHoveringUI = true);

  addDivider(bar);

  const colorGroup = createDiv('').parent(bar).style('display:flex; gap:12px');
  ui.brushPicker = createColorUnit(colorGroup, CONFIG.colors.defaultBrush, 'Color');
  ui.bgPicker = createColorUnit(colorGroup, CONFIG.colors.defaultBg, 'Bg');

  addDivider(bar);

  // Tool button
  ui.buttons = {};
  TOOLS.forEach(toolName => {
    let icon = '';
    if (toolName === 'pen') icon = '🖊️';
    if (toolName === 'spray') icon = '💨';
    if (toolName === 'eraser') icon = '🧹';

    const btn = createButton(icon);
    btn.parent(bar).class('tool-btn');
    btn.mousePressed(() => {
      state.tool = toolName;
      updateToolState();
    });
    btn.mouseOver(() => state.isHoveringUI = true);
    
    ui.buttons[toolName] = btn;
  });
  addDivider(bar);

  const sizeGroup = createDiv('').parent(bar).class('column-center');
  ui.sizeSlider = createSlider(2, 80, 10).parent(sizeGroup);
  createSpan('Size').parent(sizeGroup).class('label-text');
  addDivider(bar);

  // Clear and Save
  createActionBtn(bar, '🗑️', () => {
    if (confirm('Clear all drawings?')) pg.clear();
  });
  
  createActionBtn(bar, '💾', () => {
    saveCanvas('MyArt', 'png');
  });
}

function createToggleBtn() {
  const btn = createButton('🛠️');
  btn.class('glass-panel toggle-btn');
  btn.mousePressed(toggleToolbar);
  
  btn.mouseOver(() => state.isHoveringUI = true);
  btn.mouseOut(() => state.isHoveringUI = false);
  
  ui.openBtn = btn;
}

// Helpers

function createColorUnit(parent, defaultColor, label) {
  const box = createDiv('').parent(parent).class('column-center');
  const picker = createColorPicker(defaultColor).parent(box);
  createSpan(label).parent(box).class('label-text');
  return picker;
}

function createActionBtn(parent, icon, action) {
  const btn = createButton(icon).parent(parent).class('tool-btn');
  btn.mousePressed(action);
  btn.mouseOver(() => state.isHoveringUI = true);
  return btn;
}

function addDivider(parent) {
  createDiv('').parent(parent).class('divider');
}

function toggleToolbar() {
  const isHidden = ui.toolbar.style('opacity') === '0';
  
  if (isHidden) {
    ui.toolbar.removeClass('hidden');
    ui.openBtn.style('display', 'none');
  } else {
    ui.toolbar.addClass('hidden');
    setTimeout(() => ui.openBtn.style('display', 'block'), 200);
  }
}

function updateToolState() {
  Object.values(ui.buttons).forEach(b => b.removeClass('active'));
  if (ui.buttons[state.tool]) {
    ui.buttons[state.tool].addClass('active');
  }
}

// CSS Injection
function injectStyles() {
  const css = `
    .glass-panel {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(${CONFIG.ui.blur});
      -webkit-backdrop-filter: blur(${CONFIG.ui.blur});
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      border-radius: 20px;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    
    .floating-bar {
      position: fixed; top: 20px; left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      display: flex; align-items: center; gap: 16px;
    }
    
    .floating-bar.hidden {
      transform: translateX(-50%) scale(0.9);
      opacity: 0;
      pointer-events: none;
    }

    .toggle-btn {
      position: fixed; top: 20px; left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      cursor: pointer; display: none;
      border: none; font-size: 22px;
    }

    .tool-btn {
      width: ${CONFIG.ui.width}px; height: ${CONFIG.ui.width}px;
      border-radius: ${CONFIG.ui.radius}px;
      border: none; background: transparent;
      cursor: pointer; font-size: 22px; color: ${CONFIG.colors.inactive};
      transition: all 0.2s ease;
      display: flex; justify-content: center; align-items: center;
    }

    .tool-btn:hover { background: rgba(0,0,0,0.05); transform: scale(1.05); }
    .tool-btn.active { 
      background: ${CONFIG.colors.active}; 
      color: #fff; 
      transform: scale(1.1); 
      box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
    }

    .close-btn { font-size: 16px; width: 30px; height: 30px; }
    
    .column-center { display: flex; flex-direction: column; align-items: center; }
    
    input[type="color"] { border: none; width: 28px; height: 28px; cursor: pointer; background: none; padding: 0; }
    input[type=range] { width: 80px; accent-color: #000; cursor: pointer; }
    
    .label-text { 
      font-size: 10px; color: ${CONFIG.colors.inactive}; 
      font-weight: 600; text-transform: uppercase; margin-top: 2px; 
    }
    
    .divider { width: 1px; height: 24px; background: #E5E5EA; }
  `;
  createElement('style', css);
}