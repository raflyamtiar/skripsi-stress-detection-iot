import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SessionDetail from "./pages/SessionDetail";
import StressHistory from "./pages/StressHistory";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/session/:sessionId" element={<SessionDetail />} />
          <Route path="/stress-history" element={<StressHistory />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
