import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import SensorCard from "../components/SensorCard";
import StressLevelCard from "../components/StressLevelCard";
import RecordsTable from "../components/RecordsTable";
import StressWarningModal from "../components/StressWarningModal";
import MusicPlayer from "../components/MusicPlayer";

function classifyFallback({ hr, gsr, temp }) {
  if (hr >= 60 && hr <= 90 && gsr < 5 && temp >= 33.5 && temp <= 36.9)
    return "Normal";
  if (
    hr > 90 &&
    hr <= 100 &&
    gsr >= 5 &&
    gsr <= 10 &&
    temp >= 33 &&
    temp <= 34.5
  )
    return "Stress Sedang";
  return "Stress Berat";
}

export default function Dashboard() {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  // WebSocket state
  const [sensorData, setSensorData] = useState([]);
  const [currentSensorData, setCurrentSensorData] = useState({
    hr: 0,
    temp: 0,
    gsr: 0,
    timestamp: new Date().toLocaleString("id-ID"),
  });
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  const levelText = classifyFallback(currentSensorData);

  // WebSocket connection setup
  useEffect(() => {
    // const WEBSOCKET_URL =
    // import.meta.env.VITE_WEBSOCKET_URL || "ws://127.0.0.1:5000";
    const WEBSOCKET_URL = "ws://premedical-caryl-gawkishly.ngrok-free.dev";
    const socketPath = "/socket.io/?EIO=4&transport=websocket&type=frontend";

    console.log("Connecting to WebSocket:", WEBSOCKET_URL);

    // Initialize socket connection
    socketRef.current = io(WEBSOCKET_URL, {
      path: "/socket.io/",
      transports: ["websocket"],
      query: {
        EIO: 4,
        transport: "websocket",
        type: "frontend",
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("✅ WebSocket connected successfully!");
      console.log("Socket ID:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      setIsConnected(false);
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Reconnection attempt #${attemptNumber}`);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    // Function to process sensor data (reusable for multiple events)
    const processSensorData = (data, eventName) => {
      console.log(`📊 Received data from [${eventName}]:`, data);

      const timestamp = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const newData = {
        hr: data.hr || data.heartRate || 0,
        temp: data.temp || data.temperature || 0,
        gsr: data.gsr || data.eda || data.galvanicSkinResponse || 0, // Support eda field
        timestamp: timestamp,
      };

      const level = classifyFallback(newData);

      setCurrentSensorData(newData);
      setSensorData((prevData) => [
        { ...newData, level },
        ...prevData.slice(0, 49), // Keep last 50 records
      ]);
    };

    // Listen for all possible sensor data events
    socket.on("sensor_data", (data) => {
      processSensorData(data, "sensor_data");
    });

    socket.on("esp32_live_data", (data) => {
      processSensorData(data, "esp32_live_data");
    });

    socket.on("live_sensor_data", (data) => {
      processSensorData(data, "live_sensor_data");
    });

    // Debug: Log ALL incoming events
    socket.onAny((eventName, ...args) => {
      console.log(`🔔 Event received: "${eventName}"`, args);
    });

    // Cleanup on unmount
    return () => {
      console.log("Disconnecting WebSocket...");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (levelText === "Stress Berat" && !hasShownWarning) {
      setShowWarningModal(true);
      setHasShownWarning(true);
    }
  }, [levelText, hasShownWarning]);

  const handleListenMusic = () => {
    setShowWarningModal(false);
    setShowMusicPlayer(true);
  };

  const handleCloseModal = () => {
    setShowWarningModal(false);
  };

  const handleCloseMusicPlayer = () => {
    setShowMusicPlayer(false);
  };

  return (
    <>
      <div className="flex flex-col px-4 pt-8 pb-6 md:px-8">
        <div className="flex mb-6 justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Status Anda Saat ini{" "}
            <span role="img" aria-label="meditasi">
              🧘
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row-reverse gap-4 mb-4 md:p-0">
          <div className="flex w-full md:max-w-[300px]">
            <StressLevelCard
              level={
                levelText === "Normal"
                  ? "normal"
                  : levelText === "Stress Berat"
                  ? "berat"
                  : "sedang"
              }
            />
          </div>

          <div className="flex flex-1 gap-4 flex-col md:flex-row-reverse">
            <div className="flex w-full md:max-w-[300px]">
              <SensorCard
                title="Galvanic Skin Response"
                bgColor="bg-gradient-to-r from-blue-400 to-green-300"
                icon={
                  <img
                    src="/images/gsr.svg"
                    alt="Galvanic Skin Response"
                    className="w-full h-full object-cover"
                  />
                }
                value={currentSensorData.gsr.toFixed(3)}
                isGSR={true}
                unit="µS"
                subtitle="MikroSiemens"
              />
            </div>

            <div className="flex flex-row w-full gap-4 h-full">
              <div className="flex justify-center items-center w-full min-h-full">
                <SensorCard
                  title="Heart Rate"
                  bgColor="bg-gradient-to-r from-red-500 to-orange-500"
                  icon={
                    <img
                      src="/images/hr.svg"
                      alt="Heart Rate"
                      className="w-full h-full object-cover"
                    />
                  }
                  value={currentSensorData.hr}
                  unit="BPM"
                  subtitle="Beat per Minute"
                />
              </div>

              <div className="flex justify-center items-center w-full h-full">
                <SensorCard
                  title="Skin Temperature"
                  bgColor="bg-gradient-to-r from-rose-400 to-amber-300"
                  icon={
                    <img
                      src="/images/temp.svg"
                      alt="Skin Temperature "
                      className="w-full h-full object-cover"
                    />
                  }
                  value={currentSensorData.temp}
                  unit="°C"
                  subtitle="Celcius"
                />
              </div>
            </div>
          </div>
        </div>{" "}
        <div className="flex w-full">
          <RecordsTable rows={sensorData} />
        </div>
      </div>

      <StressWarningModal
        isOpen={showWarningModal}
        onClose={handleCloseModal}
        onListenMusic={handleListenMusic}
      />

      <MusicPlayer isOpen={showMusicPlayer} onClose={handleCloseMusicPlayer} />
    </>
  );
}
