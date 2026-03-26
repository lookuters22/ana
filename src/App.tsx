import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { TodayPage } from "./pages/TodayPage";
import { InboxPage } from "./pages/InboxPage";
import { WeddingDetailPage } from "./pages/WeddingDetailPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { PipelinePage } from "./pages/PipelinePage";
import { CalendarPage } from "./pages/CalendarPage";
import { ContactsPage } from "./pages/ContactsPage";
import { TasksPage } from "./pages/TasksPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WeddingsPage } from "./pages/WeddingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<TodayPage />} />
        <Route path="weddings" element={<WeddingsPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="wedding/:weddingId" element={<WeddingDetailPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
