import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SessionDetail from "./pages/SessionDetail";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/session/:sessionId" element={<SessionDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
