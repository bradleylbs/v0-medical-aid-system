// ─── Role Definitions ────────────────────────────────────────────────────────

export type Role =
  | "practice_owner"    // Doctor / Owner — full access
  | "billing_manager"   // Senior billing staff — most access, no settings destructive actions
  | "receptionist"      // Front desk — patients, appointments, limited invoicing
  | "auditor"           // Read-only across all financial modules
  | "medical_aid_admin" // Scheme-side user — claims & payments read + respond only

// ─── Permission Keys ─────────────────────────────────────────────────────────

export type Permission =
  // Dashboard
  | "dashboard.view"
  | "dashboard.view_financials"
  // Patients
  | "patients.view"
  | "patients.create"
  | "patients.edit"
  | "patients.delete"
  | "patients.view_clinical"
  // Appointments
  | "appointments.view"
  | "appointments.create"
  | "appointments.edit"
  | "appointments.cancel"
  // Invoices
  | "invoices.view"
  | "invoices.create"
  | "invoices.edit"
  | "invoices.delete"
  | "invoices.submit"
  | "invoices.void"
  // Claims
  | "claims.view"
  | "claims.submit"
  | "claims.resubmit"
  | "claims.respond"    // Medical Aid Admin: can record responses
  // Payments
  | "payments.view"
  | "payments.record"
  | "payments.allocate"
  | "payments.write_off"
  | "payments.reconcile"
  // Reports
  | "reports.view"
  | "reports.export"
  | "reports.view_financial_detail"
  // Settings
  | "settings.view"
  | "settings.edit_practice"
  | "settings.manage_users"
  | "settings.manage_schemes"
  | "settings.billing_defaults"
  | "settings.security"

// ─── Role → Permissions Matrix ───────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  practice_owner: [
    "dashboard.view", "dashboard.view_financials",
    "patients.view", "patients.create", "patients.edit", "patients.delete", "patients.view_clinical",
    "appointments.view", "appointments.create", "appointments.edit", "appointments.cancel",
    "invoices.view", "invoices.create", "invoices.edit", "invoices.delete", "invoices.submit", "invoices.void",
    "claims.view", "claims.submit", "claims.resubmit", "claims.respond",
    "payments.view", "payments.record", "payments.allocate", "payments.write_off", "payments.reconcile",
    "reports.view", "reports.export", "reports.view_financial_detail",
    "settings.view", "settings.edit_practice", "settings.manage_users", "settings.manage_schemes",
    "settings.billing_defaults", "settings.security",
  ],
  billing_manager: [
    "dashboard.view", "dashboard.view_financials",
    "patients.view", "patients.create", "patients.edit", "patients.view_clinical",
    "appointments.view", "appointments.create", "appointments.edit", "appointments.cancel",
    "invoices.view", "invoices.create", "invoices.edit", "invoices.submit", "invoices.void",
    "claims.view", "claims.submit", "claims.resubmit",
    "payments.view", "payments.record", "payments.allocate", "payments.write_off", "payments.reconcile",
    "reports.view", "reports.export", "reports.view_financial_detail",
    "settings.view", "settings.manage_schemes", "settings.billing_defaults",
  ],
  receptionist: [
    "dashboard.view",
    "patients.view", "patients.create", "patients.edit",
    "appointments.view", "appointments.create", "appointments.edit", "appointments.cancel",
    "invoices.view", "invoices.create",
    "claims.view",
    "payments.view",
    "reports.view",
    "settings.view",
  ],
  auditor: [
    "dashboard.view", "dashboard.view_financials",
    "patients.view",
    "appointments.view",
    "invoices.view",
    "claims.view",
    "payments.view",
    "reports.view", "reports.export", "reports.view_financial_detail",
    "settings.view",
  ],
  medical_aid_admin: [
    "dashboard.view",
    "patients.view",
    "claims.view", "claims.respond",
    "payments.view",
    "reports.view",
  ],
}

// ─── Simulated Users ─────────────────────────────────────────────────────────

export interface SimulatedUser {
  id: string
  name: string
  title: string
  role: Role
  avatarInitials: string
  description: string
  color: string
}

export const SIMULATED_USERS: SimulatedUser[] = [
  {
    id: "usr-001",
    name: "Dr. Sipho Dlamini",
    title: "Practice Owner / GP",
    role: "practice_owner",
    avatarInitials: "SD",
    description: "Full system access — owner, doctor, and administrator.",
    color: "bg-blue-600",
  },
  {
    id: "usr-002",
    name: "Nomsa Khumalo",
    title: "Senior Billing Manager",
    role: "billing_manager",
    avatarInitials: "NK",
    description: "Manages all billing, claims, payments and reconciliation. Cannot delete records or manage users/security.",
    color: "bg-violet-600",
  },
  {
    id: "usr-003",
    name: "Thabo Mokoena",
    title: "Receptionist",
    role: "receptionist",
    avatarInitials: "TM",
    description: "Books appointments, registers patients, creates draft invoices. No financial editing or reporting access.",
    color: "bg-emerald-600",
  },
  {
    id: "usr-004",
    name: "Zanele Ndlovu",
    title: "External Auditor",
    role: "auditor",
    avatarInitials: "ZN",
    description: "Read-only access to all financial modules and reports. Cannot create, edit or submit anything.",
    color: "bg-amber-600",
  },
  {
    id: "usr-005",
    name: "Riyaad Ismail",
    title: "Discovery Health — Claims Assessor",
    role: "medical_aid_admin",
    avatarInitials: "RI",
    description: "Medical aid scheme representative. Can view and respond to claims only.",
    color: "bg-rose-600",
  },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    practice_owner: "Practice Owner",
    billing_manager: "Billing Manager",
    receptionist: "Receptionist",
    auditor: "Auditor (Read-Only)",
    medical_aid_admin: "Medical Aid Admin",
  }
  return labels[role]
}

export function getRoleBadgeStyle(role: Role): string {
  const styles: Record<Role, string> = {
    practice_owner: "bg-blue-100 text-blue-800 border-blue-200",
    billing_manager: "bg-violet-100 text-violet-800 border-violet-200",
    receptionist: "bg-emerald-100 text-emerald-800 border-emerald-200",
    auditor: "bg-amber-100 text-amber-800 border-amber-200",
    medical_aid_admin: "bg-rose-100 text-rose-800 border-rose-200",
  }
  return styles[role]
}

// Nav visibility per role
export const NAV_ACCESS: Record<string, Permission> = {
  "/": "dashboard.view",
  "/patients": "patients.view",
  "/appointments": "appointments.view",
  "/invoices": "invoices.view",
  "/claims": "claims.view",
  "/payments": "payments.view",
  "/reports": "reports.view",
  "/settings": "settings.view",
}
