import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Hero from './Hero';
import './index.css';

const container = document.getElementById('hero-root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <Hero />
    </StrictMode>,
  );
}
