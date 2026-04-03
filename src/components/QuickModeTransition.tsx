import { motion, type Variants } from "framer-motion";

/**
 * Non-Today mode switches: quick opacity + horizontal slide with a snappy spring (not the cinematic blur/scale).
 */
const quickVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      opacity: { duration: 0.18, ease: [0.33, 1, 0.68, 1] },
      x: { type: "spring", stiffness: 460, damping: 36, mass: 0.65 },
    },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export function QuickModeTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={quickVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full w-full overflow-hidden"
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
}
