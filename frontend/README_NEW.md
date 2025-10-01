# 🎨 Eye Detection Frontend

Frontend application for Eye Detection System built with Next.js 15, TypeScript, and Tailwind CSS

## 🎯 Features

- ✨ **Modern UI Design** - Beautiful interface with custom color palette
- 📹 **Real-time Video Stream** - Live camera feed with face detection
- 👤 **User Information Display** - Show detected person's info from database
- 📊 **Live Statistics** - FPS, Latency, Detection counts
- 🎨 **Responsive Design** - Works on mobile, tablet, and desktop
- 🌓 **Dark Mode Support** - Automatic dark/light theme
- ⚡ **Optimized Performance** - Frame throttling, batch updates

## 🎨 Color Palette

The UI uses a carefully selected color palette:

| Color | Hex | Usage |
|-------|-----|-------|
| Light | `#F9F7F7` | Background, Cards |
| Secondary | `#DBE2EF` | Highlights, Hover states |
| Primary | `#3F72AF` | Buttons, Links, Icons |
| Dark | `#112D4E` | Headers, Important text |

See [UI_DESIGN_GUIDE.md](../UI_DESIGN_GUIDE.md) for complete design documentation.

## 📦 Tech Stack

- **Framework**: [Next.js 15.5.4](https://nextjs.org/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **WebSocket**: Native Browser WebSocket API
- **Icons**: Emoji + Custom SVG

## 🚀 Getting Started

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── src/
│   └── app/
│       ├── page.tsx              # Home page
│       ├── layout.tsx            # Root layout
│       ├── globals.css           # Global styles + Tailwind
│       ├── eye-styles.css        # Custom component styles
│       ├── favicon.ico           # Site icon
│       └── camera/
│           └── page.tsx          # Camera detection page
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.ts               # Next.js config
├── tailwind.config.ts           # Tailwind config
└── postcss.config.mjs           # PostCSS config
```

## 🎯 Pages

### Home Page (`/`)

Landing page with features and call-to-action button.

**Features:**
- Hero section with logo
- Feature grid (4 features)
- Gradient background with blobs
- Responsive design
- "เริ่มใช้งาน" button → `/camera`

### Camera Page (`/camera`)

Real-time face detection page.

**Layout:**
- **Desktop (lg+)**: 2/3 video + 1/3 sidebar
- **Mobile**: Stacked layout

**Components:**
- Live camera feed (16:9 aspect ratio)
- Control buttons (เริ่ม/หยุดสตรีม)
- Statistics display (FPS, Latency, Detections)
- Top prediction card with user info
- All detected people list
- System logs panel

## 🎨 UI Components

### Custom CSS Classes

The app uses custom CSS classes defined in `eye-styles.css`:

```css
.btn-primary       /* Primary button style */
.btn-secondary     /* Secondary button style */
.eye-card         /* Card container */
.status-connected  /* Status pill - connected */
.status-disconnected /* Status pill - disconnected */
.person-card      /* Person detection card */
.eye-avatar       /* User avatar */
.stat-box         /* Statistics box */
.log-panel        /* Log display panel */
```

### Usage Example

```tsx
// Primary Button
<button className="btn-primary">
  ▶️ เริ่มสตรีม
</button>

// Card
<div className="eye-card">
  <h2>Content</h2>
</div>

// Status Pill
<div className="status-connected">
  <span>●</span> Connected
</div>
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```env
# WebSocket URL (optional, defaults to ws://localhost:8000/ws)
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### WebSocket Configuration

The app connects to the backend WebSocket endpoint:

```typescript
const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws";
```

**Connection Features:**
- Auto-reconnection with exponential backoff
- Maximum 5 reconnection attempts
- Connection status display
- Error handling

## 📊 WebSocket Data Format

### Received from Backend

```typescript
{
  fps: number;                    // Frames per second
  latency: number;                // Detection latency (ms)
  frame: string;                  // Base64 encoded JPEG
  predicted: string;              // Top prediction label
  predicted_percentage: number;   // Top prediction confidence (%)
  prediction_stats: {             // All detected people
    [label: string]: {
      count: number;              // Detection count
      percentage: number;         // Confidence %
      user: {                     // User info from database
        user_id: string;
        username: string;
        student_id: string;
        label: string;
      } | null;
    };
  };
  history_size: number;           // Detections in 5s window
  log: string;                    // Log message
  error: string;                  // Error message (if any)
}
```

## 🎯 Performance Optimizations

### 1. Frame Throttling

```typescript
const MIN_DRAW_INTERVAL_MS = 30;  // ~33 FPS max
```

Prevents excessive canvas redraws.

### 2. Batch State Updates

```typescript
const [streamData, setStreamData] = useState({
  fps: 0,
  latency: 0,
  predicted: "",
  // ... all related states
});
```

Reduces re-renders by batching related state updates.

### 3. Memoized Components

```typescript
const StatusPill = memo(function StatusPill({ status }) {
  // ...
});
```

Prevents unnecessary component re-renders.

### 4. Efficient Canvas Drawing

```typescript
// Only draw when new frame arrives
if (pendingDrawRef.current) return;

// Use requestAnimationFrame for smooth rendering
```

## 🎨 Customization

### Changing Colors

Edit `src/app/globals.css`:

```css
:root {
  --color-light: #F9F7F7;     /* Your light color */
  --color-secondary: #DBE2EF; /* Your secondary */
  --color-primary: #3F72AF;   /* Your primary */
  --color-dark: #112D4E;      /* Your dark color */
}
```

### Changing Layout

Edit grid columns in `camera/page.tsx`:

```tsx
{/* Change lg:grid-cols-3 to adjust layout */}
<main className="... lg:grid-cols-3 ...">
  <section className="lg:col-span-2">  {/* Video: 2/3 */}
  <section className="lg:col-span-1">  {/* Sidebar: 1/3 */}
```

### Adding New Components

1. Create component in `camera/page.tsx`
2. Add memo wrapper for optimization
3. Use custom CSS classes from `eye-styles.css`
4. Follow design guidelines in `UI_DESIGN_GUIDE.md`

## 🐛 Troubleshooting

### Issue: WebSocket fails to connect

**Solution:**
1. Check backend is running: `http://localhost:8000/health`
2. Verify WebSocket URL in console
3. Check firewall/network settings

### Issue: Camera not showing

**Solution:**
1. Allow camera permissions in browser
2. Check if camera is used by another app
3. Try different browser (Chrome recommended)

### Issue: Low FPS

**Solution:**
1. Close other apps using camera
2. Reduce browser zoom level
3. Check backend FPS (might be backend bottleneck)

### Issue: Styles not applying

**Solution:**
1. Clear browser cache
2. Check `eye-styles.css` is imported in `globals.css`
3. Rebuild: `npm run build`

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Opera | 76+ | ✅ Full |

**Required Features:**
- WebSocket API
- Canvas API
- getUserMedia API (for camera)
- ES2020+

## 📚 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js GitHub](https://github.com/vercel/next.js)
- [Learn Next.js](https://nextjs.org/learn)

### Design Resources
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Color Hunt](https://colorhunt.co/)
- [CSS Gradient](https://cssgradient.io/)

### WebSocket Resources
- [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [WebSocket API Spec](https://websockets.spec.whatwg.org/)

## 🤝 Contributing

1. Follow design guidelines in `UI_DESIGN_GUIDE.md`
2. Use TypeScript for type safety
3. Add proper error handling
4. Test on mobile and desktop
5. Optimize performance (memoization, throttling)
6. Follow accessibility guidelines

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

Made with ❤️ by HumNoi1

🎨 Color Palette: `#F9F7F7` • `#DBE2EF` • `#3F72AF` • `#112D4E`
