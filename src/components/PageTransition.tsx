import { CinematicTransition } from "./CinematicTransition";
import { QuickModeTransition } from "./QuickModeTransition";

type PageTransitionProps = {
  children: React.ReactNode;
  /** Cinematic blur/scale when entering or leaving Today; quick fade between other modes. */
  variant: "cinematic" | "quick";
  /** Slower settle-in only when landing on Today (cinematic only). */
  longTodayEntrance?: boolean;
};

export function PageTransition({ children, variant, longTodayEntrance = false }: PageTransitionProps) {
  if (variant === "quick") {
    return <QuickModeTransition>{children}</QuickModeTransition>;
  }
  return (
    <CinematicTransition longTodayEntrance={longTodayEntrance}>{children}</CinematicTransition>
  );
}
