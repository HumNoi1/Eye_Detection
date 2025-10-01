# 🎨 UI Design Guide

คู่มือการออกแบบ UI สำหรับ Eye Detection System

## 🎨 Color Palette

ระบบใช้สี palette หลัก 4 สี:

### Primary Colors

```css
--eye-light:     #F9F7F7  /* พื้นหลังหลัก - ขาวนวล */
--eye-secondary: #DBE2EF  /* สีรอง - ฟ้าอ่อน */
--eye-primary:   #3F72AF  /* สีหลัก - น้ำเงิน */
--eye-dark:      #112D4E  /* สีเข้ม - น้ำเงินเข้ม */
```

### Color Usage

| สี | การใช้งาน | ตัวอย่าง |
|---|----------|---------|
| `#F9F7F7` | พื้นหลัง, Card, Text on dark | Background, Modal |
| `#DBE2EF` | Secondary background, Hover states | Stats box, Highlights |
| `#3F72AF` | Primary actions, Links, Icons | Buttons, Links |
| `#112D4E` | Headings, Important text, Dark buttons | Headers, Stop button |

### Semantic Colors

```css
--eye-success: #34D399  /* สีเขียว - สำเร็จ */
--eye-warning: #FBBF24  /* สีเหลือง - เตือน */
--eye-error:   #EF4444  /* สีแดง - ผิดพลาด */
```

## 🎭 Color Combinations

### Background Gradients

```css
/* Main gradient */
background: linear-gradient(135deg, #F9F7F7 0%, #DBE2EF 100%);

/* Primary gradient */
background: linear-gradient(135deg, #3F72AF, #112D4E);

/* Accent gradient */
background: linear-gradient(135deg, #3F72AF, #DBE2EF);
```

### Border Colors

```css
/* Light border */
border-color: rgba(63, 114, 175, 0.2);

/* Medium border */
border-color: rgba(63, 114, 175, 0.3);

/* Strong border */
border-color: rgba(63, 114, 175, 0.5);
```

### Background Overlays

```css
/* Card background */
background: rgba(249, 247, 247, 0.9);

/* Modal overlay */
background: rgba(219, 226, 239, 0.95);

/* Hover highlight */
background: rgba(63, 114, 175, 0.1);
```

## 🧩 Components

### Buttons

#### Primary Button (เริ่มสตรีม)
```html
<button class="btn-primary">
  ▶️ เริ่มสตรีม
</button>
```

**CSS:**
```css
.btn-primary {
  background: linear-gradient(135deg, #3F72AF, #112D4E);
  color: #F9F7F7;
  padding: 0.625rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(63, 114, 175, 0.2);
}
```

#### Secondary Button (หยุดสตรีม)
```html
<button class="btn-secondary">
  ⏸️ หยุดสตรีม
</button>
```

**CSS:**
```css
.btn-secondary {
  background: #112D4E;
  color: #F9F7F7;
  border: 2px solid #112D4E;
}
```

### Cards

#### Main Card
```html
<div class="eye-card">
  <!-- Content -->
</div>
```

**CSS:**
```css
.eye-card {
  background: rgba(249, 247, 247, 0.9);
  border: 1px solid rgba(63, 114, 175, 0.3);
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(17, 45, 78, 0.1);
  backdrop-filter: blur(12px);
}
```

### Status Pills

```html
<!-- Connected -->
<div class="status-connected">
  <span>●</span> Connected
</div>

<!-- Disconnected -->
<div class="status-disconnected">
  <span>●</span> Disconnected
</div>

<!-- Error -->
<div class="status-error">
  <span>●</span> Error
</div>
```

### Progress Bar

```html
<div class="eye-progress">
  <div class="eye-progress-bar" style="width: 75%"></div>
</div>
```

### Person Card

```html
<div class="person-card">
  <div class="eye-avatar">P</div>
  <div>
    <div>Poom</div>
    <div>85.5%</div>
  </div>
</div>
```

### Statistics Box

```html
<div class="stat-box">
  <div class="stat-value">30</div>
  <div class="stat-label">FPS</div>
</div>
```

## 📐 Layout Patterns

### Home Page Layout

```
┌─────────────────────────────────┐
│   Hero Section (Centered)       │
│   ┌─────────────────────┐      │
│   │   Logo              │      │
│   │   Title             │      │
│   │   Description       │      │
│   │   Features Grid     │      │
│   │   CTA Button        │      │
│   └─────────────────────┘      │
└─────────────────────────────────┘
```

### Camera Page Layout

```
Desktop (lg+):
┌─────────────────────────────────────┐
│  Camera (2/3)     │  Sidebar (1/3)  │
│  ┌──────────┐    │  ┌────────────┐ │
│  │  Video   │    │  │ Top Person │ │
│  │          │    │  ├────────────┤ │
│  │          │    │  │ All People │ │
│  └──────────┘    │  │ List       │ │
│  [Controls]      │  └────────────┘ │
└─────────────────────────────────────┘

Mobile:
┌─────────────┐
│   Camera    │
│ ┌─────────┐ │
│ │  Video  │ │
│ └─────────┘ │
│ [Controls]  │
├─────────────┤
│  Top Person │
├─────────────┤
│ All People  │
│    List     │
└─────────────┘
```

## 🎯 Design Principles

### 1. Consistency (ความสม่ำเสมอ)
- ใช้สีจาก palette เท่านั้น
- Spacing แบบ 4px, 8px, 12px, 16px, 24px, 32px
- Border radius: 12px, 16px, 24px
- Shadow levels: sm, md, lg, xl, 2xl

### 2. Accessibility (การเข้าถึง)
- Contrast ratio ≥ 4.5:1 สำหรับ text
- ปุ่มขนาดขั้นต่ำ 44x44px
- Focus states ชัดเจน
- ไม่พึ่งสีเพียงอย่างเดียว (ใช้ icons)

### 3. Responsiveness (การตอบสนอง)
- Mobile first approach
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Touch-friendly targets (≥44px)

### 4. Performance (ประสิทธิภาพ)
- ใช้ backdrop-filter อย่างระมัดระวัง
- Optimize images (WebP, lazy loading)
- CSS transitions ≤ 300ms

## 📱 Responsive Design

### Mobile (< 640px)
- Single column layout
- Stack sidebar below video
- Full-width buttons
- Reduced paddings (p-4 → p-3)

### Tablet (640px - 1024px)
- 2-column layout possible
- Sidebar alongside video
- Medium-sized components

### Desktop (> 1024px)
- 3-column grid
- Full-featured layout
- Spacious paddings
- Hover effects active

## 🎨 CSS Variables Usage

### In HTML/JSX

```jsx
// Inline styles
<div style={{ 
  background: 'var(--eye-light)',
  color: 'var(--eye-dark)',
  borderColor: 'rgba(63, 114, 175, 0.3)'
}}>
```

### In CSS

```css
.my-component {
  background: var(--eye-light);
  color: var(--eye-dark);
  border: 1px solid var(--eye-primary);
}
```

## 🌗 Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #112D4E;
    --foreground: #F9F7F7;
    --accent: #3F72AF;
    --secondary: #DBE2EF;
  }
  
  .eye-card {
    background: rgba(17, 45, 78, 0.9);
    border-color: rgba(63, 114, 175, 0.5);
    color: var(--eye-light);
  }
}
```

## 🎯 Icons & Emojis

### Camera & Video
- 📹 Live Camera
- 🎥 Start Recording  
- ⏸️ Pause
- ▶️ Play/Start
- 🔴 Recording

### People & Users
- 👤 User
- 👥 Multiple users
- 👑 Top detection
- 🎓 Student ID

### Status & Stats
- ✅ Success
- ⚠️ Warning
- ❌ Error
- 📊 Statistics
- 📈 Performance

## 💡 Best Practices

### DO ✅
- ใช้สีจาก palette
- ใช้ CSS classes ที่กำหนดไว้
- Test บน mobile และ desktop
- ใช้ semantic HTML
- เพิ่ม loading states
- ใช้ proper contrast

### DON'T ❌
- อย่าใช้สีนอก palette
- อย่าใช้ inline styles มากเกินไป
- อย่าลืม hover/focus states
- อย่าใช้ fixed sizes (ใช้ responsive)
- อย่าลืม accessibility
- อย่าใช้ too many animations

## 🔧 Development Tools

### Color Picker
```
https://colorhunt.co/
https://coolors.co/
```

### Gradient Generator
```
https://cssgradient.io/
```

### Shadow Generator
```
https://shadows.brumm.af/
```

### Contrast Checker
```
https://webaim.org/resources/contrastchecker/
```

---

## 📖 Examples

### Complete Button Component

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: React.ReactNode;
}

function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  const baseStyles = {
    padding: '0.625rem 1.5rem',
    borderRadius: '0.75rem',
    fontWeight: 600,
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
  };
  
  const variantStyles = variant === 'primary' 
    ? {
        background: 'linear-gradient(135deg, #3F72AF, #112D4E)',
        color: '#F9F7F7',
        boxShadow: '0 4px 6px -1px rgba(63, 114, 175, 0.2)',
      }
    : {
        background: '#112D4E',
        color: '#F9F7F7',
        border: '2px solid #112D4E',
      };
  
  return (
    <button
      style={{ ...baseStyles, ...variantStyles }}
      onClick={onClick}
      className="hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
    >
      {children}
    </button>
  );
}
```

---

Made with ❤️ for Eye Detection System
