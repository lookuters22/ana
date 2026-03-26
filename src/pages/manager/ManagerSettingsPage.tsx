import { Link } from "react-router-dom";
import { SettingsPage } from "../SettingsPage";

export function ManagerSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-accent/5 px-4 py-3 text-[13px] text-ink-muted">
        <span className="font-semibold text-ink">Studio manager</span>
        {" · "}
        <Link to="/" className="font-semibold text-accent hover:text-accent-hover">
          Photographer view
        </Link>
      </div>
      <SettingsPage showManagerPreviewLink={false} />
    </div>
  );
}
