import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useLottie } from "lottie-react";
import Pets from "./components/pets.json";
import Home from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Shared from "./pages/Shared";
import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const petsOptions = {
    animationData: Pets,
    loop: true,
    autoplay: true,
  };
  const { View: PetsView } = useLottie(petsOptions);

  useEffect(() => {
    let lastMouse = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      lastMouse = { x: e.clientX, y: e.clientY };
      setMousePosition({
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
      });
    };

    const handleScroll = () => {
      setMousePosition({
        x: lastMouse.x + window.scrollX,
        y: lastMouse.y + window.scrollY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 relative">
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${mousePosition.x + 20}px`,
            top: `${mousePosition.y - 17}px`,
            transform: "translateY(-50%) rotate(45deg)",
            width: "24px",
            height: "24px",
            zIndex: 1000,
          }}
        >
          {PetsView}
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shared/:sharedId" element={<Shared />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
