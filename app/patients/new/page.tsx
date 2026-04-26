"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MEDICAL_AID_SCHEMES } from "@/lib/mock-data"
import {
  ChevronLeft,
  User,
  Shield,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Stethoscope,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Gender = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN"

interface FormErrors {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  idNumber?: string
  phone?: string
  email?: string
  membershipNumber?: string
}

function validateSAID(id: string): boolean {
  if (id.length !== 13 || !/^\d+$/.test(id)) return false
  // Luhn check
  let sum = 0
  for (let i = 0; i < 13; i++) {
    let d = parseInt(id[i])
    if (i % 2 !== 0) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

function dobFromSAID(id: string): string {
  if (id.length < 6) return ""
  const yy = id.substring(0, 2)
  const mm = id.substring(2, 4)
  const dd = id.substring(4, 6)
  const year = parseInt(yy) <= 26 ? `20${yy}` : `19${yy}`
  return `${year}-${mm}-${dd}`
}

function genderFromSAID(id: string): Gender {
  if (id.length < 11) return "UNKNOWN"
  return parseInt(id[6]) >= 5 ? "MALE" : "FEMALE"
}

export default function NewPatientPage() {
  const router = useRouter()

  // Demographics
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState<Gender>("UNKNOWN")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [isPrincipal, setIsPrincipal] = useState(true)

  // Address
  const [street, setStreet] = useState("")
  const [suburb, setSuburb] = useState("")
  const [city, setCity] = useState("")
  const [province, setProvince] = useState("")
  const [postalCode, setPostalCode] = useState("")

  // Medical aid
  const [isCashPatient, setIsCashPatient] = useState(false)
  const [schemeSearch, setSchemeSearch] = useState("")
  const [selectedScheme, setSelectedScheme] = useState<typeof MEDICAL_AID_SCHEMES[0] | null>(null)
  const [showSchemeDropdown, setShowSchemeDropdown] = useState(false)
  const [membershipNumber, setMembershipNumber] = useState("")
  const [planOption, setPlanOption] = useState("")
  const [dependentCode, setDependentCode] = useState("")

  // Emergency
  const [emergencyName, setEmergencyName] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")

  // Notes
  const [notes, setNotes] = useState("")

  // UI state
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [benefitCheckResult, setBenefitCheckResult] = useState<"idle" | "checking" | "success" | "failed">("idle")

  const filteredSchemes = MEDICAL_AID_SCHEMES.filter(s =>
    s.name.toLowerCase().includes(schemeSearch.toLowerCase()) ||
    s.shortCode.toLowerCase().includes(schemeSearch.toLowerCase())
  ).slice(0, 8)

  const handleIdNumberChange = (val: string) => {
    setIdNumber(val)
    if (val.length === 13) {
      const dob = dobFromSAID(val)
      const g = genderFromSAID(val)
      if (dob) setDateOfBirth(dob)
      setGender(g)
    }
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!firstName.trim()) errs.firstName = "First name is required"
    if (!lastName.trim()) errs.lastName = "Last name is required"
    if (!dateOfBirth) errs.dateOfBirth = "Date of birth is required"
    if (idNumber && !validateSAID(idNumber)) errs.idNumber = "Invalid SA ID number"
    if (phone && !/^(\+27|0)[6-8]\d{8}$/.test(phone.replace(/\s/g, ""))) {
      errs.phone = "Enter a valid SA mobile number"
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Enter a valid email address"
    }
    if (!isCashPatient && selectedScheme && !membershipNumber.trim()) {
      errs.membershipNumber = "Membership number is required for scheme patients"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setSubmitted(true)
    // Simulate save — in production this posts to /api/v1/patients
    setTimeout(() => {
      router.push("/patients")
    }, 1200)
  }

  const handleBenefitCheck = () => {
    if (!selectedScheme || !membershipNumber) return
    setBenefitCheckResult("checking")
    setTimeout(() => {
      setBenefitCheckResult("success")
    }, 1500)
  }

  const idValid = idNumber.length === 13 && validateSAID(idNumber)
  const idInvalid = idNumber.length === 13 && !validateSAID(idNumber)

  return (
    <AppShell title="New Patient" subtitle="Register a new patient record">
      <Link
        href="/patients"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={15} /> Back to Patients
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column: demographics + address */}
        <div className="xl:col-span-2 space-y-5">

          {/* Demographics */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <User size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Patient Demographics</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  First Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. Thembi"
                  className={cn("mt-1", errors.firstName && "border-destructive")}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={11} />{errors.firstName}
                  </p>
                )}
              </div>

              {/* Last name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="e.g. Nkosi"
                  className={cn("mt-1", errors.lastName && "border-destructive")}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={11} />{errors.lastName}
                  </p>
                )}
              </div>

              {/* SA ID number */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">SA ID Number</label>
                <div className="relative mt-1">
                  <Input
                    value={idNumber}
                    onChange={e => handleIdNumberChange(e.target.value.replace(/\D/g, "").slice(0, 13))}
                    placeholder="13-digit ID number"
                    className={cn(
                      "font-mono pr-8",
                      idInvalid && "border-destructive",
                      idValid && "border-green-500"
                    )}
                    maxLength={13}
                  />
                  {idValid && (
                    <CheckCircle size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                  {idInvalid && (
                    <AlertCircle size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-destructive" />
                  )}
                </div>
                {errors.idNumber && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={11} />{errors.idNumber}
                  </p>
                )}
                {idValid && (
                  <p className="text-xs text-green-600 mt-1">ID verified — DOB and gender auto-populated</p>
                )}
              </div>

              {/* Date of birth */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Date of Birth <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  className={cn("mt-1", errors.dateOfBirth && "border-destructive")}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={11} />{errors.dateOfBirth}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Gender</label>
                <div className="flex gap-2 mt-1">
                  {(["MALE", "FEMALE", "OTHER", "UNKNOWN"] as Gender[]).map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors",
                        gender === g
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {g === "UNKNOWN" ? "Unknown" : g.charAt(0) + g.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Mobile Number</label>
                <div className="relative mt-1">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="071 234 5678"
                    className={cn("pl-8", errors.phone && "border-destructive")}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={11} />{errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className={cn("mt-1", errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={11} />{errors.email}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Address */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Residential Address</h3>
              <span className="text-xs text-muted-foreground ml-1">(optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Street Address</label>
                <Input
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="123 Main Street"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Suburb</label>
                <Input
                  value={suburb}
                  onChange={e => setSuburb(e.target.value)}
                  placeholder="Sandton"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">City</label>
                <Input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Johannesburg"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Province</label>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select province</option>
                  {["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","North West","Northern Cape","Western Cape"].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Postal Code</label>
                <Input
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="2196"
                  maxLength={4}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Phone size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Emergency Contact</h3>
              <span className="text-xs text-muted-foreground ml-1">(optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Contact Name</label>
                <Input
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                  placeholder="Full name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Contact Phone</label>
                <Input
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  placeholder="082 000 0000"
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-5">
            <label className="text-xs font-medium text-muted-foreground">Clinical Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Allergies, chronic conditions, previous procedures..."
              rows={3}
              className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </Card>
        </div>

        {/* Right column: medical aid + actions */}
        <div className="space-y-5">

          {/* Medical Aid */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Shield size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Medical Aid</h3>
            </div>

            {/* Cash patient toggle */}
            <button
              onClick={() => { setIsCashPatient(!isCashPatient); setSelectedScheme(null) }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors mb-4",
                isCashPatient
                  ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              <span>Cash Patient (no medical aid)</span>
              <div className={cn(
                "w-9 h-5 rounded-full transition-colors relative",
                isCashPatient ? "bg-yellow-400" : "bg-muted"
              )}>
                <div className={cn(
                  "w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                  isCashPatient ? "translate-x-4" : "translate-x-0.5"
                )} />
              </div>
            </button>

            {!isCashPatient && (
              <div className="space-y-3">
                {/* Scheme search */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Medical Aid Scheme</label>
                  <div className="relative mt-1">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search scheme..."
                      className="pl-8"
                      value={selectedScheme ? selectedScheme.name : schemeSearch}
                      onFocus={() => setShowSchemeDropdown(true)}
                      onBlur={() => setTimeout(() => setShowSchemeDropdown(false), 150)}
                      onChange={e => {
                        setSchemeSearch(e.target.value)
                        setSelectedScheme(null)
                      }}
                    />
                    {showSchemeDropdown && filteredSchemes.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                        {filteredSchemes.map(s => (
                          <button
                            key={s.id}
                            className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-muted/50 text-left"
                            onMouseDown={() => { setSelectedScheme(s); setSchemeSearch("") }}
                          >
                            <span className="text-sm text-foreground">{s.name}</span>
                            {s.supportsRealTime && (
                              <Badge className="text-[10px] bg-green-100 text-green-700 border-0" variant="outline">
                                Real-time
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Membership number */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Membership Number <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={membershipNumber}
                    onChange={e => setMembershipNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. DH1234567"
                    className={cn("mt-1 font-mono", errors.membershipNumber && "border-destructive")}
                  />
                  {errors.membershipNumber && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle size={11} />{errors.membershipNumber}
                    </p>
                  )}
                </div>

                {/* Plan option */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Plan Option</label>
                  <Input
                    value={planOption}
                    onChange={e => setPlanOption(e.target.value)}
                    placeholder="e.g. Executive, KeyCare Plus"
                    className="mt-1"
                  />
                </div>

                {/* Principal member toggle */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Member Type</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setIsPrincipal(true)}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors",
                        isPrincipal
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50"
                      )}
                    >
                      Principal Member
                    </button>
                    <button
                      onClick={() => setIsPrincipal(false)}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors",
                        !isPrincipal
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50"
                      )}
                    >
                      Dependent
                    </button>
                  </div>
                </div>

                {!isPrincipal && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Dependent Code</label>
                    <Input
                      value={dependentCode}
                      onChange={e => setDependentCode(e.target.value.toUpperCase().slice(0, 4))}
                      placeholder="e.g. 01"
                      className="mt-1 font-mono"
                      maxLength={4}
                    />
                  </div>
                )}

                {/* Benefit check */}
                {selectedScheme && membershipNumber && (
                  <div className="pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={handleBenefitCheck}
                      disabled={benefitCheckResult === "checking"}
                    >
                      <Stethoscope size={13} />
                      {benefitCheckResult === "checking"
                        ? "Checking benefits..."
                        : benefitCheckResult === "success"
                        ? "Benefits verified"
                        : "Check Benefits Now"}
                    </Button>

                    {benefitCheckResult === "success" && (
                      <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-green-700">
                          <CheckCircle size={13} /> Member Active — {selectedScheme.name}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-green-800">
                          <span>Savings:</span><span className="font-medium text-right">R 6,420.00</span>
                          <span>Day-to-day:</span><span className="font-medium text-right">R 2,800.00</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isCashPatient && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-800">
                This patient will be billed directly. No claim will be submitted to a medical aid.
              </div>
            )}
          </Card>

          {/* Form summary / save */}
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3 text-sm">Summary</h4>
            <div className="space-y-2 text-xs">
              <div className={cn("flex items-center gap-2", firstName && lastName ? "text-green-600" : "text-muted-foreground")}>
                {firstName && lastName ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                Patient name
              </div>
              <div className={cn("flex items-center gap-2", dateOfBirth ? "text-green-600" : "text-muted-foreground")}>
                {dateOfBirth ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                Date of birth
              </div>
              <div className={cn("flex items-center gap-2", isCashPatient || (selectedScheme && membershipNumber) ? "text-green-600" : "text-muted-foreground")}>
                {isCashPatient || (selectedScheme && membershipNumber) ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                {isCashPatient ? "Cash patient" : "Medical aid details"}
              </div>
              <div className={cn("flex items-center gap-2", phone || email ? "text-green-600" : "text-muted-foreground")}>
                {phone || email ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                Contact information
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Button
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={submitted}
            >
              <UserPlus size={15} />
              {submitted ? "Saving patient..." : "Save Patient Record"}
            </Button>
            <Link href="/patients">
              <Button variant="ghost" className="w-full">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
