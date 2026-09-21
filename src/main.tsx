import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FacebookProvider } from '@kazion/react-facebook-login';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
    <FacebookProvider appId="1094705089173300" version="v25.0">
      <App />
    </FacebookProvider>
  </StrictMode>,
);
