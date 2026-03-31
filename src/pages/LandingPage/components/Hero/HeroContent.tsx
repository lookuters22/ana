import { useEffect } from "react";
import type { MotionValue } from "framer-motion";
import { motion, useTransform, useMotionValue, animate } from "framer-motion";

type HeroContentProps = {
  scrollYProgress: MotionValue<number>;
};

export function HeroContent({ scrollYProgress }: HeroContentProps) {
  const mountProgress = useMotionValue(0);

  useEffect(() => {
    const controls = animate(mountProgress, 1, {
      duration: 0.9,
      ease: [0.75, 0, 0.25, 1],
    });
    return () => controls.stop();
  }, [mountProgress]);

  const scrollOpacity = useTransform(scrollYProgress, [0, 0.09, 0.667], [1, 0, 0]);
  const scrollBlur = useTransform(scrollYProgress, [0, 0.09, 0.667], [0, 6, 6]);
  const mountBlur = useTransform(mountProgress, (p) => (1 - p) * 6);

  const opacity = useTransform(
    [mountProgress, scrollOpacity],
    ([m, s]) => (m as number) * (s as number),
  );

  const blurAmount = useTransform(
    [mountBlur, scrollBlur],
    ([mb, sb]) => (mb as number) + (sb as number),
  );

  const filter = useTransform(blurAmount, (b) => `blur(${b}px)`);

  return (
    <motion.div
      style={{ opacity, filter }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
    >
      <h1 className="text-display font-weak max-w-4xl text-white">
        Meet ANA.
      </h1>
      <p className="text-heading-2 font-weak mt-2 text-white/80">
        Your Autonomous Studio Manager.
      </p>
      <p className="text-body-small font-weak mt-6 max-w-2xl text-white/70">
        She handles your inbox, chases your leads, collects your payments, and
        delivers your galleries — so you can focus on what you love.
      </p>
      <div className="glass-shell interactive-glass mt-10 h-[52px] cursor-pointer rounded-[999px] shadow-[0_6px_12px_rgba(0,0,0,0.1)]">
        <button
          type="button"
          className="glass-inner justify-center px-10 text-body-small text-white whitespace-nowrap"
        >
          Get Early Access &rarr;
        </button>
      </div>
    </motion.div>
  );
}
