// transitions.js (KleinTransition)
// 从原项目 session-transition.js 抽取，保留全部效果与配置，对外暴露 window.KleinTransition 与兼容别名 window.SessionTransition
(function(){
  const Z_INDEX = 25000;
  function rand(a,b){ return Math.random()*(b-a)+a; }
  function pick(arr){ return arr[(Math.random()*arr.length)|0]; }

  const BG_COLORS = ['#1E40FF', '#000000', '#FFFFFF', '#FFD700'];
  const TEXT_COLORS = ['#1E40FF', '#000000', '#FFFFFF', '#FFD700'];
  const TEXTS = ['欢迎', '开始', 'READY', 'GO!', 'HELLO', '新场景'];
  const SWITCH_TEXTS = ['切换中', 'SWITCH', 'LOADING', '下一幕'];

  const CONFIG = {
    GLOBAL: { baseDuration: 650, effectWeights: [1,1,1,1], sparksEnabled: true, sparksProbability: 1 },
    CIRCLE_WIPE: { durationMultiplier: 1.1, textShowDelay: 0.3, textFadeDuration: 0.3 },
    VERTICAL_SHUTTER: { closeDurationMultiplier: 1.0, openDurationMultiplier: 0.78, holdDuration: 430, textShowDelay: 100, sparkTriggerOffset: 250, panelHeightPercent: 56, panelOffsetPercent: -6, bounceOvershoot: 8, bounceLateralOffset: 6, closeEasing: [0.68,-0.25,0.265,1.25], openEasing: [0.68,-0.25,0.265,1.25] },
    HORIZONTAL_SHUTTER: { closeDurationMultiplier: 0.85, openDurationMultiplier: 0.78, holdDuration: 450, textShowDelay: 10, sparkTriggerOffset: 240, panelWidthPercent: 57, panelOffsetPercent: -6.9, bounceOvershoot: 8, bounceLateralOffset: 6, closeEasing: [0.68,-0.25,0.265,1.25], openEasing: [0.68,-0.25,0.265,1.25] },
    IRIS_WIPE: { speedMultiplier: 0.9, holdDuration: 130, textShowDelay: 10, textFadeOutTiming: 0.4, shrinkEasingPower: 5.3, expandEasingPower: 7.3, initialRadius: 0.5, finalRadius: 300 },
    SPARKS: { particleCount: [60,120], particleLife: [45,90], initialVelocity: [4,12], gravity: 0.2, particleSize: [3,6], particleOpacity: 0.8, spreadAngle: [-45,45] }
  };

  function circleWipe(container, color, duration, textArray = TEXTS){
    const cfg = CONFIG.CIRCLE_WIPE;
    const adjustedDuration = Math.round(duration * cfg.durationMultiplier);
    const wipe = document.createElement('div');
    wipe.style.cssText = `position:absolute;inset:0;background:${color.bg};clip-path:circle(0% at 50% 50%);transition:clip-path ${adjustedDuration}ms cubic-bezier(0.65,0,0.35,1);`;
    container.appendChild(wipe);
    const text = document.createElement('div');
    text.textContent = pick(textArray);
    text.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:${color.text};font-size:3rem;font-weight:900;opacity:0;transition:opacity ${adjustedDuration*cfg.textFadeDuration}ms ease ${adjustedDuration*cfg.textShowDelay}ms;`;
    wipe.appendChild(text);
    requestAnimationFrame(()=>{ wipe.style.clipPath = 'circle(150% at 50% 50%)'; text.style.opacity = '1'; });
    setTimeout(()=>{ text.style.transition = `opacity ${adjustedDuration*cfg.textFadeDuration}ms ease`; text.style.opacity = '0'; wipe.style.transition = `clip-path ${adjustedDuration}ms cubic-bezier(0.65,0,0.35,1)`; wipe.style.clipPath = 'circle(0% at 50% 50%)'; }, adjustedDuration);
    setTimeout(()=>wipe.remove(), adjustedDuration*2);
  }

  function verticalShutter(container, color, duration, hasSparks, textArray = TEXTS){
    const cfg = CONFIG.VERTICAL_SHUTTER;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;';
    container.appendChild(wrapper);
    const top = document.createElement('div');
    top.style.cssText = `position:absolute;left:-10%;top:${cfg.panelOffsetPercent}%;width:120%;height:${cfg.panelHeightPercent}%;background:${color.bg};transform:translateY(-100%);will-change:transform;`;
    const bottom = document.createElement('div');
    bottom.style.cssText = `position:absolute;left:-10%;bottom:${cfg.panelOffsetPercent}%;width:120%;height:${cfg.panelHeightPercent}%;background:${color.bg};transform:translateY(100%);will-change:transform;`;
    wrapper.appendChild(top); wrapper.appendChild(bottom);
    const text = document.createElement('div');
    text.textContent = pick(textArray);
    text.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:${color.text};font-size:2.5rem;font-weight:900;opacity:0;z-index:2;pointer-events:none;transition:opacity ${duration*0.3}ms ease ${duration*0.5}ms;`;
    container.appendChild(text);
    const closeDuration = Math.max(240, Math.round(duration * cfg.closeDurationMultiplier));
    const easingStr = `cubic-bezier(${cfg.closeEasing.join(',')})`;
    const closeTiming = { duration: closeDuration, easing: easingStr, fill: 'forwards' };
    top.animate([{ transform: 'translateY(-105%) translateX(0)' }, { transform: `translateY(-4%) translateX(-${cfg.bounceLateralOffset}%)`, offset: 0.58 }, { transform: `translateY(${cfg.bounceOvershoot}%) translateX(${cfg.bounceLateralOffset/1.5}%)`, offset: 0.8 }, { transform: 'translateY(0%) translateX(0)' }], closeTiming);
    bottom.animate([{ transform: 'translateY(105%) translateX(0)' }, { transform: `translateY(4%) translateX(${cfg.bounceLateralOffset}%)`, offset: 0.58 }, { transform: `translateY(-${cfg.bounceOvershoot}%) translateX(-${cfg.bounceLateralOffset/1.5}%)`, offset: 0.8 }, { transform: 'translateY(0%) translateX(0)' }], closeTiming);
    requestAnimationFrame(()=>{ setTimeout(()=>{ text.style.opacity = '1'; }, cfg.textShowDelay); });
    if(hasSparks){ setTimeout(()=>createSparks(container, window.innerWidth/2, window.innerHeight/2, color.text), closeDuration - cfg.sparkTriggerOffset); }
    setTimeout(()=>{
      text.style.opacity = '0';
      const openDuration = Math.max(240, Math.round(duration * cfg.openDurationMultiplier));
      const openEasingStr = `cubic-bezier(${cfg.openEasing.join(',')})`;
      const openTiming = { duration: openDuration, easing: openEasingStr, fill: 'forwards' };
      const topAnim = top.animate([{ transform: 'translateY(0%) translateX(0)' }, { transform: `translateY(-10%) translateX(-${cfg.bounceLateralOffset/1.5}%)`, offset: 0.24 }, { transform: 'translateY(-105%) translateX(0)' }], openTiming);
      const bottomAnim = bottom.animate([{ transform: 'translateY(0%) translateX(0)' }, { transform: `translateY(10%) translateX(${cfg.bounceLateralOffset/1.5}%)`, offset: 0.24 }, { transform: 'translateY(105%) translateX(0)' }], openTiming);
      Promise.allSettled([topAnim.finished, bottomAnim.finished]).then(()=>{ wrapper.remove(); if(text.isConnected) text.remove(); });
    }, closeDuration + cfg.holdDuration);
    setTimeout(()=>{ if(wrapper.isConnected) wrapper.remove(); if(text.isConnected) text.remove(); }, duration*2+400);
  }

  function horizontalShutter(container, color, duration, hasSparks, textArray = TEXTS){
    const cfg = CONFIG.HORIZONTAL_SHUTTER;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;';
    container.appendChild(wrapper);
    const left = document.createElement('div');
    left.style.cssText = `position:absolute;left:${cfg.panelOffsetPercent}%;top:-10%;width:${cfg.panelWidthPercent}%;height:120%;background:${color.bg};transform:translateX(-100%);will-change:transform;`;
    const right = document.createElement('div');
    right.style.cssText = `position:absolute;right:${cfg.panelOffsetPercent}%;top:-10%;width:${cfg.panelWidthPercent}%;height:120%;background:${color.bg};transform:translateX(100%);will-change:transform;`;
    wrapper.appendChild(left); wrapper.appendChild(right);
    const text = document.createElement('div');
    text.textContent = pick(textArray);
    text.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:${color.text};font-size:2.5rem;font-weight:900;opacity:0;z-index:2;pointer-events:none;transition:opacity ${duration*0.3}ms ease ${duration*0.5}ms;`;
    container.appendChild(text);
    const closeDuration = Math.max(240, Math.round(duration * cfg.closeDurationMultiplier));
    const easingStr = `cubic-bezier(${cfg.closeEasing.join(',')})`;
    const closeTiming = { duration: closeDuration, easing: easingStr, fill: 'forwards' };
    left.animate([{ transform: 'translateX(-105%) translateY(0)' }, { transform: `translateX(-4%) translateY(-${cfg.bounceLateralOffset}%)`, offset: 0.58 }, { transform: `translateX(${cfg.bounceOvershoot}%) translateY(${cfg.bounceLateralOffset/1.5}%)`, offset: 0.8 }, { transform: 'translateX(0%) translateY(0)' }], closeTiming);
    right.animate([{ transform: 'translateX(105%) translateY(0)' }, { transform: `translateX(4%) translateY(${cfg.bounceLateralOffset}%)`, offset: 0.58 }, { transform: `translateX(-${cfg.bounceOvershoot}%) translateY(-${cfg.bounceLateralOffset/1.5}%)`, offset: 0.8 }, { transform: 'translateX(0%) translateY(0)' }], closeTiming);
    requestAnimationFrame(()=>{ setTimeout(()=>{ text.style.opacity = '1'; }, cfg.textShowDelay); });
    if(hasSparks){ setTimeout(()=>createSparks(container, window.innerWidth/2, window.innerHeight/2, color.text), closeDuration - cfg.sparkTriggerOffset); }
    setTimeout(()=>{
      text.style.opacity = '0';
      const openDuration = Math.max(240, Math.round(duration * cfg.openDurationMultiplier));
      const openEasingStr = `cubic-bezier(${cfg.openEasing.join(',')})`;
      const openTiming = { duration: openDuration, easing: openEasingStr, fill: 'forwards' };
      const leftAnim = left.animate([{ transform: 'translateX(0%) translateY(0)' }, { transform: `translateX(-10%) translateY(-${cfg.bounceLateralOffset/1.5}%)`, offset: 0.24 }, { transform: 'translateX(-105%) translateY(0)' }], openTiming);
      const rightAnim = right.animate([{ transform: 'translateX(0%) translateY(0)' }, { transform: `translateX(10%) translateY(${cfg.bounceLateralOffset/1.5}%)`, offset: 0.24 }, { transform: 'translateX(105%) translateY(0)' }], openTiming);
      Promise.allSettled([leftAnim.finished, rightAnim.finished]).then(()=>{ wrapper.remove(); if(text.isConnected) text.remove(); });
    }, closeDuration + cfg.holdDuration);
    setTimeout(()=>{ if(wrapper.isConnected) wrapper.remove(); if(text.isConnected) text.remove(); }, duration*2+400);
  }

  function createSparks(container, cx, cy, sparkColor){
    const cfg = CONFIG.SPARKS;
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:3;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const particles = [];
    const N = Math.floor(rand(cfg.particleCount[0], cfg.particleCount[1]));
    for(let i=0;i<N;i++){
      const angle = rand(0, Math.PI*2);
      const speed = rand(cfg.initialVelocity[0], cfg.initialVelocity[1]);
      particles.push({ x: cx, y: cy, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 0, maxLife: rand(cfg.particleLife[0], cfg.particleLife[1]), size: rand(cfg.particleSize[0], cfg.particleSize[1]) });
    }
    let raf;
    function frame(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p=>{ p.life++; p.x += p.vx; p.y += p.vy; p.vy += cfg.gravity; const alpha = (1 - p.life/p.maxLife) * cfg.particleOpacity; ctx.fillStyle = sparkColor; ctx.globalAlpha = alpha; ctx.fillRect(p.x, p.y, p.size, p.size); });
      for(let i=particles.length-1;i>=0;i--){ if(particles[i].life>=particles[i].maxLife){ particles.splice(i,1);} }
      if(particles.length>0) raf = requestAnimationFrame(frame); else { cancelAnimationFrame(raf); canvas.remove(); }
    }
    raf = requestAnimationFrame(frame);
  }

  function irisWipe(container, color, duration, textArray = TEXTS){
    const cfg = CONFIG.IRIS_WIPE;
    const width = window.innerWidth, height = window.innerHeight;
    const maxRadius = Math.hypot(width, height);
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', width); svg.setAttribute('height', height); svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    const defs = document.createElementNS(svgNS, 'defs');
    const mask = document.createElementNS(svgNS, 'mask');
    const maskId = `iris-mask-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    mask.setAttribute('id', maskId);
    const maskRect = document.createElementNS(svgNS, 'rect');
    maskRect.setAttribute('width', width); maskRect.setAttribute('height', height); maskRect.setAttribute('fill', 'white');
    mask.appendChild(maskRect);
    const hole = document.createElementNS(svgNS, 'circle');
    hole.setAttribute('cx', width/2); hole.setAttribute('cy', height/2);
    hole.setAttribute('r', maxRadius * cfg.initialRadius / 100); hole.setAttribute('fill', 'black');
    mask.appendChild(hole);
    defs.appendChild(mask); svg.appendChild(defs);
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('width', width); rect.setAttribute('height', height); rect.setAttribute('fill', color.bg); rect.setAttribute('mask', `url(#${maskId})`);
    svg.appendChild(rect); container.appendChild(svg);
    const text = document.createElement('div');
    text.textContent = pick(textArray);
    text.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:${color.text};font-size:2.5rem;font-weight:900;opacity:0;z-index:2;pointer-events:none;transition:opacity ${duration*cfg.textFadeOutTiming}ms ease ${duration*0.4}ms;`;
    container.appendChild(text);
    requestAnimationFrame(()=>{ setTimeout(()=>{ text.style.opacity = '1'; }, cfg.textShowDelay); });
    const irisDuration = Math.round(duration / cfg.speedMultiplier);
    const shrinkStart = performance.now();
    function shrink(now){
      const progress = Math.min((now - shrinkStart) / irisDuration, 1);
      const eased = 1 - Math.pow(1 - progress, cfg.shrinkEasingPower);
      const current = Math.max(0.0001, maxRadius * cfg.finalRadius / 100 * (1 - eased));
      hole.setAttribute('r', current);
      if(progress < 1){ requestAnimationFrame(shrink); } else {
        text.style.transition = `opacity ${irisDuration*cfg.textFadeOutTiming}ms ease`;
        text.style.opacity = '0';
        setTimeout(()=>{ const expandStart = performance.now(); function expand(now2){ const progress2 = Math.min((now2 - expandStart) / irisDuration, 1); const eased2 = Math.pow(progress2, cfg.expandEasingPower); const current2 = Math.max(0.0001, maxRadius * cfg.finalRadius / 100 * eased2); hole.setAttribute('r', current2); if(progress2 < 1){ requestAnimationFrame(expand); } } requestAnimationFrame(expand); }, cfg.holdDuration);
      }
    }
    requestAnimationFrame(shrink);
    setTimeout(()=>{ svg.remove(); text.remove(); }, irisDuration*2 + cfg.holdDuration + 350);
  }

  function addCurtainDecor(){ /* 预留占位，当前不添加额外装饰 */ }

  async function playOnce(useSwitchTexts = false){
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `position:fixed;inset:0;z-index:${Z_INDEX};pointer-events:none;`;
      document.body.appendChild(overlay);
      const color = { bg: pick(BG_COLORS), text: pick(TEXT_COLORS) };
      while(color.bg === color.text){ color.text = pick(TEXT_COLORS); }
      const hasSparks = CONFIG.GLOBAL.sparksEnabled && (Math.random() < CONFIG.GLOBAL.sparksProbability);
      const weights = CONFIG.GLOBAL.effectWeights;
      const totalWeight = weights.reduce((a,b)=>a+b, 0);
      let random = Math.random() * totalWeight; let selectedIndex = 0;
      for(let i=0;i<weights.length;i++){ random -= weights[i]; if(random <= 0){ selectedIndex = i; break; } }
      const effects = [
        { fn: circleWipe, needSparks: false },
        { fn: verticalShutter, needSparks: true },
        { fn: horizontalShutter, needSparks: true },
        { fn: irisWipe, needSparks: false }
      ];
      const effect = effects[selectedIndex];
      const duration = CONFIG.GLOBAL.baseDuration;
      const textArray = useSwitchTexts ? SWITCH_TEXTS : TEXTS;
      addCurtainDecor(overlay, color);
      if(effect.needSparks){ effect.fn(overlay, color, duration, hasSparks, textArray); } else { effect.fn(overlay, color, duration, textArray); }
      setTimeout(()=>{ overlay.remove(); resolve(); }, duration*2+500);
    });
  }

  const api = { play: () => playOnce(false), playSwitch: () => playOnce(true) };
  
  // 支持指定特定效果播放
  api.play = function(effectName){
    const effectMap = {
      'circleWipe': 0,
      'verticalShutter': 1,
      'horizontalShutter': 2,
      'irisWipe': 3
    };
    
    if(effectName && effectMap[effectName] !== undefined){
      // 临时保存原配置
      const originalWeights = [...CONFIG.GLOBAL.effectWeights];
      // 设置只播放指定效果
      CONFIG.GLOBAL.effectWeights = [0, 0, 0, 0];
      CONFIG.GLOBAL.effectWeights[effectMap[effectName]] = 1;
      // 播放
      const promise = playOnce(false);
      // 恢复原配置
      setTimeout(() => {
        CONFIG.GLOBAL.effectWeights = originalWeights;
      }, 100);
      return promise;
    } else {
      // 默认随机播放
      return playOnce(false);
    }
  };
  
  api.playSwitch = () => playOnce(true);
  
  // 动态配置接口
  api.setConfig = function(cfg){
    if(cfg.baseDuration !== undefined) CONFIG.GLOBAL.baseDuration = cfg.baseDuration;
    if(cfg.sparksEnabled !== undefined) CONFIG.GLOBAL.sparksEnabled = cfg.sparksEnabled;
    if(cfg.sparksProbability !== undefined) CONFIG.GLOBAL.sparksProbability = cfg.sparksProbability;
    if(cfg.effectWeights) {
      // 支持对象格式: { circleWipe: 1, verticalShutter: 1, horizontalShutter: 1, irisWipe: 1 }
      if(typeof cfg.effectWeights === 'object' && !Array.isArray(cfg.effectWeights)){
        const map = { circleWipe: 0, verticalShutter: 1, horizontalShutter: 2, irisWipe: 3 };
        Object.keys(cfg.effectWeights).forEach(key => {
          const index = map[key];
          if(index !== undefined) CONFIG.GLOBAL.effectWeights[index] = cfg.effectWeights[key];
        });
      } else {
        CONFIG.GLOBAL.effectWeights = cfg.effectWeights;
      }
    }
  };
  api.getConfig = function(){ 
    return { 
      baseDuration: CONFIG.GLOBAL.baseDuration,
      sparksEnabled: CONFIG.GLOBAL.sparksEnabled,
      sparksProbability: CONFIG.GLOBAL.sparksProbability,
      effectWeights: {
        circleWipe: CONFIG.GLOBAL.effectWeights[0],
        verticalShutter: CONFIG.GLOBAL.effectWeights[1],
        horizontalShutter: CONFIG.GLOBAL.effectWeights[2],
        irisWipe: CONFIG.GLOBAL.effectWeights[3]
      }
    };
  };
  
  window.KleinTransition = api;
  window.SessionTransition = api; // 兼容别名
})();
