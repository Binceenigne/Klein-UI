// background.js (KleinBG)
// 轻量级随机背景纹理：方格/点阵/动态几何，缓慢漂移与呼吸式缩放
// 从原项目 background-texture.js 抽取，API 兼容并提供别名：window.KleinBG 与 window.BGFX
(function(){
  const BGFX = {};
  let container, canvas, ctx, rafId;
  let shapes = [];
  let startTime = performance.now();
  let patternType = 'grid';
  let patternCfg = null;
  let dpr = 1;
  const mouse = { x: -1e6, y: -1e6 };
  let drift = { x: 0.1, y: 0.12 };
  let themeColor = { r: 30, g: 64, b: 255 }; // 主题色 RGB

  function createContainer(){
    container = document.getElementById('bgfx');
    if(!container){
      container = document.createElement('div');
      container.id = 'bgfx';
      document.body.prepend(container);
    }
    canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');
    onResize();
  }

  function rand(min, max){ return Math.random() * (max - min) + min; }
  function pick(arr){ return arr[(Math.random()*arr.length)|0]; }

  function makeShapes(){
    const W = canvas.width, H = canvas.height;
    shapes = [];
    const count = Math.floor(60 + (W * H) / (1920*1080) * 60);
    const types = ['square', 'circle', 'triangle'];
    for(let i=0;i<count;i++){
      const type = types[(Math.random()*types.length)|0];
      shapes.push({
        type,
        x0: Math.random()*W,
        y0: Math.random()*H,
        ampX: rand(10, 60),
        ampY: rand(10, 60),
        freq: rand(0.05, 0.18),
        phase: rand(0, Math.PI*2),
        size: rand(6, 22),
        rot: rand(0, Math.PI*2),
        rotSpeed: rand(-0.15, 0.15),
        color: `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${rand(0.08, 0.14).toFixed(2)})`
      });
    }
  }

  function drawPattern(alpha){
    const W = canvas.width, H = canvas.height;
    const step = patternCfg.step * dpr;
    const t = (performance.now()-startTime)/1000;
    const ox = Math.sin(t*drift.x)*step*0.25;
    const oy = Math.cos(t*drift.y)*step*0.25;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (patternType === 'grid') {
      ctx.strokeStyle = patternCfg.color;
      ctx.lineWidth = patternCfg.lineWidth;
      for(let x = ox % step; x < W; x += step){
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for(let y = oy % step; y < H; y += step){
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    } else if (patternType === 'cross') {
      ctx.strokeStyle = patternCfg.color;
      ctx.lineWidth = patternCfg.lineWidth;
      const len = patternCfg.crossLen * dpr;
      for(let y = oy % step; y < H; y += step){
        for(let x = ox % step; x < W; x += step){
          ctx.beginPath();
          ctx.moveTo(x - len, y); ctx.lineTo(x + len, y);
          ctx.moveTo(x, y - len); ctx.lineTo(x, y + len);
          ctx.stroke();
        }
      }
    } else if (patternType === 'dots') {
      ctx.fillStyle = patternCfg.color;
      const r = patternCfg.dotRadius * dpr;
      for(let y = oy % step; y < H; y += step){
        for(let x = ox % step; x < W; x += step){
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  function drawShapes(){
    const t = (performance.now()-startTime)/1000;
    shapes.forEach(s => {
      let x = s.x0 + Math.sin(t*s.freq + s.phase) * s.ampX;
      let y = s.y0 + Math.cos(t*s.freq*1.1 + s.phase) * s.ampY;
      const dx = x - mouse.x, dy = y - mouse.y;
      const dist = Math.hypot(dx, dy);
      const R = 160 * dpr;
      if (dist < R) {
        const strength = (1 - dist / R) * 22 * dpr;
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);
        x += nx * strength;
        y += ny * strength;
      }
      const k = 0.85 + 0.25 * Math.sin(t*s.freq*0.8 + s.phase*1.3);
      const size = s.size * k * devicePixelRatio;
      const rot = s.rot + s.rotSpeed * t;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = s.color;
      switch(s.type){
        case 'square': ctx.fillRect(-size/2, -size/2, size, size); break;
        case 'circle': ctx.beginPath(); ctx.arc(0,0,size/2,0,Math.PI*2); ctx.fill(); break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -size/1.2);
          ctx.lineTo(size/1.15, size/1.2);
          ctx.lineTo(-size/1.15, size/1.2);
          ctx.closePath(); ctx.fill();
          break;
      }
      ctx.restore();
    });
  }

  function loop(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    drawPattern(1);
    drawShapes();
    rafId = requestAnimationFrame(loop);
  }

  function onResize(){
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(1,0,0,1,0,0);
  }

  BGFX.stop = function(){
    cancelAnimationFrame(rafId);
    if(container && container.parentNode){ container.parentNode.removeChild(container); }
  };

  function randomizePattern(keepPatternType = false){
    if(!keepPatternType) {
      const r = Math.random();
      patternType = r < 0.5 ? 'grid' : (r < 0.8 ? 'cross' : 'dots');
    }
    const opacity = Math.random()*0.06 + 0.07;
    const color = `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${opacity.toFixed(3)})`;
    const step = Math.floor( rand(22, 54) );
    patternCfg = {
      color,
      step,
      lineWidth: rand(1.5, 2.5),
      dotRadius: rand(2.5, 4.5),
      crossLen: rand(2.0, 3.3)
    };
    drift.x = rand(0.06, 0.16);
    drift.y = rand(0.06, 0.16);
  }

  BGFX.start = function(){
    if(rafId) cancelAnimationFrame(rafId);
    if(!container) createContainer();
    randomizePattern();
    makeShapes();
    loop();
  };
  BGFX.reroll = function(){ randomizePattern(); makeShapes(); };
  
  // 动态配置接口
  BGFX.setConfig = function(cfg){
    if(cfg.patternType !== undefined) {
      patternType = cfg.patternType;
      randomizePattern(true); // 保持指定的图案类型
    }
    if(cfg.step !== undefined) patternCfg.step = cfg.step;
    if(cfg.lineWidth !== undefined) patternCfg.lineWidth = cfg.lineWidth;
    if(cfg.dotRadius !== undefined) patternCfg.dotRadius = cfg.dotRadius;
    if(cfg.crossLen !== undefined) patternCfg.crossLen = cfg.crossLen;
    if(cfg.opacity !== undefined) {
      patternCfg.color = `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${cfg.opacity.toFixed(3)})`;
    }
    if(cfg.themeColor !== undefined) {
      themeColor = cfg.themeColor;
      patternCfg.color = `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${cfg.opacity || 0.1})`;
      makeShapes(); // 重新生成图形以应用新颜色
    }
    if(cfg.driftSpeed !== undefined) {
      drift.x = 0.1 * cfg.driftSpeed;
      drift.y = 0.12 * cfg.driftSpeed;
    }
    if(cfg.shapeCount !== undefined) { 
      const W = canvas.width, H = canvas.height;
      const baseCount = Math.floor(60 + (W * H) / (1920*1080) * 60);
      const targetCount = Math.floor(baseCount * cfg.shapeCount);
      if(targetCount !== shapes.length) makeShapes();
    }
  };
  BGFX.getConfig = function(){
    return { 
      patternType, 
      step: patternCfg.step,
      lineWidth: patternCfg.lineWidth,
      dotRadius: patternCfg.dotRadius,
      crossLen: patternCfg.crossLen,
      opacity: parseFloat(patternCfg.color.match(/[\d.]+\)$/)?.[0]) || 0.1, 
      driftSpeed: drift.x / 0.1,
      shapeCount: shapes.length,
      themeColor 
    };
  };

  function init(){
    createContainer();
    randomizePattern();
    makeShapes();
    loop();
    window.addEventListener('resize', () => { onResize(); makeShapes(); }, { passive: true });
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX * dpr;
      mouse.y = e.clientY * dpr;
    }, { passive: true });
    window.addEventListener('mouseleave', () => { mouse.x = -1e6; mouse.y = -1e6; });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露 API：兼容原 BGFX，同时提供 KleinBG 别名
  window.BGFX = BGFX;
  window.KleinBG = BGFX;
})();
