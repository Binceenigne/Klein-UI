# Klein UI - 极简动态界面模板库
> 一个轻量级、极简波普风格的 UI 模板库，专注于可复用的界面组件、流畅转场动画和动态背景特效。即插即用，轻松集成到任何 Web 项目。
---
##  特性亮点
-  **现代设计语言** - 苹果风扁平化设计，简洁优雅
-  **动态背景系统** - Canvas 驱动的轻量级背景纹理与几何漂浮效果
-  **电影级转场** - 圆形擦除、快门、Iris 闭幕等专业转场动画
-  **丰富组件库** - 20+ 精心设计的 UI 组件，覆盖常见交互场景
-  **运行时配置** - 主题、背景、转场效果全部支持动态调整
-  **零依赖** - 纯前端实现，无需任何框架或库
-  **即插即用** - 拷贝文件即可使用，无需复杂配置
---
##  包含内容
| 模块 | 描述 | 文件 |
|------|------|------|
| **核心样式** | 颜色变量、容器、按钮、滑块、开关、调色板、可折叠面板等 | `klein-ui.css` |
| **动态背景** | 网格/圆点/十字纹理 + 几何漂浮动画 | `background.js` |
| **转场动画** | 圆形擦除、水平/垂直快门、Iris 闭幕 + 弹性/火花特效 | `transitions.js` |
| **交互示例** | 完整的组件演示与交互逻辑 | `template.js` |
| **演示页面** | 可直接打开查看所有效果 | `demo.html` |
---
##  快速开始
### 1. 安装
将 `ui-template/` 目录下的核心文件拷贝到你的项目：
```
your-project/
├── klein-ui.css
├── background.js
└── transitions.js
```
### 2. 引入
在 HTML 中添加：
```html
<link rel="stylesheet" href="./klein-ui.css">
<script src="./background.js"></script>
<script src="./transitions.js"></script>
```
### 3. 使用
参考 `demo.html` 的 DOM 结构，即可快速搭建界面。
---
##  API 参考
### 动态背景 (KleinBG)
```javascript
// 启动/停止
KleinBG.start()
KleinBG.stop()
KleinBG.reroll() // 重新随机纹理与几何
// 配置
KleinBG.setConfig({
  patternType: 'grid',    // 'grid' | 'dots' | 'cross'
  step: 40,               // 网格密度 (20-60)
  opacity: 0.1,           // 不透明度 (0.05-0.2)
  driftSpeed: 1,          // 漂浮速度倍率 (0.3-2.5)
  shapeCount: 0.5         // 几何图形数量倍率 (0-1)
})
```
### 转场动画 (KleinTransition)
```javascript
// 播放转场
KleinTransition.play()        // 新场景开场
KleinTransition.playSwitch()  // 场景切换
// 配置
KleinTransition.setConfig({
  baseDuration: 600,          // 动画时长 (300-1200ms)
  sparksEnabled: true,        // 启用火花特效
  sparksProbability: 0.3,     // 火花出现概率 (0-1)
  effectWeights: {            // 效果权重
    circleWipe: 1,
    verticalShutter: 1,
    horizontalShutter: 1,
    irisWipe: 1
  }
})
```
---
##  组件库
### 基础组件
- **Header** - 品牌区与操作按钮
- **Main Content** - 主内容容器
- **Buttons** - 主要/次要/徽章按钮
- **Upload Area** - 拖拽上传区域
- **Preview Cards** - 图片预览网格
### 交互组件
- **Toast** - 顶部浮动提示
- **Notice** - 底部气泡通知
- **Lightbox** - 大图查看器
- **Sidebar** - 可折叠侧边栏
- **Slider** - 数值调节控件
- **Switch** - iOS 风格开关
### 高级组件
- **Theme Picker** - 8色主题切换器
- **Collapsible Panel** - 手风琴式折叠面板
- **Modal Dialogs** - 确认/输入/选择/卡片/全屏模态框
- **Tooltips** - 悬浮提示
- **Popovers** - 自定义位置悬浮面板
- **Toolbar Popover** - 带图标的操作列表
- **Notification Popover** - 消息通知列表
---
##  主题系统
内置 8 种精心调配的主题色：
| 主题 | 颜色 | 变量 |
|------|------|------|
| Klein Blue | `#1E40FF` | `--klein-blue` |
| Purple | `#AF52DE` | `--klein-purple` |
| Pink | `#FF2D55` | `--klein-pink` |
| Orange | `#FF9500` | `--klein-orange` |
| Green | `#34C759` | `--klein-green` |
| Teal | `#5AC8FA` | `--klein-teal` |
| Indigo | `#5856D6` | `--klein-indigo` |
| Sunset | `linear-gradient(135deg, #FF6B6B, #FFD93D)` | `--klein-sunset` |
**切换主题**：
```javascript
document.documentElement.style.setProperty('--klein-blue', '#新颜色值');
```
---
##  演示
直接打开 `demo.html` 即可预览所有效果（推荐使用 VS Code Live Server 获得最佳体验）。
---
##  浏览器支持
- Chrome / Edge 90+
- Firefox 88+
- Safari 14+
---
##  许可证
MIT License - 详见 [LICENSE](LICENSE) 文件
---
<div align="center">
  <p>Made with ❤️ by Klein UI Team</p>
</div>

