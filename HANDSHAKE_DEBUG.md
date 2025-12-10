# 🔍 WebSocket Handshake & Debugging Guide

## ❓ Kenapa Data Tidak Muncul?

### Masalah Utama: Event Name Salah! ⚠️

**Backend mengirim:**

```
42["live_sensor_data", {...}]
```

**Frontend harus listen:**

```javascript
socket.on("live_sensor_data", (data) => { ... })
```

## ✅ Sudah Diperbaiki!

Sekarang Dashboard.jsx listen **3 event sekaligus**:

1. `sensor_data`
2. `esp32_live_data`
3. `live_sensor_data` ← **YANG INI UNTUK BACKEND ANDA!**

---

## 🔌 Cara Cek Handshake

### 1. Buka Browser Console (F12)

Anda harus melihat log ini kalau handshake berhasil:

```
Connecting to WebSocket: ws://premedical-caryl-gawkishly.ngrok-free.dev
✅ WebSocket connected successfully!
Socket ID: abc123xyz
```

**Jika TIDAK melihat log di atas = HANDSHAKE GAGAL!**

### 2. Cek Status Koneksi di Dashboard

Di header dashboard, lihat indikator:

- 🟢 **Connected** (dot hijau berkedip) = ✅ Handshake berhasil
- 🔴 **Disconnected** (dot merah) = ❌ Handshake gagal

---

## 🧪 Testing dengan Postman

### Step 1: Connect WebSocket

**URL Postman:**

```
ws://premedical-caryl-gawkishly.ngrok-free.dev/socket.io/?EIO=4&transport=websocket
```

### Step 2: Tunggu Handshake

Setelah connect, Postman akan mengirim:

```
0{"sid":"xxx","upgrades":[],"pingInterval":25000,"pingTimeout":20000}
```

Dan Anda harus kirim balik:

```
40
```

**Ini adalah handshake Socket.IO!**

### Step 3: Kirim Data

Setelah handshake berhasil, kirim:

```
42["live_sensor_data",{"timestamp":"2025-12-10T22:18:13.844377","hr":75.5,"temp":36.2,"eda":0.45,"device_id":"ESP32_001"}]
```

---

## 🐛 Debug Mode Aktif!

Saya sudah tambahkan **logger untuk SEMUA event**:

```javascript
socket.onAny((eventName, ...args) => {
  console.log(`🔔 Event received: "${eventName}"`, args);
});
```

### Apa yang Harus Muncul di Console:

#### Saat Connect:

```
Connecting to WebSocket: ws://...
✅ WebSocket connected successfully!
Socket ID: xxx
```

#### Saat Terima Data:

```
🔔 Event received: "live_sensor_data" [{hr: 75.5, temp: 36.2, ...}]
📊 Received data from [live_sensor_data]: {hr: 75.5, temp: 36.2, ...}
```

#### Jika TIDAK Muncul Log di Atas:

- ❌ Backend tidak kirim data
- ❌ Event name salah
- ❌ Handshake gagal
- ❌ Koneksi terputus

---

## 🔧 Troubleshooting

### Problem 1: Tidak Ada Log "WebSocket connected"

**Penyebab:**

- Backend tidak running
- URL WebSocket salah di `.env`
- Firewall block koneksi

**Solusi:**

1. Cek `.env` file:

   ```env
   VITE_WEBSOCKET_URL=ws://premedical-caryl-gawkishly.ngrok-free.dev
   ```

2. Restart React app:

   ```bash
   npm run dev
   ```

3. Cek browser console untuk error

### Problem 2: Connected Tapi Tidak Terima Data

**Penyebab:**

- Event name tidak match
- Backend tidak emit event
- Format data salah

**Solusi:**

1. Cek console, harus ada log:

   ```
   🔔 Event received: "live_sensor_data" [...]
   ```

2. Jika TIDAK ada log `🔔`, berarti:

   - Backend tidak kirim event
   - Atau event name berbeda

3. Cek Postman, pastikan send format:
   ```
   42["live_sensor_data", {...}]
   ```
   Bukan:
   ```
   ["live_sensor_data", {...}]  ← SALAH! Kurang "42"
   ```

### Problem 3: Ada Log Tapi Angka Tidak Berubah

**Penyebab:**

- Field name tidak match

**Solusi:**
Data Anda sudah benar! Field yang didukung:

```javascript
{
  hr: 75.5,      ✅ Supported
  temp: 36.2,    ✅ Supported
  eda: 0.45,     ✅ Supported (mapped ke gsr)
  timestamp: "...", ✅ Supported
  device_id: "..." ✅ Ignored (tidak masalah)
}
```

---

## ✅ Checklist Lengkap

Sebelum testing, pastikan:

### Backend:

- [ ] Server Socket.IO running
- [ ] Port 5000 (atau sesuai config) terbuka
- [ ] Emit event dengan nama `live_sensor_data`
- [ ] Format Socket.IO: `42["live_sensor_data", {...}]`

### Frontend:

- [ ] File `.env` berisi URL yang benar
- [ ] React app running: `npm run dev`
- [ ] Browser terbuka ke `http://localhost:5173`
- [ ] Browser console terbuka (F12)
- [ ] Status di dashboard: 🟢 Connected

### Testing:

- [ ] Postman WebSocket connected
- [ ] Handshake selesai (kirim `40` setelah terima `0{...}`)
- [ ] Send data dengan format `42["live_sensor_data", {...}]`

---

## 📊 Expected Flow

### 1. App Load

```
Connecting to WebSocket: ws://...
✅ WebSocket connected successfully!
Socket ID: abc123
```

### 2. Data Diterima

```
🔔 Event received: "live_sensor_data" [{...}]
📊 Received data from [live_sensor_data]: {hr: 75.5, temp: 36.2, eda: 0.45}
```

### 3. UI Update

- Heart Rate card: **75.5 BPM**
- Temperature card: **36.2 °C**
- GSR card: **0.450 µS**
- Timestamp: **Updated**
- Status: **Normal** / **Stress Sedang** / **Stress Berat**

---

## 🎯 Testing Sekarang

### 1. Cek Console Browser

Buka http://localhost:5173 dan buka console (F12)

### 2. Cek Status Koneksi

Lihat di header dashboard: harus **🟢 Connected**

### 3. Kirim dari Postman

```
42["live_sensor_data",{"hr":75.5,"temp":36.2,"eda":0.45}]
```

### 4. Lihat Console

Harus muncul:

```
🔔 Event received: "live_sensor_data" [...]
📊 Received data from [live_sensor_data]: {...}
```

### 5. Lihat Dashboard

Angka harus **LANGSUNG BERUBAH!**

---

## 🚨 Jika Masih Tidak Berhasil

Kirimkan screenshot:

1. Browser console (F12)
2. Dashboard status (Connected/Disconnected)
3. Postman message yang dikirim
4. Response Postman

Saya akan bantu debug lebih lanjut!

---

## 📝 Event Names yang Didukung

Sekarang frontend support **3 event names**:

| Event Name         | Status | Keterangan       |
| ------------------ | ------ | ---------------- |
| `sensor_data`      | ✅     | Format standard  |
| `esp32_live_data`  | ✅     | Format ESP32     |
| `live_sensor_data` | ✅     | **Format Anda!** |

**Plus**: Debug logger untuk **SEMUA** event dengan `socket.onAny()`

Jadi tidak peduli event name apa yang backend kirim, console akan log semuanya! 🎉
