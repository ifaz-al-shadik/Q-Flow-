import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook that animates a number from 0 to end value
 * when the element scrolls into view.
 */
export const useAnimatedCounter = (end, duration = 1500) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;

                    const startTime = performance.now();
                    const animate = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease-out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.round(eased * end));

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.3 }
        );

        const current = ref.current;
        if (current) observer.observe(current);
        return () => { if (current) observer.unobserve(current); };
    }, [end, duration]);

    return { count, ref };
};
