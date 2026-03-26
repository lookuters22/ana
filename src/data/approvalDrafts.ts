/** Shared queue item for Approvals (photographer shell + manager shell). */

export type ApprovalDraft = {
  id: string;
  wedding: string;
  weddingId: string;
  to: string;
  subject: string;
  body: string;
};

export type ManagerApprovalDraft = ApprovalDraft & {
  photographerId: string;
};

export const PHOTOGRAPHER_APPROVAL_DRAFTS: ApprovalDraft[] = [
  {
    id: "draft-lake-como-timeline",
    wedding: "Sofia & Marco",
    weddingId: "lake-como",
    to: "Elena Rossi Planning",
    subject: "Re: Timeline v3 — photography coverage",
    body:
      "Confirmed—we will cover the rehearsal toast with one lead and one associate, ambient-only, per the agreed package. Please let us know if you need vendor headcounts updated.",
  },
  {
    id: "draft-london-consult",
    wedding: "Priya & Daniel",
    weddingId: "london",
    to: "Priya Kapoor",
    subject: "Re: Consultation follow-up",
    body:
      "It would be our honor to add a second photographer for the ceremony portion only. I have attached a concise addendum for your review—no pressure to decide today.",
  },
];

export const MANAGER_APPROVAL_DRAFTS: ManagerApprovalDraft[] = [
  {
    id: "mgr-draft-lake-como-timeline",
    photographerId: "ph-elena",
    wedding: "Sofia & Marco",
    weddingId: "lake-como",
    to: "Elena Rossi Planning",
    subject: "Re: Timeline v3 — photography coverage",
    body:
      "Confirmed—we will cover the rehearsal toast with one lead and one associate, ambient-only, per the agreed package. Please let us know if you need vendor headcounts updated.",
  },
  {
    id: "mgr-draft-london-consult",
    photographerId: "ph-luca",
    wedding: "Priya & Daniel",
    weddingId: "london",
    to: "Priya Kapoor",
    subject: "Re: Consultation follow-up",
    body:
      "It would be our honor to add a second photographer for the ceremony portion only. I have attached a concise addendum for your review—no pressure to decide today.",
  },
];
