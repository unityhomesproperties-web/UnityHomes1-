import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
// @ts-ignore
import './index.css';
import { initDailyBriefingScheduler } from './lib/dailyOperationsBriefing';

// Initialize 7:00 AM Daily Operations Briefing Cloud Functions Emulation
initDailyBriefingScheduler();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
