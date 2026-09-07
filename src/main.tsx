import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { FontSizeProvider } from './context/FontSizeContext.tsx';
import { ToastNotificationProvider } from './context/ToastNotificationContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <FontSizeProvider>
          <ToastNotificationProvider>
            <App />
          </ToastNotificationProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
