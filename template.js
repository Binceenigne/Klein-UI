// template.js
// 纯演示交互：上传/预览、Toast/Notice、Lightbox、Sidebar、转场触发

const UI = {
  els: {},
  init() {
    this.cache();
    this.bind();
    this.updateUploadState();
  },
  cache() {
    this.els.uploadArea = document.getElementById('uploadArea');
    this.els.fileInput = document.getElementById('fileInput');
    this.els.selectFileBtn = document.getElementById('selectFileBtn');
    this.els.preview = document.getElementById('previewContainer');
    this.els.notice = document.getElementById('noticeBar');
    this.els.lightbox = document.getElementById('lightbox');
    this.els.lightboxImg = document.getElementById('lightboxImage');
    this.els.lightboxBackdrop = document.getElementById('lightboxBackdrop');
    this.els.lightboxClose = document.getElementById('lightboxClose');
    this.els.sidebar = document.getElementById('sidebar');
    this.els.sidebarToggle = document.getElementById('sidebarToggle');
    this.els.sidebarFab = document.getElementById('sidebarFab');
    this.els.triggerTransition = document.getElementById('triggerTransition');
    this.els.triggerSwitch = document.getElementById('triggerSwitch');
    this.els.triggerToast = document.getElementById('triggerToast');
    this.els.triggerNotice = document.getElementById('triggerNotice');
    this.els.triggerLightbox = document.getElementById('triggerLightbox');
    this.els.triggerModal = document.getElementById('triggerModal');
    this.els.uploadTitle = document.querySelector('#uploadArea h3');
    this.els.uploadInfo = document.querySelector('#uploadArea p');
    this.state = { items: [] };
  },
  bind() {
    const E = this.els;
    // 上传与拖拽
    E.uploadArea?.addEventListener('click', () => E.fileInput?.click());
    E.selectFileBtn?.addEventListener('click', (e) => { e.stopPropagation(); E.fileInput?.click(); });
    E.fileInput?.addEventListener('change', (e) => { const files = Array.from(e.target.files||[]); this.addFiles(files); e.target.value=''; });
    E.uploadArea?.addEventListener('dragover', (e)=>{ e.preventDefault(); E.uploadArea.classList.add('drag-over'); });
    E.uploadArea?.addEventListener('dragleave', (e)=>{ e.preventDefault(); E.uploadArea.classList.remove('drag-over'); });
    E.uploadArea?.addEventListener('drop', (e)=>{ e.preventDefault(); E.uploadArea.classList.remove('drag-over'); this.addFiles(Array.from(e.dataTransfer.files||[])); });

    // 预览点击（删除/大图）
    E.preview?.addEventListener('click', (e)=>{
      const rm = e.target.closest('[data-remove]');
      if(rm){ const id = rm.getAttribute('data-remove'); this.state.items = this.state.items.filter(x=>String(x.id)!==String(id)); this.render(); return; }
      const img = e.target.closest('img');
      if(img){ this.openLightbox(img.src); }
    });

    // Lightbox
    E.lightboxBackdrop?.addEventListener('click', ()=> this.closeLightbox());
    E.lightboxClose?.addEventListener('click', ()=> this.closeLightbox());

    // Sidebar
    E.sidebarToggle?.addEventListener('click', ()=>{ E.sidebar?.classList.toggle('expanded'); E.sidebar?.classList.toggle('collapsed'); this.updateFab(); });
    E.sidebarFab?.addEventListener('click', ()=>{ if(!E.sidebar.classList.contains('expanded')){ E.sidebar.classList.add('expanded'); E.sidebar.classList.remove('collapsed'); this.updateFab(); } });

    // 演示按钮
    E.triggerTransition?.addEventListener('click', ()=> window.KleinTransition?.play());
    E.triggerSwitch?.addEventListener('click', ()=> window.KleinTransition?.playSwitch());
    E.triggerToast?.addEventListener('click', ()=> this.toast('这是一个演示 Toast'));
    E.triggerNotice?.addEventListener('click', ()=> this.notice('演示 Notice：底部气泡提示'));
    E.triggerModal?.addEventListener('click', ()=> document.getElementById('confirmModal').style.display='flex');
    E.triggerLightbox?.addEventListener('click', ()=>{
      if(this.state.items[0]) this.openLightbox(this.state.items[0].url);
      else this.openLightbox('data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E40FF"/><stop offset="100%" stop-color="#4D6CFF"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>'));
    });

    // 配置面板控制
    this.bindConfigPanel();

    // 初始 FAB 显示状态
    this.updateFab();
  },
  bindConfigPanel() {
    // 折叠面板控制
    document.querySelectorAll('.collapse-trigger').forEach(trigger => {
      trigger.addEventListener('click', ()=>{
        const targetId = trigger.getAttribute('data-target');
        const target = document.getElementById(targetId);
        if(!target) return;
        
        const isExpanded = target.classList.contains('expanded');
        if(isExpanded){
          target.classList.remove('expanded');
          target.classList.add('collapsed');
          trigger.classList.remove('active');
        } else {
          target.classList.remove('collapsed');
          target.classList.add('expanded');
          trigger.classList.add('active');
        }
      });
    });

    // 主题颜色选择 - 预设色板
    const themePicker = document.querySelector('.theme-picker');
    themePicker?.addEventListener('click', (e)=>{
      const swatch = e.target.closest('.theme-swatch');
      if(!swatch) return;
      themePicker.querySelectorAll('.theme-swatch').forEach(s=>s.classList.remove('active'));
      swatch.classList.add('active');
      const color = swatch.getAttribute('data-color');
      this.applyThemeColor(color);
      this.notice(`已切换到 ${swatch.title} 主题`);
    });

    // 自定义颜色选择器
    const customColorPicker = document.getElementById('customColorPicker');
    customColorPicker?.addEventListener('input', (e)=>{
      themePicker.querySelectorAll('.theme-swatch').forEach(s=>s.classList.remove('active'));
      const hexColor = e.target.value;
      this.applyThemeColor('custom', hexColor);
      this.notice(`已应用自定义颜色: ${hexColor}`);
    });

    // 背景控制 - 网格密度
    const bgDensity = document.getElementById('bgDensity');
    const bgDensityValue = document.getElementById('bgDensityValue');
    bgDensity?.addEventListener('input', (e)=>{
      const val = e.target.value;
      bgDensityValue.textContent = val;
      window.KleinBG?.setConfig({ step: parseInt(val) });
    });

    // 背景控制 - 不透明度
    const bgOpacity = document.getElementById('bgOpacity');
    const bgOpacityValue = document.getElementById('bgOpacityValue');
    bgOpacity?.addEventListener('input', (e)=>{
      const val = e.target.value;
      bgOpacityValue.textContent = val + '%';
      window.KleinBG?.setConfig({ opacity: parseFloat(val)/100 });
    });

    // 背景控制 - 线条/点粗细
    const bgThickness = document.getElementById('bgThickness');
    const bgThicknessValue = document.getElementById('bgThicknessValue');
    bgThickness?.addEventListener('input', (e)=>{
      const val = parseFloat(e.target.value);
      bgThicknessValue.textContent = val.toFixed(1);
      window.KleinBG?.setConfig({ 
        lineWidth: val,
        dotRadius: val * 1.5,
        crossLen: val * 1.2
      });
    });

    // 背景控制 - 漂移速度
    const bgDrift = document.getElementById('bgDrift');
    const bgDriftValue = document.getElementById('bgDriftValue');
    bgDrift?.addEventListener('input', (e)=>{
      const val = parseFloat(e.target.value);
      bgDriftValue.textContent = val.toFixed(1) + 'x';
      window.KleinBG?.setConfig({ driftSpeed: val });
    });

    // 背景控制 - 图案类型
    document.querySelectorAll('input[name="bgPattern"]').forEach(radio => {
      radio.addEventListener('change', (e)=>{
        if(e.target.checked){
          window.KleinBG?.setConfig({ patternType: e.target.value });
          this.notice(`已切换到 ${e.target.value} 图案`);
        }
      });
    });

    // 背景控制 - 几何图形开关
    const bgShapesToggle = document.getElementById('bgShapesToggle');
    bgShapesToggle?.addEventListener('change', (e)=>{
      window.KleinBG?.setConfig({ shapeCount: e.target.checked ? 1 : 0 });
    });

    // 转场控制 - 动画速度
    const transSpeed = document.getElementById('transSpeed');
    const transSpeedValue = document.getElementById('transSpeedValue');
    transSpeed?.addEventListener('input', (e)=>{
      const val = e.target.value;
      transSpeedValue.textContent = val + 'ms';
      window.KleinTransition?.setConfig({ baseDuration: parseInt(val) });
    });

    // 转场控制 - 火花特效
    const transSparksToggle = document.getElementById('transSparksToggle');
    transSparksToggle?.addEventListener('change', (e)=>{
      window.KleinTransition?.setConfig({ sparksEnabled: e.target.checked });
    });

    // 转场控制 - 效果权重
    const weightMap = {
      'weightCircle': 'circleWipe',
      'weightVertical': 'verticalShutter',
      'weightHorizontal': 'horizontalShutter',
      'weightIris': 'irisWipe'
    };
    
    Object.keys(weightMap).forEach(id => {
      const slider = document.getElementById(id);
      const valueLabel = document.getElementById(id + 'Value');
      slider?.addEventListener('input', (e)=>{
        const val = parseFloat(e.target.value);
        valueLabel.textContent = val.toFixed(1);
        const currentWeights = window.KleinTransition?.getConfig()?.effectWeights || {};
        currentWeights[weightMap[id]] = val;
        window.KleinTransition?.setConfig({ effectWeights: currentWeights });
      });
    });
  },
  applyThemeColor(color, customHex = null) {
    const root = document.documentElement;
    const colorMap = {
      'klein-blue': '#1E40FF',
      'purple': '#AF52DE',
      'pink': '#FF2D55',
      'orange': '#FF9500',
      'green': '#34C759',
      'teal': '#5AC8FA',
      'indigo': '#5856D6',
      'sunset': '#FF6B6B'
    };
    const hex = customHex || colorMap[color] || '#1E40FF';
    root.style.setProperty('--klein-blue', hex);
    
    // 计算亮度并决定文字颜色
    const rgb = this.hexToRgb(hex);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    const textColor = luminance > 0.6 ? '#000000' : '#FFFFFF';
    root.style.setProperty('--text-on-primary', textColor);
    
    // 生成浅色变体
    const lightVariants = this.generateLightVariants(rgb);
    root.style.setProperty('--klein-blue-100', lightVariants.c100);
    root.style.setProperty('--klein-blue-200', lightVariants.c200);
    root.style.setProperty('--klein-blue-300', lightVariants.c300);
    
    // 应用到背景纹理和图形
    window.KleinBG?.setConfig({ 
      themeColor: rgb,
      opacity: window.KleinBG?.getConfig()?.opacity || 0.1
    });
    
    // 更新按钮、徽章等元素
    const gradients = document.querySelectorAll('.badge, .notice');
    gradients.forEach(el => {
      if(color === 'sunset') {
        el.style.background = 'linear-gradient(135deg, #FF6B6B, #FFD93D)';
        el.style.color = '#FFFFFF';
      } else {
        el.style.background = hex;
        el.style.color = textColor;
      }
    });
    
    // 更新主按钮文字颜色
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.style.color = textColor;
    });
  },
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 30, g: 64, b: 255 };
  },
  generateLightVariants(rgb) {
    // 生成浅色变体: 混合白色以获得更浅的颜色
    const blend = (color, percent) => {
      return {
        r: Math.round(color.r + (255 - color.r) * percent),
        g: Math.round(color.g + (255 - color.g) * percent),
        b: Math.round(color.b + (255 - color.b) * percent)
      };
    };
    
    const c100 = blend(rgb, 0.90); // 90% 白色混合
    const c200 = blend(rgb, 0.80); // 80% 白色混合
    const c300 = blend(rgb, 0.70); // 70% 白色混合
    
    return {
      c100: `rgb(${c100.r}, ${c100.g}, ${c100.b})`,
      c200: `rgb(${c200.r}, ${c200.g}, ${c200.b})`,
      c300: `rgb(${c300.r}, ${c300.g}, ${c300.b})`
    };
  },
  async addFiles(files){
    const imgFiles = files.filter(f=>/^image\//.test(f.type));
    for(const f of imgFiles){
      const url = URL.createObjectURL(f);
      this.state.items.push({ id: Date.now()+Math.random(), name: f.name, url });
    }
    this.render();
  },
  render(){
    const E = this.els;
    E.preview.innerHTML = '';
    this.state.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `<img src="${item.url}" alt="${item.name}"><button class="preview-remove" data-remove="${item.id}">&times;</button>`;
      E.preview.appendChild(div);
    });
    this.updateUploadState();
  },
  updateUploadState(){
    const E = this.els; const count = this.state?.items?.length||0;
    if(count>0){
      E.uploadArea?.classList.add('ready');
      if(E.uploadTitle) E.uploadTitle.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> 点击继续添加图片';
      if(E.uploadInfo) E.uploadInfo.innerHTML = `<i class=\"fas fa-info-circle\"></i> 已选择 ${count} 张图片，可继续添加或预览`;
    } else {
      E.uploadArea?.classList.remove('ready');
      if(E.uploadTitle) E.uploadTitle.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> 拖拽图片到此处或点击上传';
      if(E.uploadInfo) E.uploadInfo.innerHTML = '<i class="fas fa-info-circle"></i> 支持 JPG、PNG、JPEG 格式，单张建议不超过 5MB';
    }
  },
  toast(message){
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.body.appendChild(toast);
    requestAnimationFrame(()=> toast.classList.add('toast-show'));
    setTimeout(()=>{ toast.classList.remove('toast-show'); toast.classList.add('toast-hide'); setTimeout(()=>toast.remove(), 400); }, 2500);
  },
  notice(text){
    const bar = this.els.notice; if(!bar) return;
    bar.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
    bar.style.display = 'block';
    bar.classList.add('notice-show');
    clearTimeout(this._nt);
    this._nt = setTimeout(()=>{ bar.classList.remove('notice-show'); bar.classList.add('notice-hide'); setTimeout(()=>{ bar.style.display='none'; bar.classList.remove('notice-hide'); }, 300); }, 2200);
  },
  openLightbox(src){ const E = this.els; if(!E.lightbox||!E.lightboxImg) return; E.lightboxImg.src = src; E.lightbox.style.display='block'; },
  closeLightbox(){ const E = this.els; if(!E.lightbox||!E.lightboxImg) return; E.lightbox.style.display='none'; E.lightboxImg.src=''; },
  updateFab(){ const E = this.els; if(!E.sidebar||!E.sidebarFab) return; const collapsed = E.sidebar.classList.contains('collapsed'); E.sidebarFab.classList.toggle('show', collapsed); }
};

document.addEventListener('DOMContentLoaded', ()=> UI.init());
