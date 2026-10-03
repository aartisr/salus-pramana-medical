import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { AppRoot } from './app/root';

const rootElement = document.getElementById('root');

if (!rootElement) throw new Error('Missing #root application mount point');

createRoot(rootElement).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
);