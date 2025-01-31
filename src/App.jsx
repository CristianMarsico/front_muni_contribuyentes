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
import PublicRoutes from "./routes/PublicRoutes";
import Quotas from './pages/Quotas';
import Configuration from './pages/Configuration';
import DdjjTaxpayer from './pages/DdjjTaxpayer';
import Footer from './components/Footer';
import DdjjToRafam from './pages/DdjjToRafam';
import RecoverPassword from './pages/RecoverPassword';
import FormAddTrade from './pages/FormAddTrade';
import Profile from './pages/Profile';

function App() {
  return (
    //  AuthProvider Proveedor de contexto para la autenticación, 
    // que hará disponible el estado de autenticación en toda la aplicación.
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Router>
          <Navbar />
          <div className="flex-grow-1 m-0">
            <Routes>
              <Route path="/" element={<PublicRoutes><AuthPage /></PublicRoutes>} />

              {/* Rutas privadas (requieren que el usuario esté autenticado). Usamos el componente PrivateRoutes para protegerlas. */}
              <Route path="/home" element={<PrivateRoutes><Home /></PrivateRoutes>} />
              <Route path="/perfil" element={<PrivateRoutes><Profile /></PrivateRoutes>} />
              <Route path="/cargarDDJJ" element={<PrivateRoutes><FormAddDdjj /></PrivateRoutes>} />
              <Route path="/contribuyente/:id" element={<PrivateRoutes><DetailsTaxpayer /></PrivateRoutes>} />
              <Route path="/ddjjContribuyente/:id_contribuyente/:id_comercio/:cod_comercio" element={<PrivateRoutes><DdjjTaxpayer /></PrivateRoutes>} />
              <Route path="/vencimientos" element={<PrivateRoutes><Quotas /></PrivateRoutes>} />
              <Route path="/configuracion" element={<PrivateRoutes><Configuration /></PrivateRoutes>} />
              <Route path="/rafam" element={<PrivateRoutes><DdjjToRafam /></PrivateRoutes>} />
              <Route path="/cargarComercio" element={<PrivateRoutes><FormAddTrade /></PrivateRoutes>} />
              <Route path="/recuperar" element={<PublicRoutes><RecoverPassword /></PublicRoutes>} />

              {/* Ruta para la página de error cuando la URL no coincide con ninguna de las anteriores. */}
              <Route path="*" element={<Error />} />
            </Routes>
          </div>
        </Router>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
