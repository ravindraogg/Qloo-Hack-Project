import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/LandingPage";
import Auth from "./pages/Auth";
import "./App.css";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;