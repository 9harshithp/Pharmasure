import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import './responsive.css';
import Home from './Components/Home';
import Footer from './Components/Footer';
import { LanguageProvider } from './context/LanguageContext';

// Dynamic lazy-loaded routes for optimal initial bundle & mobile performance
const Login = lazy(() => import('./Components/Login'));
const Register = lazy(() => import('./Components/Register'));
const UserDashBoard = lazy(() => import('./Components/UserDashBoard'));
const ManageMedication = lazy(() => import('./Components/ManageMedication'));
const ConsumedChart = lazy(() => import('./Components/ConsumedChart'));
const ConsumedCount = lazy(() => import('./Components/ConsumedCount'));
const Profile = lazy(() => import('./Components/Profile'));
const MentalSupport = lazy(() => import('./Components/MentalSupport'));
const PharmaDashboard = lazy(() => import('./Components/PharmaDashBoard'));
const Inventory = lazy(() => import('./Components/Inventory'));
const Analytics = lazy(() => import('./Components/Analytics'));

export const baseUrl = process.env.REACT_APP_API_BASE_URL || "https://pharmasure-predictive-expiry-alerts-for.onrender.com";

const RouteLoader = () => (
  <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
    <div className="spinner-border text-info" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    // Silently pre-warm Render free-tier backend in background using a valid endpoint
    try {
      fetch(`${baseUrl}/inventory`).catch(() => {});
    } catch (e) {}
  }, []);
  return (
    <LanguageProvider>
      <div className="App d-flex flex-column min-vh-100">
        <BrowserRouter>
          <div className="flex-grow-1">
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/userDashboard" element={<UserDashBoard />}>
                  <Route index element={<ManageMedication />} />  
                  <Route path="manageMedication" element={<ManageMedication />} />
                  <Route path="consumedChart" element={<ConsumedChart />} />
                  <Route path="consumedCount" element={<ConsumedCount />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="mentalSupport" element={<MentalSupport />} />
                </Route>
                <Route path="/pharmaDashBoard" element={<PharmaDashboard />}>
                  <Route index element={<Inventory />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="analytics" element={<Analytics />} />
                </Route>
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}

export default App;
