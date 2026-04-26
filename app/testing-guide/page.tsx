"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronRight, CheckCircle2, Circle, User, FileText, CreditCard, BarChart3, Settings, Shield, AlertTriangle, ClipboardList, Search, X, Stethoscope } from "lucide-react"
import { ICD10_CODES } from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Step {
  action: string
  expected: string
  note?: string
}

interface TestCase {
  id: string
  title: string
  steps: Step[]
  passCondition: string
}

interface Section {
  id: string
  icon: React.ReactNode
  role: string
  badge: string
  badgeVariant: "default" | "secondary" | "destructive" | "outline"
  description: string
  credentials: { label: string; value: string }[]
  testCases: TestCase[]
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const TEST_SECTIONS: Section[] = [
  // =========================================================================
  // 1. PRACTICE OWNER
  // =========================================================================
  {
    id: "practice-owner",
    icon: <Shield className="h-5 w-5" />,
    role: "Practice Owner",
    badge: "Full Access",
    badgeVariant: "default",
    description:
      "The Practice Owner has unrestricted access to all modules including financial reports, user management, write-offs, and system settings. This is the highest-privilege role within a single practice.",
    credentials: [
      { label: "Name", value: "Dr. Sipho Dlamini" },
      { label: "Role", value: "PRACTICE_OWNER" },
      { label: "Email", value: "sipho.dlamini@drdlamini.co.za" },
      { label: "Password", value: "MediBill@2026" },
      { label: "MFA", value: "Disabled (demo)" },
    ],
    testCases: [
      {
        id: "po-01",
        title: "First-time Setup Wizard",
        steps: [
          { action: "Navigate to /auth/setup", expected: "4-step wizard is displayed starting on Step 1 (Practice Details)." },
          { action: "Enter Practice Name: 'Dr Dlamini Family Practice', Practice Number: 'PR0001234', HPCSA Number: 'MP0456789'", expected: "Fields accept input, validation passes with green indicators." },
          { action: "Click Next to Step 2 (Owner Account)", expected: "Step 2 appears. Progress bar moves to 50%." },
          { action: "Enter email sipho.dlamini@drdlamini.co.za and password MediBill@2026 (confirm match)", expected: "Password strength indicator shows 'Strong'. Both fields validate." },
          { action: "Proceed to Step 3 (MediSwitch Credentials)", expected: "Switch provider dropdown shows MEDISWITCH and HEALTHBRIDGE options." },
          { action: "Enter Switch Username: 'DISC-DLAMINI-001', Switch Password: 'Switch@2026'", expected: "Credentials are accepted, 'Test Connection' button is available." },
          { action: "Proceed to Step 4 (Tariff Setup). Set Tariff Percentage to 100%", expected: "Slider and input field are in sync. Value displays as '100.00%'." },
          { action: "Click 'Complete Setup'", expected: "Success screen shows. Redirect to /auth/login within 3 seconds." },
        ],
        passCondition: "All 4 steps complete without errors. User is redirected to the login page.",
      },
      {
        id: "po-02",
        title: "Login with Rate-Limiting",
        steps: [
          { action: "Navigate to /auth/login", expected: "Login form shows email and password fields." },
          { action: "Enter email sipho.dlamini@drdlamini.co.za and a WRONG password 5 times", expected: "After the 5th attempt, a red warning banner displays: 'Account locked for 15 minutes due to too many failed login attempts'." },
          { action: "Wait the lock-out period and attempt login with correct password: MediBill@2026", expected: "Login succeeds. Dashboard loads." },
        ],
        passCondition: "Login rate-limiting triggers correctly. Successful login after lockout period loads the Dashboard.",
      },
      {
        id: "po-03",
        title: "Forgot Password Flow",
        steps: [
          { action: "Click 'Forgot Password?' on the login page", expected: "Redirected to /auth/forgot-password. Email input is displayed." },
          { action: "Enter email: sipho.dlamini@drdlamini.co.za and click 'Send Reset Code'", expected: "Success message: 'If that email is registered, a 6-digit OTP has been sent.'" },
          { action: "Enter OTP: 123456 and a new password: NewPass@2026!", expected: "OTP field accepts 6 digits. Password fields validate and match." },
          { action: "Click 'Reset Password'", expected: "Success banner appears. 'Return to Login' button is displayed." },
        ],
        passCondition: "Password reset flow completes with success message and a link back to login.",
      },
      {
        id: "po-04",
        title: "Dashboard Overview",
        steps: [
          { action: "After login, observe the Dashboard (home page)", expected: "4 metric cards visible: Today's Invoices Total, Outstanding Balance, Pending Claims, Rejected Claims." },
          { action: "Verify today's appointments list below the metric cards", expected: "Appointment list shows patient name, time, type, and status badges (Booked, Arrived, etc.)." },
          { action: "Verify Recent Activity feed on the right", expected: "Shows timestamped events (invoice created, claim submitted, payment received)." },
          { action: "Click 'New Patient' quick-action button", expected: "Navigates to /patients/new.", note: "Quick actions are the bottom row of the dashboard." },
          { action: "Click 'New Invoice' quick-action button", expected: "Navigates to /invoices/new." },
        ],
        passCondition: "Dashboard renders all 4 metric cards, today's appointments, activity feed, and all quick-action buttons navigate correctly.",
      },
      {
        id: "po-05",
        title: "Settings — User Management",
        steps: [
          { action: "Navigate to /settings, click the 'Users' tab", expected: "Users list shows all practice users with their roles and status." },
          { action: "Click 'Invite User' button", expected: "Modal/form opens to enter name, email, and role." },
          { action: "Fill in: Name 'Nomsa Dube', Email 'nomsa@drdlamini.co.za', Role 'ADMIN_STAFF', click Invite", expected: "New user appears in the users list with status 'Pending'." },
          { action: "Find the new user and click the role dropdown to change to 'DOCTOR'", expected: "Role updates and shows DOCTOR badge." },
          { action: "Click 'Deactivate' on the user", expected: "Confirmation dialog appears. After confirming, user status changes to 'Inactive'." },
        ],
        passCondition: "Full user CRUD (invite, update role, deactivate) completes without error.",
      },
      {
        id: "po-06",
        title: "Write-Off Approval (Owner-only action)",
        steps: [
          { action: "Navigate to /invoices and find invoice INV-20260424-00011 (Lungelo Dube, R1,250 outstanding)", expected: "Invoice is visible with PARTIALLY_PAID status." },
          { action: "Click into the invoice detail", expected: "Invoice detail page shows outstanding balance of R750.00." },
          { action: "Click 'Write Off Balance'", expected: "Modal appears requiring an approval note. Fields show: reason text area and 'Requires Practice Owner approval' warning." },
          { action: "Enter reason: 'Patient unable to pay, approved by owner' and confirm", expected: "Invoice status changes to WRITTEN_OFF. Outstanding balance shows R0.00." },
        ],
        passCondition: "Write-off modal requires a note and updates the invoice status to WRITTEN_OFF after confirmation.",
      },
    ],
  },

  // =========================================================================
  // 2. ADMIN STAFF
  // =========================================================================
  {
    id: "admin-staff",
    icon: <ClipboardList className="h-5 w-5" />,
    role: "Admin Staff",
    badge: "Billing & Patients",
    badgeVariant: "secondary",
    description:
      "Admin Staff handle day-to-day patient registration, appointment booking, invoice creation, claim submission, and payment recording. They cannot access financial reports or perform write-offs without Practice Owner approval.",
    credentials: [
      { label: "Name", value: "Nomsa Dube" },
      { label: "Role", value: "ADMIN_STAFF" },
      { label: "Email", value: "nomsa@drdlamini.co.za" },
      { label: "Password", value: "AdminPass@2026" },
      { label: "MFA", value: "Disabled (demo)" },
    ],
    testCases: [
      {
        id: "as-01",
        title: "Register a New Patient — Medical Aid Member",
        steps: [
          { action: "Navigate to /patients/new", expected: "New Patient form loads with all sections visible: Demographics, Contact Details, Medical Aid, Emergency Contact." },
          { action: "Enter SA ID Number: 9001015000089", expected: "Date of Birth auto-populates to 1990-01-01. Gender auto-selects 'Female'. Age calculates to 36." },
          { action: "Enter First Name: 'Zanele', Last Name: 'Mokoena'", expected: "Both fields accept the input." },
          { action: "Enter Phone: 071 111 2222, Email: zanele@email.com", expected: "Fields validate format correctly." },
          { action: "In the Medical Aid section, search and select 'Discovery Health'", expected: "Plan Option field becomes available. MediSwitch destination code shows 'DISC'." },
          { action: "Enter Membership Number: DH9999999, Plan Option: 'Coastal Core'", expected: "Fields accept the values." },
          { action: "Leave 'Is Principal Member' checked. Enter Dependent Code: 00", expected: "Dependent code field accepts '00'." },
          { action: "Fill Emergency Contact: 'Thabo Mokoena', 082 333 4444", expected: "Fields accept the values." },
          { action: "Click 'Check Benefits' inline button", expected: "Benefit check panel updates to show the patient's savings and day-to-day balances (mock data). Active member badge displays in green." },
          { action: "Click 'Register Patient'", expected: "Success toast shows 'Patient registered successfully'. Redirect to the new patient's detail page." },
        ],
        passCondition: "Patient is created, SA ID auto-populates DOB and gender, benefit check runs, and patient detail page loads after save.",
      },
      {
        id: "as-02",
        title: "Register a New Patient — Cash Patient",
        steps: [
          { action: "Navigate to /patients/new", expected: "Form loads." },
          { action: "Toggle 'Cash Patient' switch to ON", expected: "All Medical Aid fields (scheme, membership number, plan option, dependent code) are disabled and greyed out." },
          { action: "Enter: First Name 'Peter', Last Name 'Smith', ID 7806015000083, Phone 083 555 6666", expected: "ID auto-populates DOB: 1978-06-01, Gender: Male. Phone validates correctly." },
          { action: "Click 'Register Patient'", expected: "Patient saved. Detail page shows 'Cash Patient' badge next to the patient name. Outstanding Balance shows R0.00." },
        ],
        passCondition: "Cash patient registration hides scheme fields and saves correctly.",
      },
      {
        id: "as-03",
        title: "Book a New Appointment",
        steps: [
          { action: "Navigate to /appointments/new", expected: "Appointment booking form loads: Patient Search, Date Picker, Time Slot Grid, Type and Duration selectors." },
          { action: "Search for 'Thembi' in the patient search field", expected: "Dropdown shows 'Thembi Nkosi — Discovery Health — DH1234567'." },
          { action: "Select Thembi Nkosi from the dropdown", expected: "Patient card appears showing scheme, membership number, and outstanding balance." },
          { action: "Select today's date in the date picker", expected: "Time slot grid updates to show available and booked slots for today." },
          { action: "Click an available time slot, e.g. 10:00", expected: "Slot highlights in blue. Start time field populates with 10:00." },
          { action: "Try clicking a greyed-out (booked) slot", expected: "Slot cannot be selected. Tooltip shows 'Already booked'." },
          { action: "Set Appointment Type: 'Follow-up', Duration: 20 min", expected: "End time auto-calculates to 10:20." },
          { action: "Toggle 'Send SMS reminder' ON", expected: "SMS reminder will be sent 24h before appointment (indicated by info text)." },
          { action: "Click 'Book Appointment'", expected: "Success toast shows. Redirected to /appointments calendar with the new appointment visible." },
        ],
        passCondition: "Appointment is booked and appears on the calendar with the correct patient, time, and status.",
      },
      {
        id: "as-04",
        title: "Create and Submit a Medical Aid Invoice",
        steps: [
          { action: "Navigate to /invoices/new", expected: "New Invoice form loads." },
          { action: "Search for patient 'Fatima Patel' in the patient selector", expected: "Patient card shows: GEMS, GEMS5678901, Beryl plan, R0 outstanding." },
          { action: "Set Date of Service to today", expected: "Date field accepts today's date." },
          { action: "Set Treating Doctor to 'Dr. Sipho Dlamini'", expected: "Doctor selected." },
          { action: "In ICD-10 Diagnosis section, type 'upper respiratory'", expected: "Dropdown shows 'J06.9 — Acute upper respiratory infection, unspecified'." },
          { action: "Select J06.9", expected: "ICD-10 chip appears in the selected codes area." },
          { action: "In Tariff Code section, type '0191'", expected: "Dropdown shows '0191 — Consultation, surgery, repeat patient — NRPL: R365.00'." },
          { action: "Select 0191 and set quantity to 1", expected: "Line item row appears: code 0191, description, quantity 1, unit price R365.00, line total R365.00." },
          { action: "Search for NAPPI code 'Panado'", expected: "Dropdown shows 'Panado 500mg Tablets — NAPPI: 713842001 — SEP: R23.50'." },
          { action: "Select Panado, quantity 1 pack", expected: "Second line item appears: Panado 500mg, R23.50." },
          { action: "Observe the validation panel", expected: "All green: ICD-10 present, patient has membership number, within 4-month deadline." },
          { action: "Observe the totals panel", expected: "Subtotal = R388.50. Medical Aid Claimed = R388.50. Patient Liable = R0.00." },
          { action: "Click 'Finalise Invoice'", expected: "Invoice status changes to SUBMITTED. Invoice number auto-generated (e.g. INV-20260426-00015). Line items are now read-only." },
          { action: "Click 'Submit Claim to MediSwitch'", expected: "Claim is created with status SUBMITTED. EDIFACT payload shown on the claim detail. Switch reference number displayed." },
        ],
        passCondition: "Invoice is created with ICD-10 and tariff codes, finalised, and claim is submitted with a switch reference number.",
      },
      {
        id: "as-05",
        title: "Create a Cash Patient Invoice (No Medical Aid)",
        steps: [
          { action: "Navigate to /invoices/new and select patient 'Lungelo Dube' (Cash Patient)", expected: "Patient card shows 'Cash Patient'. No membership number shown. Yellow warning: 'Cash patient — claim cannot be submitted to a scheme'." },
          { action: "Add ICD-10 code: R50.9 (Fever, unspecified)", expected: "Code chip appears." },
          { action: "Add Tariff Code: 0191 (Repeat Consultation)", expected: "Line item at R365.00 (NRPL)." },
          { action: "Observe validation panel", expected: "Shows warning: 'No medical aid — invoice is patient-liable'. Submit Claim button is disabled." },
          { action: "Click 'Finalise Invoice'", expected: "Invoice finalised. Status: DRAFT changes to SUBMITTED. Patient Liable amount = R365.00." },
          { action: "Click 'Send to Patient' (email/SMS)", expected: "Modal shows send options: Email and SMS/WhatsApp. Confirm send." },
        ],
        passCondition: "Cash invoice finalises correctly. Claim submission is disabled. Send to patient action is available.",
      },
      {
        id: "as-06",
        title: "Handle a Rejected Claim",
        steps: [
          { action: "Navigate to /claims and filter by status 'Rejected'", expected: "Rejected claims banner shows. Claim clm-003 (Robert Khumalo, Medihelp) is displayed." },
          { action: "Click into claim clm-003", expected: "Claim detail page loads. Rejection reason shown in plain English: 'Prior authorisation was required and not obtained'." },
          { action: "Read the EDIFACT payload section", expected: "Raw EDIFACT message is visible in a monospace code block." },
          { action: "Click 'Resubmit Claim'", expected: "Modal opens: 'Before resubmitting, confirm you have corrected the issue.' Confirmation required." },
          { action: "Confirm resubmission", expected: "Claim status changes to RESUBMITTED. New switch reference number is assigned. Retry count increments." },
        ],
        passCondition: "Rejected claim is clearly explained, and resubmission creates a new submission record with an updated reference number.",
      },
      {
        id: "as-07",
        title: "Record a Patient Payment (Cash)",
        steps: [
          { action: "Navigate to /payments and click 'Record Payment'", expected: "Record Payment modal opens." },
          { action: "Select Payment Type: 'Patient Cash'", expected: "Patient search field becomes available." },
          { action: "Search for 'Lungelo Dube' and select", expected: "Patient selected. Their outstanding invoices are listed below." },
          { action: "Enter Amount: R365.00, Reference: 'CASH-REC-002', Date: today", expected: "Fields accept values." },
          { action: "Click 'Record Payment'", expected: "Payment is saved. Allocation modal opens asking which invoice(s) to allocate against." },
          { action: "Select invoice INV-20260424-00011 and set allocation: R365.00", expected: "Allocation sum matches payment amount (R365.00 = R365.00). 'Confirm Allocation' button activates." },
          { action: "Click 'Confirm Allocation'", expected: "Invoice outstanding balance reduces. If balance = R0, status changes to PAID." },
        ],
        passCondition: "Cash payment is recorded and allocated. Invoice balance updates correctly.",
      },
      {
        id: "as-08",
        title: "Upload a Remittance Advice",
        steps: [
          { action: "Navigate to /payments, click 'Remittance' tab", expected: "Remittance upload section is visible." },
          { action: "Click 'Upload Remittance Advice' or drag-and-drop a PDF/TXT file", expected: "File upload area activates. File name is shown after selection." },
          { action: "Select scheme: 'Discovery Health'", expected: "Scheme dropdown shows the selected value." },
          { action: "Set Remittance Date to today", expected: "Date field accepts today's date." },
          { action: "Click 'Process Remittance'", expected: "Auto-reconciliation runs. Matched items listed in green. Unmatched items listed in amber requiring manual action." },
          { action: "Click 'Manually Match' on an unmatched item", expected: "Modal opens to search and link the item to an invoice." },
        ],
        passCondition: "Remittance upload triggers auto-reconciliation. Matched and unmatched items are clearly separated.",
      },
    ],
  },

  // =========================================================================
  // 3. DOCTOR
  // =========================================================================
  {
    id: "doctor",
    icon: <User className="h-5 w-5" />,
    role: "Doctor",
    badge: "Clinical View",
    badgeVariant: "outline",
    description:
      "Doctors primarily use the calendar to view their daily schedule and can start the billing process from an appointment. They have read access to invoices they authored but cannot edit patient demographics or access financial reports.",
    credentials: [
      { label: "Name", value: "Dr. Ayesha Khan" },
      { label: "Role", value: "DOCTOR" },
      { label: "Email", value: "ayesha.khan@drdlamini.co.za" },
      { label: "Password", value: "DoctorPass@2026" },
      { label: "HPCSA No.", value: "MP0789012" },
      { label: "MFA", value: "Disabled (demo)" },
    ],
    testCases: [
      {
        id: "dr-01",
        title: "View Daily Appointment Calendar",
        steps: [
          { action: "Log in as Dr. Ayesha Khan and observe the Dashboard", expected: "Dashboard shows today's appointments filtered to Dr. Khan's patients." },
          { action: "Navigate to /appointments", expected: "Calendar shows week view. Appointments are colour-coded: blue (Booked), green (Arrived), grey (Completed), red (No-Show)." },
          { action: "Switch to Day view", expected: "Day grid shows time slots from 07:00–18:00 for today with appointments in the correct slots." },
          { action: "Click on an appointment (e.g. Thembi Nkosi at 09:00)", expected: "Detail panel slides in: patient name, medical aid, plan option, current membership status, and 'Start Billing' button." },
        ],
        passCondition: "Calendar loads, colour-coding is correct, and appointment detail panel shows patient medical aid status.",
      },
      {
        id: "dr-02",
        title: "Start Billing from Appointment",
        steps: [
          { action: "In the appointment detail panel, click 'Start Billing'", expected: "Navigates to /invoices/new with the patient and date of service pre-filled from the appointment." },
          { action: "Observe the pre-filled fields", expected: "Patient: Thembi Nkosi. Date of Service: today. Treating Doctor: Dr. Ayesha Khan." },
          { action: "Add ICD-10: J45.9 (Asthma, unspecified) and Tariff Code: 0191", expected: "Line item added. Totals calculated." },
          { action: "Click 'Finalise Invoice'", expected: "Invoice finalised and linked back to the original appointment." },
        ],
        passCondition: "Billing initiated from appointment pre-fills the invoice form. Finalised invoice links back to the appointment.",
      },
      {
        id: "dr-03",
        title: "View Patient Details (Read Access)",
        steps: [
          { action: "Navigate to /patients and search 'James van der Merwe'", expected: "Patient row displays with scheme, last visit date, and outstanding balance." },
          { action: "Click into the patient detail page", expected: "Tabs visible: Invoices, Claims, Payments, Benefit Checks." },
          { action: "Click the Claims tab", expected: "Shows all claims for this patient with status badges." },
          { action: "Click the Payments tab", expected: "Shows payment history with amounts, references, and allocation status." },
          { action: "Click the Benefit Checks tab", expected: "Shows historical benefit check results with savings balances at time of check." },
          { action: "Try to click 'Edit Patient' button", expected: "Button is either hidden or shows 'Insufficient permissions' message for DOCTOR role.", note: "Edit access is restricted to ADMIN_STAFF and above." },
        ],
        passCondition: "Doctor can view all 4 tabs on patient detail but cannot edit patient demographics.",
      },
    ],
  },

  // =========================================================================
  // 4. BUREAU OPERATOR
  // =========================================================================
  {
    id: "bureau-operator",
    icon: <BarChart3 className="h-5 w-5" />,
    role: "Bureau Operator",
    badge: "Multi-Practice",
    badgeVariant: "destructive",
    description:
      "Bureau Operators manage multiple practices on behalf of a billing bureau. They can access all billing functions across their assigned practices but cannot access another bureau's practices. They can approve write-offs.",
    credentials: [
      { label: "Name", value: "Linda Botha" },
      { label: "Role", value: "BUREAU_OPERATOR" },
      { label: "Bureau", value: "MedAdmin Bureau" },
      { label: "Email", value: "linda@medadmin.co.za" },
      { label: "Password", value: "BureauPass@2026" },
      { label: "MFA", value: "Disabled (demo)" },
    ],
    testCases: [
      {
        id: "bo-01",
        title: "Multi-Practice Dashboard View",
        steps: [
          { action: "Log in as Linda Botha (Bureau Operator)", expected: "Dashboard loads with a practice selector dropdown at the top." },
          { action: "Observe the practice selector", expected: "Shows all practices assigned to MedAdmin Bureau (e.g. Dr Dlamini Family Practice, Dr Khan Specialist)." },
          { action: "Switch between practices using the dropdown", expected: "All metric cards, appointments, and activity feed update to reflect the selected practice." },
          { action: "Try accessing a practice not assigned to MedAdmin Bureau", expected: "Access is denied. Message: 'You do not have access to this practice.'", note: "Security rule: Bureau operators cannot see other bureaus' practices." },
        ],
        passCondition: "Bureau operator sees only their assigned practices. Switching practice context updates all data.",
      },
      {
        id: "bo-02",
        title: "Cross-Practice Claims Management",
        steps: [
          { action: "Navigate to /claims while Practice A is selected", expected: "Claims list shows only Practice A's claims." },
          { action: "Switch to Practice B from the practice selector", expected: "Claims list refreshes to show Practice B's claims only. No mixing of data." },
          { action: "Filter claims by status 'REJECTED'", expected: "Only rejected claims from the currently selected practice are shown." },
        ],
        passCondition: "Strict practice-level data isolation is enforced. Switching practice changes all displayed data.",
      },
      {
        id: "bo-03",
        title: "Approve a Write-Off (Bureau-level authority)",
        steps: [
          { action: "Navigate to /invoices and find an invoice with an outstanding balance", expected: "Invoice list loads for the currently selected practice." },
          { action: "Click into the invoice and click 'Write Off Balance'", expected: "Write-off modal appears (bureau operators have this authority)." },
          { action: "Enter reason and confirm", expected: "Balance written off. Status changes to WRITTEN_OFF. Audit log entry created.", note: "ADMIN_STAFF cannot do this — it requires PRACTICE_OWNER or BUREAU_OPERATOR." },
        ],
        passCondition: "Bureau operator can approve and execute write-offs without requiring an additional approval step.",
      },
    ],
  },

  // =========================================================================
  // 5. END-TO-END BILLING WORKFLOW
  // =========================================================================
  {
    id: "e2e-billing",
    icon: <FileText className="h-5 w-5" />,
    role: "End-to-End: Full Billing Lifecycle",
    badge: "Complete Flow",
    badgeVariant: "default",
    description:
      "This test traces the complete journey from patient arrival to paid invoice. Perform this as Admin Staff. It is the most important integration test as it exercises every major module in sequence.",
    credentials: [
      { label: "Log in as", value: "Admin Staff (Nomsa Dube)" },
      { label: "Patient used", value: "Thembi Nkosi (Discovery Health, DH1234567)" },
      { label: "Scheme", value: "Discovery Health — DISC" },
    ],
    testCases: [
      {
        id: "e2e-01",
        title: "Step 1: Check Patient Benefits Before Consultation",
        steps: [
          { action: "Navigate to /patients and click on 'Thembi Nkosi'", expected: "Patient detail page loads." },
          { action: "Click the 'Benefit Checks' tab", expected: "Previous benefit check results are shown with savings and day-to-day balances." },
          { action: "Click 'New Benefit Check'", expected: "Benefit check request fires. Loading spinner shows." },
          { action: "Wait for the result", expected: "New row appears: Active Member = Yes, Plan = Executive, Savings Available = R8,420.50, Day-to-Day = R3,200.00." },
        ],
        passCondition: "Benefit check completes and returns a new row with current balances.",
      },
      {
        id: "e2e-02",
        title: "Step 2: Mark Patient as Arrived",
        steps: [
          { action: "Navigate to /appointments and find Thembi Nkosi's appointment", expected: "Appointment shows status 'BOOKED'." },
          { action: "Click the appointment and click 'Mark Arrived'", expected: "Status badge changes to 'ARRIVED' (green). Timestamp recorded." },
        ],
        passCondition: "Appointment status updates to ARRIVED.",
      },
      {
        id: "e2e-03",
        title: "Step 3: Create the Invoice",
        steps: [
          { action: "From the appointment detail panel, click 'Start Billing'", expected: "New invoice form opens pre-filled with Thembi Nkosi's details and today's date." },
          { action: "Add ICD-10: J06.9 (Upper respiratory infection)", expected: "Code chip appears. Validation panel shows green for ICD-10." },
          { action: "Add Tariff Code 0191 (Repeat consultation), Qty: 1", expected: "Line item: R365.00 at 100% NRPL." },
          { action: "Add NAPPI: Amoxil 500mg (707482001), Qty: 1 pack", expected: "Line item: R52.40 (SEP price)." },
          { action: "Add NAPPI: Panado 500mg (713842001), Qty: 2 packs", expected: "Line item: R23.50 x 2 = R47.00." },
          { action: "Observe totals panel", expected: "Subtotal: R464.40. Medical Aid Claimed: R464.40. Patient Liable: R0.00. Outstanding: R464.40." },
          { action: "Observe the 4-month deadline indicator", expected: "Green indicator: 'Within submission window'." },
          { action: "Click 'Finalise Invoice'", expected: "Invoice number assigned. Status: SUBMITTED. All line items are read-only." },
        ],
        passCondition: "Invoice finalises with correct totals and a generated invoice number. Line items are locked.",
      },
      {
        id: "e2e-04",
        title: "Step 4: Submit Claim to MediSwitch",
        steps: [
          { action: "On the finalised invoice, click 'Submit Claim'", expected: "Processing spinner appears. Claim record created with status PENDING." },
          { action: "Navigate to /claims and find the new claim", expected: "Claim appears with status SUBMITTED. Switch reference number shown." },
          { action: "Click into the claim detail", expected: "Full EDIFACT MEDCLM message displayed in a code block. Timeline shows: Created → Submitted." },
          { action: "Observe the claim timeline", expected: "Timestamps for each status change are displayed in chronological order." },
        ],
        passCondition: "Claim is created with EDIFACT payload, switch reference, and a correct status timeline.",
      },
      {
        id: "e2e-05",
        title: "Step 5: Record the Medical Aid Payment",
        steps: [
          { action: "Navigate to /payments and click 'Record Payment'", expected: "Modal opens." },
          { action: "Select Type: Medical Aid, Scheme: Discovery Health", expected: "Scheme selected." },
          { action: "Enter Amount: R464.40, Reference: DISC-PAY-20260426, Date: today", expected: "Fields validate." },
          { action: "Click 'Record Payment'", expected: "Allocation modal opens. Invoice INV for Thembi Nkosi is listed." },
          { action: "Allocate R464.40 to Thembi's invoice. Confirm.", expected: "Invoice outstanding balance = R0.00. Invoice status changes to PAID." },
        ],
        passCondition: "Payment recorded and allocated. Invoice status is PAID. Outstanding balance is zero.",
      },
      {
        id: "e2e-06",
        title: "Step 6: Mark Appointment Complete and Verify Reports",
        steps: [
          { action: "Navigate to /appointments, find Thembi's appointment, click 'Mark Complete'", expected: "Appointment status changes to COMPLETED (grey badge)." },
          { action: "Navigate to /reports, select 'Revenue' report, set date to today", expected: "Report shows today's invoiced total including Thembi's R464.40." },
          { action: "Click 'Export to PDF'", expected: "PDF export is triggered. Download prompt appears (or preview panel opens)." },
        ],
        passCondition: "Appointment is completed. Revenue report reflects the payment. Export works.",
      },
    ],
  },

  // =========================================================================
  // 6. PATIENT MANAGEMENT DEEP-DIVE
  // =========================================================================
  {
    id: "patient-mgmt",
    icon: <User className="h-5 w-5" />,
    role: "Patient Management",
    badge: "All Roles",
    badgeVariant: "secondary",
    description:
      "Detailed tests for the patient module: search, filter, detail tabs, statement, and ID validation edge cases.",
    credentials: [
      { label: "Log in as", value: "Admin Staff or Practice Owner" },
    ],
    testCases: [
      {
        id: "pm-01",
        title: "Patient Search and Filtering",
        steps: [
          { action: "Navigate to /patients", expected: "Patient list loads with all 8 seeded patients." },
          { action: "Type 'Nkosi' in the search box", expected: "List filters to show only Thembi Nkosi." },
          { action: "Clear search. Filter by Scheme: 'Discovery Health'", expected: "List shows only patients on Discovery Health (Thembi Nkosi, Ayanda Zulu)." },
          { action: "Filter by 'Outstanding Balance' toggle", expected: "List shows only patients with balance > 0 (James van der Merwe, Lungelo Dube, Robert Khumalo, Priya Naicker)." },
          { action: "Sort by Last Name A-Z", expected: "List re-orders alphabetically by last name." },
        ],
        passCondition: "Search, scheme filter, and outstanding balance filter all work independently and in combination.",
      },
      {
        id: "pm-02",
        title: "Patient Detail — All 4 Tabs",
        steps: [
          { action: "Open Thembi Nkosi (pat-001) detail page", expected: "Header shows: name, ID number, scheme, plan, membership number, outstanding balance." },
          { action: "Click 'Invoices' tab (default)", expected: "Shows all invoices for Thembi. INV-20260425-00014 is listed as SUBMITTED." },
          { action: "Click 'Claims' tab", expected: "Shows claim clm-001 linked to INV-20260425-00014. Status: SUBMITTED. Switch ref shown." },
          { action: "Click 'Payments' tab", expected: "Shows payment pay-001: R850.00 from Discovery Health, ALLOCATED." },
          { action: "Click 'Benefit Checks' tab", expected: "Shows bc-001 and bc-002: two historical benefit checks with savings and day-to-day balances." },
        ],
        passCondition: "All 4 tabs load with their respective data. No tab shows another patient's data.",
      },
      {
        id: "pm-03",
        title: "SA ID Number Validation",
        steps: [
          { action: "Navigate to /patients/new", expected: "Form loads." },
          { action: "Enter an invalid SA ID: 1234567890123", expected: "Red validation error: 'Invalid SA ID number — checksum failed'." },
          { action: "Enter a valid SA ID: 8901015000086 (Thembi Nkosi's ID)", expected: "DOB auto-populates to 1989-01-01. Gender: Female. Age: 37.", note: "The Luhn checksum algorithm must pass." },
          { action: "Enter another valid ID: 7504205000081 (James van der Merwe)", expected: "DOB auto-populates to 1975-04-20. Gender: Male." },
        ],
        passCondition: "Invalid IDs are rejected with an error. Valid IDs populate DOB and gender automatically.",
      },
    ],
  },

  // =========================================================================
  // 7. REPORTS
  // =========================================================================
  {
    id: "reports",
    icon: <BarChart3 className="h-5 w-5" />,
    role: "Reports",
    badge: "Owner & Bureau",
    badgeVariant: "default",
    description:
      "Reports are restricted to Practice Owner and Bureau Operator roles. Admin Staff cannot access this module unless explicitly granted. Test all 5 report types.",
    credentials: [
      { label: "Log in as", value: "Practice Owner (Dr. Sipho Dlamini)" },
    ],
    testCases: [
      {
        id: "rp-01",
        title: "Revenue Report",
        steps: [
          { action: "Navigate to /reports, ensure 'Revenue' tab is active", expected: "Bar chart loads showing revenue by month for the current year." },
          { action: "Change the period selector to 'Last 30 days'", expected: "Chart re-renders with the filtered period." },
          { action: "Hover over a bar in the chart", expected: "Tooltip shows the exact revenue figure for that period." },
          { action: "Observe the summary cards above the chart", expected: "Shows: Total Invoiced, Total Collected, Outstanding, Collection Rate %." },
        ],
        passCondition: "Revenue chart renders with tooltips. Period picker updates the chart. Summary cards show correct aggregates.",
      },
      {
        id: "rp-02",
        title: "Rejections Analysis Report",
        steps: [
          { action: "Click the 'Rejections' tab in /reports", expected: "Table shows all rejected claims by scheme and rejection code." },
          { action: "Observe the rejection code column", expected: "Each row shows the plain English reason, not the raw code number." },
          { action: "Click 'Export to PDF'", expected: "Export is triggered. File download begins or preview panel opens." },
        ],
        passCondition: "Rejection reasons are in plain English. Export function triggers a download.",
      },
      {
        id: "rp-03",
        title: "Age Analysis (Debtors) Report",
        steps: [
          { action: "Click the 'Age Analysis' tab (or it may be in the main reports menu)", expected: "Table shows patient/scheme rows with columns: Current, 30 days, 60 days, 90 days, 120+ days, Total." },
          { action: "Verify Robert Khumalo's row", expected: "R3,400 is shown in the 90+ days column (last visit was 2026-04-18, invoice INV-20260423-00010 is REJECTED)." },
          { action: "Verify Lungelo Dube's row", expected: "R750 outstanding shown in the current or 30-day column." },
        ],
        passCondition: "Age analysis table shows outstanding balances correctly bucketed by age.",
      },
    ],
  },

  // =========================================================================
  // 8. SETTINGS & COMPLIANCE
  // =========================================================================
  {
    id: "settings",
    icon: <Settings className="h-5 w-5" />,
    role: "Settings & Compliance",
    badge: "Owner Only",
    badgeVariant: "default",
    description:
      "Settings are restricted to Practice Owner and System Admin. Test practice profile, tariff configuration, switch credentials, and 2FA setup.",
    credentials: [
      { label: "Log in as", value: "Practice Owner (Dr. Sipho Dlamini)" },
    ],
    testCases: [
      {
        id: "st-01",
        title: "Update Practice Profile",
        steps: [
          { action: "Navigate to /settings, stay on 'Practice' tab", expected: "Form shows practice name, BHF practice number, HPCSA number, phone, email, address." },
          { action: "Update the phone number to 011 555 0000 and click 'Save Changes'", expected: "Success toast: 'Practice profile updated'." },
          { action: "Navigate away and return to Settings", expected: "Updated phone number is persisted." },
        ],
        passCondition: "Practice profile saves and persists correctly.",
      },
      {
        id: "st-02",
        title: "Configure Tariff Percentage",
        steps: [
          { action: "Click the 'Billing' tab in Settings", expected: "Tariff Percentage field shows current value (e.g. 100%)." },
          { action: "Change tariff percentage to 125%", expected: "Field accepts 125.00." },
          { action: "Click 'Save Changes'", expected: "Success toast shows." },
          { action: "Create a new invoice for any patient", expected: "Tariff code line item unit price = NRPL × 1.25 (e.g. code 0191 shows R456.25 instead of R365.00)." },
        ],
        passCondition: "Tariff percentage change is reflected in new invoice line item calculations.",
      },
      {
        id: "st-03",
        title: "Enable 2FA (MFA Setup)",
        steps: [
          { action: "Click the 'Security' tab in Settings", expected: "Two-Factor Authentication section shows with 'Enable 2FA' button." },
          { action: "Click 'Enable 2FA'", expected: "QR code is displayed for scanning with an authenticator app." },
          { action: "Enter a 6-digit TOTP code to verify", expected: "On valid code: 2FA is activated. 'Two-Factor Enabled' badge appears." },
          { action: "Log out and log back in", expected: "After email/password, a second step asks for the 6-digit TOTP code before granting access." },
        ],
        passCondition: "2FA is enabled and enforced on subsequent logins.",
      },
      {
        id: "st-04",
        title: "Medical Aid Schemes List",
        steps: [
          { action: "Click the 'Schemes' tab in Settings", expected: "All 20 medical aid schemes are listed with their short codes and MediSwitch destination codes." },
          { action: "Search for 'Hosmed'", expected: "Hosmed (HOSMED, HOS) is found in the list." },
          { action: "Search for 'GEMS'", expected: "Government Employees Medical Scheme (GEMS, GEMS) is found, marked as Real-Time Capable." },
          { action: "Observe which schemes are marked 'Real-Time'", expected: "Discovery Health, GEMS, and Bonitas show a 'Real-Time' badge. All others show 'Batch/EDI'." },
        ],
        passCondition: "All 20 schemes are listed. Real-time capability is correctly indicated for the 3 supported schemes.",
      },
    ],
  },

  // =========================================================================
  // 9. BUSINESS RULE VALIDATION
  // =========================================================================
  {
    id: "business-rules",
    icon: <AlertTriangle className="h-5 w-5" />,
    role: "Business Rule Validation",
    badge: "Edge Cases",
    badgeVariant: "destructive",
    description:
      "Test the hard business rules that must be enforced regardless of user role. These tests verify that the system correctly blocks invalid actions.",
    credentials: [
      { label: "Log in as", value: "Admin Staff (Nomsa Dube)" },
    ],
    testCases: [
      {
        id: "br-01",
        title: "Cannot Finalise Invoice with No Line Items",
        steps: [
          { action: "Navigate to /invoices/new and select any patient", expected: "New invoice form loads." },
          { action: "Do NOT add any line items. Click 'Finalise Invoice'", expected: "Button is disabled OR clicking shows an error: 'Cannot finalise — invoice has no line items'." },
        ],
        passCondition: "Invoice cannot be finalised without at least one line item.",
      },
      {
        id: "br-02",
        title: "Cannot Finalise Invoice with Missing ICD-10",
        steps: [
          { action: "Navigate to /invoices/new, select a patient, add Tariff Code 0191 but NO ICD-10 code", expected: "Validation panel shows a red warning: 'Line item 1 is missing an ICD-10 diagnosis code'." },
          { action: "Click 'Finalise Invoice'", expected: "Action blocked. Error message shown." },
          { action: "Add ICD-10 code J06.9 and click 'Finalise' again", expected: "Invoice finalises successfully." },
        ],
        passCondition: "Finalisation is blocked when a line item is missing its ICD-10 code.",
      },
      {
        id: "br-03",
        title: "Cannot Submit Claim for Cash Patient",
        steps: [
          { action: "Create and finalise an invoice for Lungelo Dube (Cash Patient)", expected: "Invoice finalised." },
          { action: "Look for the 'Submit Claim' button", expected: "Button is absent or disabled. Warning shown: 'Cannot submit — patient has no medical aid membership number'." },
        ],
        passCondition: "Claim submission is blocked for cash patients.",
      },
      {
        id: "br-04",
        title: "Cannot Allocate Payment Beyond Invoice Balance",
        steps: [
          { action: "Navigate to /payments, record a payment of R100.00 for Lungelo Dube", expected: "Payment recorded." },
          { action: "In the allocation modal, try to allocate R200.00 to his invoice (which has R750.00 outstanding)", expected: "Entry of R200.00 against the R100.00 payment shows: 'Allocation total cannot exceed payment amount'. Confirm button disabled." },
        ],
        passCondition: "System prevents over-allocation beyond the payment amount.",
      },
      {
        id: "br-05",
        title: "Cannot Submit Duplicate Claim",
        steps: [
          { action: "Find invoice INV-20260425-00014 (already submitted — claim clm-001 exists)", expected: "Invoice detail shows claim clm-001 with status SUBMITTED." },
          { action: "Try to click 'Submit Claim' again", expected: "'Submit Claim' button is disabled or hidden. Message: 'An active claim already exists for this invoice'." },
        ],
        passCondition: "Duplicate claim submission is blocked when an active claim exists.",
      },
      {
        id: "br-06",
        title: "4-Month Submission Deadline Warning",
        steps: [
          { action: "Create a new invoice and manually set the Date of Service to 5 months ago (e.g. 2025-11-26)", expected: "Validation panel shows a red warning: 'Date of service is more than 4 months ago — most schemes will not accept this claim'." },
          { action: "Observe the 'Submit Claim' button", expected: "Button may still be enabled but shows the warning prominently." },
        ],
        passCondition: "4-month deadline breach shows a clearly visible red warning on the invoice form.",
      },
    ],
  },

  // =========================================================================
  // 10. NAPPI CODES
  // =========================================================================
  {
    id: "nappi-codes",
    icon: <CreditCard className="h-5 w-5" />,
    role: "NAPPI Code Search",
    badge: "All Billing Users",
    badgeVariant: "secondary",
    description:
      "Verify that all 20 seeded NAPPI codes are searchable and correctly display schedule, SEP price, and generic name during invoice creation.",
    credentials: [
      { label: "Log in as", value: "Admin Staff (Nomsa Dube)" },
    ],
    testCases: [
      {
        id: "nc-01",
        title: "Search All 20 NAPPI Codes",
        steps: [
          { action: "Navigate to /invoices/new, select any patient, add an ICD-10 code", expected: "Invoice form is ready for line items." },
          { action: "In the NAPPI medicine search, type 'Amoxil'", expected: "Result: 'Amoxil 500mg Capsules — NAPPI: 707482001 — S4 — SEP: R52.40'." },
          { action: "Search 'Augmentin'", expected: "Result: 'Augmentin 625mg Tablets — NAPPI: 701258001 — S4 — SEP: R198.70'." },
          { action: "Search 'Ventolin'", expected: "Result: 'Ventolin 100mcg Inhaler — NAPPI: 712901001 — S3 — SEP: R82.30'." },
          { action: "Search 'Glucophage'", expected: "Result: 'Glucophage 850mg Tablets — NAPPI: 711820001 — S4 — SEP: R44.10'." },
          { action: "Search 'Flagyl'", expected: "Result: 'Flagyl 200mg Tablets — NAPPI: 721890001 — S4 — SEP: R38.90'." },
          { action: "Search 'Lipitor'", expected: "Result: 'Lipitor 20mg Tablets — NAPPI: 717345001 — S4 — SEP: R125.70'." },
          { action: "Search 'Flixotide'", expected: "Result: 'Flixotide 125mcg Inhaler — NAPPI: 706543001 — S4 — SEP: R210.60'." },
          { action: "Search 'Nexium'", expected: "Result: 'Nexium 20mg Capsules — NAPPI: 716834001 — S3 — SEP: R149.80'." },
          { action: "Search 'Losartan'", expected: "Result: 'Losartan 50mg Tablets — NAPPI: 704123001 — S4 — SEP: R56.20'." },
          { action: "Search 'Doxycycline'", expected: "Result: 'Doxycycline 100mg Capsules — NAPPI: 720543001 — S4 — SEP: R48.60'." },
        ],
        passCondition: "All 10 tested NAPPI codes (of the 20 seeded) return the correct product name, NAPPI code, schedule, and SEP price.",
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StepTable({ steps }: { steps: Step[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="text-left px-4 py-2 font-semibold text-muted-foreground w-8">#</th>
            <th className="text-left px-4 py-2 font-semibold text-foreground">Action</th>
            <th className="text-left px-4 py-2 font-semibold text-foreground">Expected Result</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step, idx) => (
            <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 text-muted-foreground font-mono text-xs align-top">{idx + 1}</td>
              <td className="px-4 py-3 align-top">
                <p className="text-foreground">{step.action}</p>
                {step.note && (
                  <p className="text-xs text-amber-600 mt-1 italic">Note: {step.note}</p>
                )}
              </td>
              <td className="px-4 py-3 align-top text-muted-foreground">{step.expected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TestCaseBlock({ tc, sectionId }: { tc: TestCase; sectionId: string }) {
  const [open, setOpen] = useState(false)
  const [passed, setPassed] = useState<boolean | null>(null)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <span className="font-mono text-xs text-muted-foreground">{tc.id.toUpperCase()}</span>
          <span className="font-medium text-foreground">{tc.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {passed === true && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          {passed === null && <Circle className="h-4 w-4 text-muted-foreground" />}
          {passed === false && <Circle className="h-4 w-4 text-destructive" />}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="p-4 space-y-4 bg-background">
          <StepTable steps={tc.steps} />

          {/* Pass Condition */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 px-4 py-3">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">Pass Condition</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{tc.passCondition}</p>
          </div>

          {/* Mark pass/fail */}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant={passed === true ? "default" : "outline"}
              className={passed === true ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              onClick={() => setPassed(true)}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark Passed
            </Button>
            <Button
              size="sm"
              variant={passed === false ? "destructive" : "outline"}
              onClick={() => setPassed(false)}
            >
              Mark Failed
            </Button>
            {passed !== null && (
              <Button size="sm" variant="ghost" onClick={() => setPassed(null)}>
                Reset
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SectionBlock({ section, filteredCases }: { section: Section; filteredCases?: TestCase[] }) {
  const [open, setOpen] = useState(false)
  const visibleCases = filteredCases ?? section.testCases

  const variantMap: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-border text-foreground",
  }

  return (
    <Card className="overflow-hidden">
      <button
        className="w-full text-left"
        onClick={() => setOpen(!open)}
      >
        <CardHeader className="hover:bg-muted/20 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">{section.icon}</div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-lg">{section.role}</CardTitle>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${variantMap[section.badgeVariant]}`}>
                    {section.badge}
                  </span>
                  {filteredCases && filteredCases.length !== section.testCases.length && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {filteredCases.length} of {section.testCases.length} match
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <span className="text-xs text-muted-foreground">{visibleCases.length} test{visibleCases.length !== 1 ? "s" : ""}</span>
              {open ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
            </div>
          </div>
        </CardHeader>
      </button>

      {open && (
        <CardContent className="pt-0 space-y-6">
          <Separator />

          {/* Credentials */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Test Credentials / Context</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {section.credentials.map((c) => (
                <div key={c.label} className="rounded-lg bg-muted/40 px-3 py-2 flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                  <span className="text-sm font-mono font-medium text-foreground">{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Test Cases */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Test Cases</h4>
            {visibleCases.length === 0 ? (
              <p className="text-sm text-muted-foreground italic px-1">No test cases match the current search.</p>
            ) : (
              visibleCases.map((tc) => (
                <TestCaseBlock key={tc.id} tc={tc} sectionId={section.id} />
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Role filter options derived from the section data
// ---------------------------------------------------------------------------
const ROLE_FILTERS = [
  { label: "All Roles", value: "" },
  { label: "Practice Owner", value: "practice-owner" },
  { label: "Admin Staff", value: "admin-staff" },
  { label: "Doctor", value: "doctor" },
  { label: "Bureau Operator", value: "bureau-operator" },
  { label: "End-to-End", value: "e2e-billing" },
  { label: "Patient Mgmt", value: "patient-mgmt" },
  { label: "Reports", value: "reports" },
  { label: "Settings", value: "settings" },
  { label: "Business Rules", value: "business-rules" },
  { label: "NAPPI Codes", value: "nappi-codes" },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TestingGuidePage() {
  const [search, setSearch] = useState("")
  const [activeRole, setActiveRole] = useState("")
  const [activeIcd10, setActiveIcd10] = useState<{ code: string; description: string } | null>(null)
  const [icd10Query, setIcd10Query] = useState("")
  const [showIcd10Drop, setShowIcd10Drop] = useState(false)
  const icd10Ref = useRef<HTMLDivElement>(null)

  // Close ICD-10 dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (icd10Ref.current && !icd10Ref.current.contains(e.target as Node)) {
        setShowIcd10Drop(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const icd10Suggestions = useMemo(() => {
    const q = icd10Query.trim().toLowerCase()
    if (!q) return ICD10_CODES.slice(0, 8)
    return ICD10_CODES.filter(
      (c) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [icd10Query])

  const totalTests = TEST_SECTIONS.reduce((sum, s) => sum + s.testCases.length, 0)
  const totalSteps = TEST_SECTIONS.reduce(
    (sum, s) => sum + s.testCases.reduce((ss, tc) => ss + tc.steps.length, 0),
    0
  )

  // Derive filtered sections + their filtered test cases
  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase()
    const icdFilter = activeIcd10
      ? `${activeIcd10.code} ${activeIcd10.description}`.toLowerCase()
      : null
    // individual icd code token for exact matching in steps
    const icdCode = activeIcd10?.code.toLowerCase() ?? null
    const icdDesc = activeIcd10?.description.toLowerCase() ?? null

    return TEST_SECTIONS
      .filter((s) => {
        if (activeRole && s.id !== activeRole) return false
        return true
      })
      .map((s) => {
        // Apply keyword search first
        let cases = s.testCases

        if (q) {
          const sectionMatches =
            s.role.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.badge.toLowerCase().includes(q) ||
            s.credentials.some(
              (c) => c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q)
            )

          if (!sectionMatches) {
            cases = cases.filter((tc) => {
              if (tc.title.toLowerCase().includes(q)) return true
              if (tc.passCondition.toLowerCase().includes(q)) return true
              if (tc.id.toLowerCase().includes(q)) return true
              return tc.steps.some(
                (step) =>
                  step.action.toLowerCase().includes(q) ||
                  step.expected.toLowerCase().includes(q) ||
                  (step.note?.toLowerCase().includes(q) ?? false)
              )
            })
          }
        }

        // Apply ICD-10 filter on top of keyword results
        if (icdCode && icdDesc) {
          cases = cases.filter((tc) => {
            const fullText = [
              tc.title,
              tc.passCondition,
              ...tc.steps.flatMap((s) => [s.action, s.expected, s.note ?? ""]),
            ]
              .join(" ")
              .toLowerCase()
            return fullText.includes(icdCode) || fullText.includes(icdDesc)
          })
        }

        return { section: s, cases }
      })
      .filter(({ cases }) => cases.length > 0)
  }, [search, activeRole, activeIcd10])

  const matchedTests = filteredSections.reduce((sum, { cases }) => sum + cases.length, 0)
  const isFiltered = search.trim() !== "" || activeRole !== "" || activeIcd10 !== null

  function clearAll() {
    setSearch("")
    setActiveRole("")
    setActiveIcd10(null)
    setIcd10Query("")
  }

  return (
    <AppShell
      title="Testing Guide"
      subtitle="End-to-end test procedures for all user roles and workflows"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ----------------------------------------------------------------- */}
        {/* Header Banner */}
        {/* ----------------------------------------------------------------- */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">MediBill ZA — System Testing Guide</h2>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                This guide covers all 5 user roles defined in the system specification: Practice Owner, Admin Staff,
                Doctor, and Bureau Operator — plus end-to-end workflow tests, patient management tests, report tests,
                settings tests, business rule validation, and NAPPI code verification. Click any section to expand it,
                then step through each test case. Use the Pass / Fail buttons to track your progress.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">Sections</span>
                  <span className="font-bold text-foreground">{TEST_SECTIONS.length}</span>
                </div>
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">Test Cases</span>
                  <span className="font-bold text-foreground">{totalTests}</span>
                </div>
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">Total Steps</span>
                  <span className="font-bold text-foreground">{totalSteps}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* How to Read This Guide */}
        {/* ----------------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to Use This Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Before you start</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Open the application in a browser window</li>
                  <li>Keep this guide open in a second tab or window</li>
                  <li>Start with the Auth section, then follow the order listed</li>
                  <li>The End-to-End test (section 5) should be run after all individual module tests pass</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Column guide</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Action:</strong> What you click, type, or navigate to</li>
                  <li><strong>Expected Result:</strong> What the system must do in response</li>
                  <li><strong>Note:</strong> Context or exception to be aware of</li>
                  <li><strong>Pass Condition:</strong> The single definition of a passing test</li>
                </ul>
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-4 py-3 mt-2">
              <p className="text-amber-800 dark:text-amber-300 text-xs font-medium">
                All user data used in this guide is seeded mock data. No real patient data, medical aid credentials, or MediSwitch connections are used in testing. All claim submissions are simulated.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ----------------------------------------------------------------- */}
        {/* Search & Filters */}
        {/* ----------------------------------------------------------------- */}
        <div className="space-y-3">

          {/* Row 1: keyword search + ICD-10 combobox */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Keyword search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search test cases, steps, credentials, actions…"
                className="pl-9 pr-9 h-10"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* ICD-10 combobox */}
            <div className="relative w-full sm:w-72" ref={icd10Ref}>
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                value={activeIcd10 ? `${activeIcd10.code} — ${activeIcd10.description}` : icd10Query}
                onChange={(e) => {
                  if (activeIcd10) {
                    setActiveIcd10(null)
                    setIcd10Query(e.target.value)
                  } else {
                    setIcd10Query(e.target.value)
                  }
                  setShowIcd10Drop(true)
                }}
                onFocus={() => setShowIcd10Drop(true)}
                placeholder="Filter by ICD-10 code…"
                className={`pl-9 pr-9 h-10 ${activeIcd10 ? "text-primary font-medium" : ""}`}
                readOnly={!!activeIcd10}
              />
              {(activeIcd10 || icd10Query) && (
                <button
                  onClick={() => { setActiveIcd10(null); setIcd10Query(""); setShowIcd10Drop(false) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear ICD-10 filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Dropdown */}
              {showIcd10Drop && !activeIcd10 && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                  {icd10Suggestions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">No codes found.</div>
                  ) : (
                    <ul>
                      {icd10Suggestions.map((c) => (
                        <li key={c.code}>
                          <button
                            className="w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-muted/60 transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setActiveIcd10(c)
                              setIcd10Query("")
                              setShowIcd10Drop(false)
                            }}
                          >
                            <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                              {c.code}
                            </span>
                            <span className="text-sm text-foreground leading-snug">{c.description}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground bg-muted/30">
                    {ICD10_CODES.length} codes available — type to search
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Role filter chips */}
          <div className="flex flex-wrap gap-2">
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveRole(f.value === activeRole ? "" : f.value)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  activeRole === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Active ICD-10 chip */}
          {activeIcd10 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">ICD-10 filter:</span>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                <Stethoscope className="h-3 w-3" />
                {activeIcd10.code} — {activeIcd10.description}
                <button
                  onClick={() => { setActiveIcd10(null); setIcd10Query("") }}
                  className="ml-0.5 hover:opacity-70 transition-opacity"
                  aria-label="Remove ICD-10 filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}

          {/* Results count */}
          {isFiltered && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                Showing <span className="font-semibold text-foreground">{matchedTests}</span> of{" "}
                <span className="font-semibold text-foreground">{totalTests}</span> test cases
                {filteredSections.length !== TEST_SECTIONS.length && (
                  <> across <span className="font-semibold text-foreground">{filteredSections.length}</span> of{" "}
                  <span className="font-semibold text-foreground">{TEST_SECTIONS.length}</span> sections</>
                )}
              </span>
              <button
                onClick={clearAll}
                className="text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Test Sections */}
        {/* ----------------------------------------------------------------- */}
        <div className="space-y-4">
          {filteredSections.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/30 p-12 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">No results found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search term or clear the role filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={clearAll}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredSections.map(({ section, cases }) => (
              <SectionBlock key={section.id} section={section} filteredCases={cases} />
            ))
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Footer */}
        {/* ----------------------------------------------------------------- */}
        <div className="text-center text-xs text-muted-foreground pb-8">
          MediBill ZA Testing Guide v1.0 — Generated from SA Medical Aid Billing System Master Prompt v1.0
        </div>
      </div>
    </AppShell>
  )
}
