# Penerapan Algoritma Random Forest untuk Deteksi Stres Menggunakan Sensor MAX30102, DS18B20, dan GSR

## Deskripsi

Skripsi ini mengembangkan sistem deteksi stres berbasis sensor dengan menggunakan **algoritma Random Forest** untuk memprediksi tingkat stres berdasarkan data yang diperoleh dari sensor **MAX30102** (detak jantung), **DS18B20** (suhu tubuh), dan **GSR** (Galvanic Skin Response - respon kulit terhadap konduktansi). Sistem ini bertujuan untuk menyediakan solusi **deteksi stres secara real-time** melalui pemantauan fisiologis.

Sistem ini mengintegrasikan **Internet of Things (IoT)** untuk pengambilan data dari sensor secara langsung, yang kemudian diproses oleh algoritma **Random Forest** untuk menghasilkan prediksi tentang tingkat stres seseorang (normal, sedang, atau berat). Aplikasi ini dapat digunakan untuk meningkatkan kewaspadaan terhadap kondisi stres dan mendukung pengelolaan kesehatan mental.

## Fitur Utama

- **Sensor MAX30102** untuk detak jantung (Heart Rate).
- **Sensor DS18B20** untuk suhu tubuh.
- **Sensor GSR** untuk mengukur respons kulit (Galvanic Skin Response).
- **Algoritma Random Forest** untuk klasifikasi tingkat stres.
- **IoT Real-Time Monitoring** untuk pengumpulan data fisiologis secara langsung.
- **WebSocket Real-Time Connection** untuk pemantauan data sensor secara live.
- **Deteksi Stres** yang dapat mengklasifikasikan kondisi stres menjadi **Normal**, **Sedang**, atau **Berat**.

## Setup & Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd stress-detection-iot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan URL WebSocket:

```env
# Untuk development lokal
VITE_WEBSOCKET_URL=ws://127.0.0.1:5000

# Untuk production dengan ngrok
# VITE_WEBSOCKET_URL=ws://your-ngrok-url.ngrok-free.dev
```

### 4. Jalankan Aplikasi

```bash
npm run dev
```

## WebSocket Configuration

Aplikasi ini menggunakan Socket.IO untuk komunikasi real-time dengan backend sensor.

### WebSocket Endpoint

- **Local Development**: `ws://127.0.0.1:5000/socket.io/?EIO=4&transport=websocket&type=frontend`
- **Production (Ngrok)**: `ws://your-ngrok-url.ngrok-free.dev/socket.io/?EIO=4&transport=websocket&type=frontend`

### Format Data Sensor

Backend harus mengirim data dengan format berikut melalui event `sensor_data`:

```javascript
{
  hr: 85,              // Heart Rate (BPM)
  temp: 34.5,          // Temperature (°C)
  gsr: 12.345,         // Galvanic Skin Response (µS)
}
```

### Event Listeners

- `connect`: Dipanggil saat koneksi berhasil
- `disconnect`: Dipanggil saat koneksi terputus
- `connect_error`: Dipanggil saat ada error koneksi
- `reconnect`: Dipanggil saat berhasil reconnect
- `sensor_data`: Menerima data sensor real-time

### Status Koneksi

Aplikasi menampilkan indikator status koneksi di header dashboard:

- 🟢 **Connected**: WebSocket terhubung
- 🔴 **Disconnected**: WebSocket terputus
