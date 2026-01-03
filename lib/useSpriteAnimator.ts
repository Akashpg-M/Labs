import { useState, useEffect, useRef } from 'react';

export function useSpriteAnimator(
  isMoving: boolean, 
  facing: 'left' | 'right' | 'up' | 'down', 
  speed: number = 150
) {
  const [frame, setFrame] = useState(0);
  
  // FIX 1: Change <number> to <number | undefined> and pass (undefined) as initial value
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        
        // Only cycle frames if moving
        if (isMoving && deltaTime > speed) {
          setFrame((prev) => (prev + 1) % 4); 
          previousTimeRef.current = time;
        }
      } else {
        previousTimeRef.current = time;
      }
      
      if (isMoving) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setFrame(0); // Reset to standing pose
      }
    };

    if (isMoving) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setFrame(0); // Reset immediately if stopped
    }

    return () => {
      // FIX 2: Check for undefined before cancelling
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isMoving, speed]);

// ... imports ...

// ... inside the hook ...

  const getRow = () => {
    switch(facing) {
      case 'down': return 0;
      case 'left': return 1;
      case 'right': return 2;
      case 'up': return 3;
      default: return 0;
    }
  };

  // !!! CRITICAL MATH FIX !!!
  // Frame width must match FRAME_W from Player.tsx (16)
  // Row height must match FRAME_H from Player.tsx (16)
  return { 
    backgroundPosition: `-${frame * 16}px -${getRow() * 16}px` 
  };
}