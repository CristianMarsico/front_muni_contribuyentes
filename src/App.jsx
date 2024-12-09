import Home from "./pages/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import { Route, HashRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import { AuthProvider } from "./context/AuthProvider";
import PrivateRoutes from "./routes/PrivateRoutes";
function App() {

  return (
    <AuthProvider>
    <div className="d-flex flex-column min-vh-100 ">
      <Router>
        <Navbar />
        <div className="flex-grow-1 m-0 ">
          <Routes>
            <Route path="/" element={<AuthPage />} />
              <Route path="/home" element={<PrivateRoutes><Home /></PrivateRoutes>} />
          </Routes>
        </div>
      </Router>
    </div>
    </AuthProvider>

  )
}

export default App
