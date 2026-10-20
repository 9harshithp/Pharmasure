import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import './responsive.css';
import { ToastContainer } from 'react-bootstrap';
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';
import UserDashBoard from './Components/UserDashBoard';
import ManageMedication from './Components/ManageMedication';
import ConsumedChart from './Components/ConsumedChart';
import ConsumedCount from './Components/ConsumedCount';
import Profile from './Components/Profile';
import MentalSupport from './Components/MentalSupport';
import PharmaDashboard from './Components/PharmaDashBoard';
import Inventory from './Components/Inventory';
import Analytics from './Components/Analytics';
import { LanguageProvider } from './context/LanguageContext';
import Footer from './Components/Footer';

export const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

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
