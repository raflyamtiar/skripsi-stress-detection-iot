const now = "25/08/25 19:12:12";
const sensorData = [
    { timestamp: now, hr: 90, temp: 34.45, gsr: 12.234, level: "Stress Sedang" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 12.234, level: "Stress Sedang" },
    { timestamp: now, hr: 70, temp: 34.45, gsr: 12.234, level: "Normal" },
    { timestamp: now, hr: 60, temp: 34.45, gsr: 12.234, level: "Normal" },
    ...Array(8).fill({ timestamp: now, hr: 100, temp: 34.45, gsr: 12.234, level: "Stress Sedang" }),
    ...Array(7).fill({ timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" }),
    { timestamp: now, hr: 90, temp: 34.45, gsr: 12.234, level: "Stress Sedang" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 12.234, level: "Stress Sedang" },
    { timestamp: now, hr: 70, temp: 34.45, gsr: 12.234, level: "Normal" },
    { timestamp: now, hr: 60, temp: 34.45, gsr: 12.234, level: "Normal" },
    ...Array(6).fill({ timestamp: now, hr: 100, temp: 34.45, gsr: 12.234, level: "Stress Sedang" }),
    ...Array(7).fill({ timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" }),
    { timestamp: now, hr: 90, temp: 34.45, gsr: 12.234, level: "Stress Sedang" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 12.234, level: "Stress Sedang" },
    { timestamp: now, hr: 70, temp: 34.45, gsr: 12.234, level: "Normal" },
    { timestamp: now, hr: 60, temp: 34.45, gsr: 12.234, level: "Normal" },
    ...Array(3).fill({ timestamp: now, hr: 100, temp: 34.45, gsr: 12.234, level: "Stress Sedang" }),
    { timestamp: now, hr: 90, temp: 34.45, gsr: 12.234, level: "Stress Sedang" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 12.234, level: "Stress Sedang" }
];

export default sensorData;