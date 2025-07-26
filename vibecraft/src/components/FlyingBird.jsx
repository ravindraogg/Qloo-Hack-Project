import React, { useEffect, useState } from 'react';
import { useLottie } from 'lottie-react';
import birdAnimationData from './Animation';

const FlyingBird = () => {
  const options = {
    animationData: birdAnimationData,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);

  const [birdStyle, setBirdStyle] = useState({
    top: '50vh',
    left: '-150px',
    transform: 'scaleX(1)',
    transition: 'all 5s linear',
  });

  const flyRandom = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Random top position
    const top = Math.floor(Math.random() * (screenHeight - 100));

    // Decide: fly left -> right or right -> left
    const flyRight = Math.random() > 0.5;

    const startLeft = flyRight ? -150 : screenWidth + 150;
    const endLeft = flyRight ? screenWidth + 150 : -150;
    const scaleX = flyRight ? 1 : -1;

    // Random duration
    const duration = Math.random() * 4 + 4; // Between 4s and 8s

    // Set initial position instantly (teleport outside screen)
    setBirdStyle({
      top: `${top}px`,
      left: `${startLeft}px`,
      transform: `scaleX(${scaleX})`,
      transition: 'none',
    });

    // Then after a tick, set the fly-in animation
    setTimeout(() => {
      setBirdStyle({
        top: `${top}px`,
        left: `${endLeft}px`,
        transform: `scaleX(${scaleX})`,
        transition: `all ${duration}s linear`,
      });
    }, 100); // Let DOM register first style
  };

  useEffect(() => {
    flyRandom();
    const interval = setInterval(() => {
      flyRandom();
    }, 9000); // Every 9 seconds, new flight

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        width: '120px',
        height: '120px',
        pointerEvents: 'none',
        zIndex: 1000,
        ...birdStyle,
      }}
    >
      {View}
    </div>
  );
};

export default FlyingBird;
