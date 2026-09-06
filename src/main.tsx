import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ToastNotificationProvider } from './context/ToastNotificationContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastNotificationProvider>
        <App />
      </ToastNotificationProvider>
    </ThemeProvider>
  </StrictMode>,
);
