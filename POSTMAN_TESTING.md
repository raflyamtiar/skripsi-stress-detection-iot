# Testing WebSocket dengan Postman

## 🧪 Panduan Testing

### Cara Mengirim Data dari Postman

#### 1. Setup Postman WebSocket Request

1. Buka **Postman**
2. Pilih **New** → **WebSocket Request**
3. Masukkan URL WebSocket Anda

**URL Format:**

```
ws://127.0.0.1:5000/socket.io/?EIO=4&transport=websocket
```

Atau untuk Ngrok:

```
ws://premedical-caryl-gawkishly.ngrok-free.dev/socket.io/?EIO=4&transport=websocket
```

#### 2. Connect ke WebSocket

- Klik tombol **Connect**
- Tunggu hingga status berubah menjadi **Connected**

#### 3. Send Data Sensor

Pada message field, kirim data dengan format Socket.IO:

**Format 1: Event `esp32_live_data` (ESP32)**

```
42["esp32_live_data", {
    "hr": 75.5,
    "temp": 36.2,
    "eda": 0.45,
    "device_id": "ESP32_001"
}]
```

**Format 2: Event `sensor_data` (Standard)**

```
42["sensor_data", {
    "hr": 85,
    "temp": 34.5,
    "gsr": 12.345
}]
```

#### 4. Verifikasi di React App

Setelah send dari Postman:

1. Buka browser console (F12)
2. Lihat log: `📊 Received data from [esp32_live_data]:` atau `[sensor_data]:`
3. Angka di dashboard harus berubah sesuai data yang dikirim

---

## 📊 Contoh Data Testing

### Test Normal Stress

```
42["esp32_live_data", {
    "hr": 75,
    "temp": 35.5,
    "eda": 3.5,
    "device_id": "ESP32_001"
}]
```

**Expected Result**: Status → **Normal** 🟢

### Test Stress Sedang

```
42["esp32_live_data", {
    "hr": 95,
    "temp": 34.0,
    "eda": 7.5,
    "device_id": "ESP32_001"
}]
```

**Expected Result**: Status → **Stress Sedang** 🟡

### Test Stress Berat

```
42["esp32_live_data", {
    "hr": 110,
    "temp": 32.5,
    "eda": 15.0,
    "device_id": "ESP32_001"
}]
```

**Expected Result**: Status → **Stress Berat** 🔴 + Warning Modal

---

## 🔍 Troubleshooting

### Masalah 1: Angka Tidak Berubah

**Kemungkinan Penyebab:**

1. ❌ Event name salah
   - **Solusi**: Gunakan `esp32_live_data` atau `sensor_data`
2. ❌ Field name tidak sesuai
   - **Solusi**: Gunakan `hr`, `temp`, dan `eda` atau `gsr`
3. ❌ Format Socket.IO salah

   - **Solusi**: Harus diawali dengan `42[...]`

4. ❌ WebSocket belum connect
   - **Solusi**: Cek status koneksi di dashboard (harus hijau)

### Masalah 2: Connection Failed

**Solusi:**

1. Pastikan backend server running
2. Cek firewall
3. Verifikasi URL di Postman sama dengan `.env`

### Masalah 3: Data Tidak Muncul di Console

**Solusi:**

1. Buka browser console (F12)
2. Cek apakah ada log `✅ WebSocket connected successfully!`
3. Cek apakah ada log `📊 Received data from [...]:`
4. Jika tidak ada, berarti data tidak sampai ke frontend

---

## ✅ Checklist Testing

Sebelum mengirim data, pastikan:

- [ ] Backend server sudah running
- [ ] React app sudah running (`npm run dev`)
- [ ] Browser console terbuka (F12)
- [ ] Status koneksi di dashboard **Connected** (hijau)
- [ ] Postman WebSocket sudah **Connected**
- [ ] Format data Socket.IO benar (`42["event_name", {...}]`)

---

## 📝 Format Socket.IO

### Penjelasan Format

```
42["event_name", payload]
```

- `4` = Engine.IO MESSAGE packet type
- `2` = Socket.IO EVENT packet type
- `"event_name"` = Nama event yang akan di-emit
- `payload` = Data JSON yang dikirim

### Field Names yang Didukung

| Backend Field          | Frontend Field | Keterangan                  |
| ---------------------- | -------------- | --------------------------- |
| `hr`                   | `hr`           | Heart Rate (BPM)            |
| `heartRate`            | `hr`           | Alternative                 |
| `temp`                 | `temp`         | Temperature (°C)            |
| `temperature`          | `temp`         | Alternative                 |
| `gsr`                  | `gsr`          | Galvanic Skin Response (µS) |
| `eda`                  | `gsr`          | Electrodermal Activity (µS) |
| `galvanicSkinResponse` | `gsr`          | Alternative                 |

---

## 🎯 Expected Behavior

### Saat Data Diterima:

1. ✅ Console log muncul: `📊 Received data from [esp32_live_data]:`
2. ✅ Angka di card berubah sesuai data
3. ✅ Timestamp diupdate
4. ✅ Data ditambahkan ke tabel (max 50 entries)
5. ✅ Status stress dikalkulasi otomatis
6. ✅ Jika "Stress Berat", modal warning muncul

### Saat Koneksi Berhasil:

1. ✅ Console: `✅ WebSocket connected successfully!`
2. ✅ Console: `Socket ID: xxx`
3. ✅ Status indicator: 🟢 Connected

---

## 🚀 Quick Test

Jalankan test cepat:

1. **Buka 3 windows:**

   - Terminal: `npm run dev`
   - Browser: `http://localhost:5173`
   - Postman: WebSocket connection

2. **Send dari Postman:**

   ```
   42["esp32_live_data", {"hr": 85, "temp": 35.0, "eda": 5.0}]
   ```

3. **Cek browser:**
   - Console ada log baru
   - Angka di card berubah
   - Timestamp terupdate

**Jika semua ✅, berarti WebSocket berfungsi dengan baik!**
