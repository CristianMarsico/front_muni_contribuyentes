import React from 'react'
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import Error from "./pages/Error";
import FormAddDdjj from "./pages/FormAddDdjj";
import DetailsTaxpayer from "./pages/DetailsTaxpayer";
import { AuthProvider } from "./context/AuthProvider";
import PrivateRoutes from "./routes/PrivateRoutes";

function App() {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Router>
          <Navbar />
          <div className="flex-grow-1 m-0">
            <Routes>
              <Route path="/" element={<AuthPage />} />
              <Route path="/home" element={<PrivateRoutes><Home /></PrivateRoutes>} />
              <Route path="/newDdjj" element={<PrivateRoutes><FormAddDdjj /></PrivateRoutes>} />
              <Route path="/contribuyente/:id" element={<PrivateRoutes><DetailsTaxpayer /></PrivateRoutes>} />
              <Route path="*" element={<Error />} />
            </Routes>
          </div>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
