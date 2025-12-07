import { useState, useEffect, useCallback, useRef } from "react";
import { useInView } from "framer-motion";

export function useAnimatedCounter(
  end: number,
  duration: number = 2000,
  startOnView: boolean = true
) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const animate = useCallback(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration]);

  useEffect(() => {
    if (startOnView && isInView && !hasAnimated) {
      animate();
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, animate, startOnView]);

  const replay = useCallback(() => {
    setCount(0);
    animate();
  }, [animate]);

  return { count, ref, replay };
}
