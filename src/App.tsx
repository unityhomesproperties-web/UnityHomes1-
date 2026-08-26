import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import MissionPage from './pages/MissionPage';
import VisionPage from './pages/VisionPage';
import ServicesPage from './pages/ServicesPage';
import ProfessionalsPage from './pages/ProfessionalsPage';
import AreaIntelligencePage from './pages/AreaIntelligencePage';
import WaitlistPage from './pages/WaitlistPage';
import WaitlistSuccessPage from './pages/WaitlistSuccessPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import DemoMode from './components/DemoMode';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/mission" element={<MissionPage />} />
          <Route path="/vision" element={<VisionPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/professionals" element={<ProfessionalsPage />} />
          <Route path="/area-intelligence" element={<AreaIntelligencePage />} />
          <Route path="/waitlist" element={<WaitlistPage />} />
          <Route path="/waitlist/success" element={<WaitlistSuccessPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
      <DemoMode />
    </BrowserRouter>
  );
}
