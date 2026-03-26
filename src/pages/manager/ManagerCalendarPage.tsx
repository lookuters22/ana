import { CalendarPage } from "../CalendarPage";
import { useManagerContext } from "../../context/ManagerContext";

export function ManagerCalendarPage() {
  const { selectedId } = useManagerContext();
  return <CalendarPage weddingLinkBase="/manager/wedding" filterPhotographerId={selectedId} />;
}
