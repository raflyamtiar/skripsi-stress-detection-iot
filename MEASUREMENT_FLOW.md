# 📊 Measurement Flow - User Guide

## Overview

Dashboard sekarang memiliki 3 state pengukuran yang berbeda untuk memberikan pengalaman yang lebih terstruktur dan informatif.

---

## 🔄 State Flow

### 1️⃣ IDLE STATE (Siap Mengukur)

**Tampilan:**

- Tombol circular besar di tengah "Mulai Mengukur" 🧘‍♀️
- Gradient blue-purple-pink dengan efek glow
- Hover effect yang smooth
- Instruksi untuk memastikan sensor terpasang

**Aksi:**

- Klik tombol untuk memulai pengukuran

---

### 2️⃣ MEASURING STATE (Sedang Mengukur)

**Tampilan:**

- Countdown timer besar: **60** → **1** → **0**
- Text "Sedang mengukur, harap tunggu..."
- 3 sensor cards tanpa nilai:
  - ❤️ Heart Rate
  - 🌡️ Skin Temperature
  - 💧 Galvanic Skin Response
- Progress indicator (detik ke berapa)
- Animasi loading yang smooth

**Proses:**

- Countdown 60 detik
- **Setiap detik**, data sensor disimpan ke localStorage
- Format data: `{second, hr, temp, gsr, timestamp}`
- Total 60 data points tersimpan

**Data localStorage:**

```javascript
// Key: "measurementData"
[
  {
    second: 1,
    hr: 75.5,
    temp: 36.2,
    gsr: 0.45,
    timestamp: "2025-12-10T22:30:01.000Z",
  },
  {
    second: 2,
    hr: 76.0,
    temp: 36.3,
    gsr: 0.48,
    timestamp: "2025-12-10T22:30:02.000Z",
  },
  // ... sampai second: 60
];
```

---

### 3️⃣ DONE STATE (Selesai)

**Tampilan:**

- ✅ Success message
- Jumlah data point yang tersimpan
- **4 Cards lengkap dengan nilai:**
  1. Stress Level Card (Normal/Sedang/Berat)
  2. Heart Rate
  3. Skin Temperature
  4. Galvanic Skin Response
- Records Table (history data)
- Tombol "Ukur Lagi" untuk reset

**Aksi:**

- Klik "Ukur Lagi" untuk kembali ke IDLE state
- Data lama di localStorage akan dihapus
- Siap untuk pengukuran baru

---

## 🎨 Animasi & UI Features

### Framer Motion Animations

- **Idle → Measuring**: Fade + Scale transition
- **Measuring → Done**: Smooth opacity transition
- **Done Cards**: Staggered animation (muncul satu per satu)
- **Countdown**: Pulse animation setiap detik

### Visual Effects

- Gradient backgrounds untuk cards
- Glow effect pada tombol start
- Pulse animation untuk countdown
- Smooth hover states

---

## 💾 localStorage Structure

### Key: `measurementData`

Array of objects, setiap detik menyimpan:

```typescript
{
  second: number,      // 1 to 60
  hr: number,          // Heart rate (BPM)
  temp: number,        // Temperature (°C)
  gsr: number,         // GSR (µS)
  timestamp: string    // ISO timestamp
}
```

### Accessing Data

```javascript
// Get all measurement data
const data = JSON.parse(localStorage.getItem("measurementData") || "[]");

// Total data points
console.log(data.length); // 60

// Get specific second
const second30 = data.find((d) => d.second === 30);

// Calculate average
const avgHR = data.reduce((sum, d) => sum + d.hr, 0) / data.length;
```

---

## 🔧 Technical Implementation

### State Management

```javascript
const [measurementState, setMeasurementState] = useState("idle");
// Possible values: "idle" | "measuring" | "done"

const [countdown, setCountdown] = useState(60);
const [measurementData, setMeasurementData] = useState([]);
```

### Countdown Logic

- Uses `setInterval` with 1 second interval
- Saves data to localStorage every tick
- Auto-transitions to "done" at countdown = 0
- Proper cleanup on unmount

### WebSocket Integration

- Data terus diterima real-time dari WebSocket
- Disimpan ke localStorage selama measuring state
- Ditampilkan di cards pada done state

---

## 📱 Responsive Design

### Mobile (< 768px)

- Tombol start: 256px × 256px
- Cards: Stack vertical
- Full width layout

### Desktop (≥ 768px)

- Cards: Horizontal layout
- Optimized spacing
- Better card proportions

---

## 🎯 User Flow Example

1. **User membuka dashboard** → Melihat tombol "Mulai Mengukur"
2. **User klik tombol** → Countdown mulai dari 60
3. **Countdown berjalan** → Data disimpan tiap detik ke localStorage
4. **Countdown selesai (0)** → Tampilkan 4 cards dengan hasil final
5. **User review hasil** → Lihat stress level & data history
6. **User klik "Ukur Lagi"** → Kembali ke step 1

---

## ⚡ Performance Notes

- localStorage auto-clears sebelum pengukuran baru
- Interval cleanup untuk prevent memory leaks
- Smooth animations dengan GPU acceleration
- Lazy rendering untuk better performance

---

## 🐛 Debugging

### Check localStorage:

```javascript
// Browser Console (F12)
JSON.parse(localStorage.getItem("measurementData"));
```

### Check state:

```javascript
// Add console.log in useEffect
console.log("Measurement State:", measurementState);
console.log("Countdown:", countdown);
console.log("Data Count:", measurementData.length);
```

### Clear localStorage manually:

```javascript
localStorage.removeItem("measurementData");
```

---

## 🎨 Customization

### Change countdown duration:

```javascript
// In Dashboard.jsx
setCountdown(120); // Change to 120 seconds
```

### Change animations:

```javascript
// Modify framer-motion props
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.5 }} // Adjust duration
```

### Change button design:

```javascript
// Modify className in idle state button
className = "w-64 h-64 bg-gradient-to-br from-blue-500..."; // Adjust size/colors
```

---

## ✨ Features Summary

✅ 3-state flow (idle → measuring → done)  
✅ 60-second countdown with visual feedback  
✅ Real-time data saving to localStorage (60 data points)  
✅ Modern circular button with gradient & glow  
✅ Smooth animations with Framer Motion  
✅ Responsive design  
✅ Auto-transition between states  
✅ Proper cleanup & memory management  
✅ WebSocket integration maintained  
✅ Stress detection & warning modal

---

**Enjoy your new measurement flow! 🚀**
