export type StakeholderGroup = "couple" | "planning" | "vendor";

export type ContactAuthority = "primary" | "secondary";

export type DirectoryContact = {
  name: string;
  role: string;
  email: string;
  weddings: string[];
  stakeholderGroup: StakeholderGroup;
  /** Lead planner / main couple contact */
  authority?: ContactAuthority;
  /** e.g. florist, transport — vendors only */
  logisticsRole?: string;
};

const GROUP_LABEL: Record<StakeholderGroup, string> = {
  couple: "Couple",
  planning: "Planning team",
  vendor: "Vendors & logistics",
};

export function groupLabel(g: StakeholderGroup): string {
  return GROUP_LABEL[g];
}

export const CONTACTS_DIRECTORY: DirectoryContact[] = [
  {
    name: "Sofia Marin",
    role: "Bride",
    email: "sofia@email.com",
    weddings: ["lake-como"],
    stakeholderGroup: "couple",
    authority: "primary",
  },
  {
    name: "Marco Bianchi",
    role: "Groom",
    email: "marco@email.com",
    weddings: ["lake-como"],
    stakeholderGroup: "couple",
  },
  {
    name: "Elena Rossi",
    role: "Lead planner",
    email: "elena@rossiplans.it",
    weddings: ["lake-como"],
    stakeholderGroup: "planning",
    authority: "primary",
  },
  {
    name: "Priya Kapoor",
    role: "Bride",
    email: "priya@email.com",
    weddings: ["london"],
    stakeholderGroup: "couple",
    authority: "primary",
  },
  {
    name: "Daniel Okonkwo",
    role: "Groom",
    email: "daniel@email.com",
    weddings: ["london"],
    stakeholderGroup: "couple",
  },
  {
    name: "Harriet Vance",
    role: "Planner",
    email: "harriet@mayfairweddings.co.uk",
    weddings: ["london"],
    stakeholderGroup: "planning",
    authority: "primary",
  },
  {
    name: "Giulia Ferretti",
    role: "Florist",
    email: "giulia@fiori.it",
    weddings: ["lake-como"],
    stakeholderGroup: "vendor",
    logisticsRole: "Florals",
  },
  {
    name: "James Cole Transport",
    role: "Chauffeur",
    email: "ops@jcole-london.com",
    weddings: ["london"],
    stakeholderGroup: "vendor",
    authority: "secondary",
    logisticsRole: "Transport",
  },
];

export function contactsByGroup(): Record<StakeholderGroup, DirectoryContact[]> {
  const out: Record<StakeholderGroup, DirectoryContact[]> = {
    couple: [],
    planning: [],
    vendor: [],
  };
  for (const c of CONTACTS_DIRECTORY) {
    out[c.stakeholderGroup].push(c);
  }
  const order: StakeholderGroup[] = ["couple", "planning", "vendor"];
  for (const g of order) {
    out[g].sort((a, b) => {
      const ap = a.authority === "primary" ? 0 : 1;
      const bp = b.authority === "primary" ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return a.name.localeCompare(b.name);
    });
  }
  return out;
}
