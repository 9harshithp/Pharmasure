import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import './responsive.css';
import { ToastContainer } from 'react-bootstrap';
import {
  Home,
  Login,
  Register,
  UserDashBoard,
  ManageMedication,
  ConsumedChart,
  ConsumedCount,
  Profile,
  MentalSupport,
  PharmaDashboard,
  Inventory,
  Analytics,
  Footer,
} from './Components';
import { LanguageProvider } from './context/LanguageContext';

export const baseUrl = process.env.REACT_APP_API_BASE_URL || "https://pharmasure-predictive-expiry-alerts-for.onrender.com";

function App() {
  return (
    <LanguageProvider>
      <div className="App d-flex flex-column min-vh-100">
        <BrowserRouter>
          <ToastContainer />
          <div className="flex-grow-1">
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
          </div>
          <Footer />
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}

export default App;
