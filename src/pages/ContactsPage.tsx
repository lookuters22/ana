import { Link } from "react-router-dom";

const people = [
  { name: "Elena Rossi", role: "Planner", email: "elena@rossiplans.it", weddings: ["lake-como"] },
  { name: "Sofia Marin", role: "Bride", email: "sofia@email.com", weddings: ["lake-como"] },
  { name: "Priya Kapoor", role: "Bride", email: "priya@email.com", weddings: ["london"] },
];

export function ContactsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Contacts</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-muted">
          Everyone you have ever spoken with—deduped by email, linked back to weddings.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="grid grid-cols-[1.2fr_0.8fr_1.4fr_0.9fr] gap-px bg-border text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
          <div className="bg-surface px-4 py-3">Name</div>
          <div className="bg-surface px-4 py-3">Role</div>
          <div className="bg-surface px-4 py-3">Email</div>
          <div className="bg-surface px-4 py-3">Weddings</div>
        </div>
        {people.map((p) => (
          <div
            key={p.email}
            className="grid grid-cols-[1.2fr_0.8fr_1.4fr_0.9fr] gap-px border-t border-border bg-border text-[13px]"
          >
            <div className="bg-surface px-4 py-3 font-semibold text-ink">{p.name}</div>
            <div className="bg-surface px-4 py-3 text-ink-muted">{p.role}</div>
            <div className="bg-surface px-4 py-3 text-ink-muted">{p.email}</div>
            <div className="bg-surface px-4 py-3">
              {p.weddings.map((id) => (
                <Link key={id} to={`/wedding/${id}`} className="font-semibold text-accent hover:text-accent-hover">
                  View
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
