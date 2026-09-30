(() => {
  const api = window.standbyDesktop;
  if (!api) return;

  document.body.classList.add('standby-desktop');
  const savedDesktopColor = Number.parseInt(localStorage.getItem('standbyDesktopColorIndex') || '12', 10);
  selectColor(Number.isInteger(savedDesktopColor) && savedDesktopColor >= 0 && savedDesktopColor < COLOR_PRESETS.length ? savedDesktopColor : 12);
  const style = document.createElement('style');
  style.textContent = `
    html, body.standby-desktop, body.standby-desktop #app,
    body.standby-desktop .clock-wrapper {
      background: transparent !important;
      background-image: none !important;
    }
    body.standby-desktop .font { font-size: calc(15vw * var(--font-scale)); letter-spacing: -0.4vw; padding-right: 0; }
    body.standby-desktop .digit-1 { font-size: calc(17vw * var(--font-scale)); }
    body.standby-desktop .digit-1, body.standby-desktop .digit-3 { mix-blend-mode: normal !important; }
    body.standby-desktop .colon { transform: translateY(-0.5vw) scale(1.05); }
    body.standby-desktop .clock-inner { width: 100%; }
    body.standby-desktop .date-display {
      width: auto; margin-top: 1vw; padding: 0; gap: 1vw;
      background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
    }
    body.standby-desktop .date-year-box, body.standby-desktop .date-month-box {
      min-width: 0; padding: 0.5vw 0.7vw; border: 0;
    }
    body.standby-desktop .date-year-val, body.standby-desktop .date-month-val { font-size: calc(3.1vw * var(--font-scale)); }
    body.standby-desktop .date-cell { min-width: 7vw; height: 8vw; padding: 0.5vw 1vw; }
    body.standby-desktop .date-cell .weekday { font-size: calc(2.2vw * var(--font-scale)); }
    body.standby-desktop .date-cell .day-num { font-size: calc(3.1vw * var(--font-scale)); }
    body.standby-desktop .date-cell.today { min-height: 8vw; padding: 0.5vw 1.7vw; }
    body.standby-desktop .date-cell.today .day-num { font-size: calc(3.4vw * var(--font-scale)); }
    body.standby-desktop .date-cell.today::after { display: none; }
    body.standby-desktop .controls, body.standby-desktop .settings-panel,
    body.standby-desktop .footer, body.standby-desktop .puppy-container { display: none !important; }
    #desktopEditLayer { position: fixed; inset: 0; z-index: 1000; pointer-events: none; }
    #desktopEditLayer.active { pointer-events: auto; outline: 1px dashed rgba(160,200,255,.65); outline-offset: -2px; cursor: move; }
    #desktopResizeHandle { display: none; position: absolute; right: 2px; bottom: 2px; width: 17px; height: 17px;
      border-right: 3px solid rgba(180,220,255,.85); border-bottom: 3px solid rgba(180,220,255,.85); cursor: nwse-resize; }
    #desktopEditLayer.active #desktopResizeHandle { display: block; }
  `;
  document.head.appendChild(style);

  const layer = document.createElement('div');
  layer.id = 'desktopEditLayer';
  layer.innerHTML = '<div id="desktopResizeHandle" aria-label="调整大小"></div>';
  document.body.appendChild(layer);
  const resizeHandle = layer.firstElementChild;
  let action = null;

  layer.addEventListener('pointerdown', async (event) => {
    if (!layer.classList.contains('active')) return;
    event.preventDefault();
    const bounds = await api.getBounds();
    action = { type: event.target === resizeHandle ? 'resize' : 'move', startX: event.screenX, startY: event.screenY, ...bounds };
    layer.setPointerCapture(event.pointerId);
  });
  layer.addEventListener('pointermove', (event) => {
    if (!action) return;
    const dx = event.screenX - action.startX;
    const dy = event.screenY - action.startY;
    if (action.type === 'move') api.setBounds({ x: action.x + dx, y: action.y + dy });
    else api.setBounds({ width: action.width + dx, height: action.height + dy });
  });
  layer.addEventListener('pointerup', () => { action = null; });
  layer.addEventListener('pointercancel', () => { action = null; });
  layer.addEventListener('dblclick', () => api.toggleEdit(false));
  api.onEditMode((enabled) => layer.classList.toggle('active', enabled));
  api.onCommand((command, value) => {
    if (command === 'color') {
      selectColor(value);
      localStorage.setItem('standbyDesktopColorIndex', String(value));
    }
    if (command === 'date') {
      document.getElementById('dateToggle').checked = Boolean(value);
      document.getElementById('dateToggle').dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
})();
