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
import DemoMode from './components/DemoMode';

// Placeholder components for basic routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
    <h1 className="text-3xl font-bold text-[var(--color-brand-deep)]">{title}</h1>
    <p className="mt-4 text-[var(--color-text-secondary)]">Content for this page is being generated...</p>
  </div>
);

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
          <Route path="/privacy" element={<Placeholder title="Privacy Policy" />} />
          <Route path="/terms" element={<Placeholder title="Terms of Service" />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
      <DemoMode />
    </BrowserRouter>
  );
}
