import { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

export const LenisContext = createContext(null);

export const LenisProvider = ({ children }) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    // Animation loop
    const animate = (time) => {
      lenis.raf(time);
      requestAnimationFrame(animate);
    };

    const animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>
      {children}
    </LenisContext.Provider>
  );
};

// Custom hook to access the Lenis instance
export const useLenis = () => {
  return useContext(LenisContext);
};