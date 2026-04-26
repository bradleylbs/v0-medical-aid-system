"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MOCK_PATIENTS, TARIFF_CODES, ICD10_CODES } from "@/lib/mock-data"
import { ChevronLeft, Search, Trash2, AlertCircle, CheckCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface LineItem {
  id: string
  type: "PROCEDURE" | "MEDICINE" | "CONSUMABLE"
  code: string
  description: string
  icd10: string
  icd10Description: string
  quantity: number
  unitPrice: number
  nrplPrice: number
}

// Rect used to anchor the fixed-position ICD-10 dropdown
interface DropRect {
  top: number
  left: number
  width: number
}

export default function NewInvoicePage() {
  // ── Patient ──────────────────────────────────────────────────────────────
  const [selectedPatient, setSelectedPatient] = useState<typeof MOCK_PATIENTS[0] | null>(null)
  const [patientSearch, setPatientSearch] = useState("")
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)

  // ── Tariff code search ────────────────────────────────────────────────────
  const [codeSearch, setCodeSearch] = useState("")
  const [showCodeDropdown, setShowCodeDropdown] = useState(false)

  // ── Line items ────────────────────────────────────────────────────────────
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [dateOfService, setDateOfService] = useState("2026-04-25")

  // ── ICD-10 fixed dropdown ─────────────────────────────────────────────────
  const [icd10Search, setIcd10Search] = useState("")
  const [selectedLineForIcd10, setSelectedLineForIcd10] = useState<string | null>(null)
  const [icd10DropRect, setIcd10DropRect] = useState<DropRect | null>(null)
  const icd10InputRef = useRef<HTMLDivElement>(null) // the search input wrapper inside the fixed dropdown

  // Close ICD-10 dropdown on outside click
  useEffect(() => {
    if (!selectedLineForIcd10) return
    function handleClick(e: MouseEvent) {
      if (icd10InputRef.current && icd10InputRef.current.contains(e.target as Node)) return
      setSelectedLineForIcd10(null)
      setIcd10Search("")
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [selectedLineForIcd10])

  // ── Derived filtered lists ────────────────────────────────────────────────
  const filteredPatients = MOCK_PATIENTS.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    (p.membershipNumber ?? "").toLowerCase().includes(patientSearch.toLowerCase())
  ).slice(0, 5)

  const filteredCodes = TARIFF_CODES.filter(t =>
    t.code.includes(codeSearch) ||
    t.description.toLowerCase().includes(codeSearch.toLowerCase())
  ).slice(0, 8)

  const filteredIcd10 = ICD10_CODES.filter(c =>
    c.code.toLowerCase().includes(icd10Search.toLowerCase()) ||
    c.description.toLowerCase().includes(icd10Search.toLowerCase())
  ).slice(0, 8)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const addLineItem = (tariff: typeof TARIFF_CODES[0]) => {
    setLineItems(prev => [...prev, {
      id: `li-${Date.now()}`,
      type: "PROCEDURE",
      code: tariff.code,
      description: tariff.description,
      icd10: "",
      icd10Description: "",
      quantity: 1,
      unitPrice: tariff.nrpl,
      nrplPrice: tariff.nrpl,
    }])
    setCodeSearch("")
    setShowCodeDropdown(false)
  }

  const removeLineItem = (id: string) => setLineItems(prev => prev.filter(li => li.id !== id))

  const openIcd10Dropdown = useCallback((lineId: string, triggerEl: HTMLElement) => {
    const rect = triggerEl.getBoundingClientRect()
    setIcd10DropRect({ top: rect.bottom + 4, left: rect.left, width: 320 })
    setSelectedLineForIcd10(lineId)
    setIcd10Search("")
  }, [])

  const assignIcd10 = (code: string, description: string) => {
    if (!selectedLineForIcd10) return
    setLineItems(prev => prev.map(li =>
      li.id === selectedLineForIcd10 ? { ...li, icd10: code, icd10Description: description } : li
    ))
    setSelectedLineForIcd10(null)
    setIcd10Search("")
    setIcd10DropRect(null)
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const subtotal = lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0)
  const missingIcd10 = lineItems.filter(li => !li.icd10 && li.type === "PROCEDURE")
  const canFinalise = lineItems.length > 0 && missingIcd10.length === 0 && selectedPatient !== null

  return (
    <AppShell title="New Invoice" subtitle="Create billing invoice">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={15} /> Back to Invoices
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Main form ─────────────────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Patient selector */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Patient</h3>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patient by name or membership number..."
                className="pl-9"
                value={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : patientSearch}
                onFocus={() => setShowPatientDropdown(true)}
                onChange={(e) => {
                  setPatientSearch(e.target.value)
                  setSelectedPatient(null)
                  setShowPatientDropdown(true)
                }}
                onBlur={() => setTimeout(() => setShowPatientDropdown(false), 150)}
              />
              {showPatientDropdown && filteredPatients.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  {filteredPatients.map(p => (
                    <button
                      key={p.id}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 text-left"
                      onMouseDown={() => { setSelectedPatient(p); setPatientSearch(""); setShowPatientDropdown(false) }}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-muted-foreground">{p.scheme} · {p.membershipNumber ?? "Cash"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedPatient && (
              <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                  {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPatient.scheme} · {selectedPatient.membershipNumber ?? "Cash patient"} · {selectedPatient.planOption}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-muted-foreground hover:text-foreground text-lg leading-none"
                  aria-label="Remove patient"
                >
                  ✕
                </button>
              </div>
            )}
          </Card>

          {/* Invoice Details */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date of Service</label>
                <Input
                  type="date"
                  value={dateOfService}
                  onChange={e => setDateOfService(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Treating Doctor</label>
                <Input value="Dr. Sipho Dlamini" readOnly className="mt-1 bg-muted/30" />
              </div>
            </div>
          </Card>

          {/* Procedure Codes (Tariff) */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Procedure Codes (Tariff)</h3>

              {/* Tariff search */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tariff code..."
                  className="pl-8 h-8 text-sm w-56"
                  value={codeSearch}
                  onFocus={() => setShowCodeDropdown(true)}
                  onChange={e => { setCodeSearch(e.target.value); setShowCodeDropdown(true) }}
                  onBlur={() => setTimeout(() => setShowCodeDropdown(false), 150)}
                />
                {showCodeDropdown && filteredCodes.length > 0 && codeSearch && (
                  <div className="absolute top-full right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden w-96">
                    {filteredCodes.map(t => (
                      <button
                        key={t.code}
                        className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-muted/50 text-left"
                        onMouseDown={() => addLineItem(t)}
                      >
                        <Badge variant="outline" className="font-mono text-xs shrink-0">{t.code}</Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{t.description}</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground shrink-0">
                          R {t.nrpl.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Line items table */}
            {lineItems.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/30 border-b border-border">
                  <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Code</div>
                  <div className="col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</div>
                  <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ICD-10</div>
                  <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qty</div>
                  <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Amount</div>
                  <div className="col-span-1" />
                </div>

                {lineItems.map((li) => (
                  <div
                    key={li.id}
                    className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-border last:border-b-0"
                  >
                    {/* Code */}
                    <div className="col-span-2">
                      <Badge variant="outline" className="font-mono text-xs">{li.code}</Badge>
                    </div>

                    {/* Description */}
                    <div className="col-span-4">
                      <p className="text-sm text-foreground leading-snug">{li.description}</p>
                    </div>

                    {/* ICD-10 cell — trigger button only, no embedded dropdown */}
                    <div className="col-span-2">
                      {li.icd10 ? (
                        <button
                          title={li.icd10Description}
                          onClick={(e) => openIcd10Dropdown(li.id, e.currentTarget)}
                          className="inline-flex items-center gap-1 group"
                        >
                          <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-mono cursor-pointer group-hover:opacity-80">
                            {li.icd10}
                          </Badge>
                        </button>
                      ) : (
                        <button
                          className="text-xs text-destructive underline decoration-dashed flex items-center gap-1 hover:opacity-80"
                          onClick={(e) => openIcd10Dropdown(li.id, e.currentTarget)}
                        >
                          <AlertCircle size={11} />
                          Add ICD-10
                        </button>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min={1}
                        value={li.quantity}
                        onChange={(e) =>
                          setLineItems(prev =>
                            prev.map(l =>
                              l.id === li.id ? { ...l, quantity: Math.max(1, Number(e.target.value)) } : l
                            )
                          )
                        }
                        className="h-7 text-sm text-center w-14"
                      />
                    </div>

                    {/* Amount */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-semibold text-foreground">
                        R {(li.unitPrice * li.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">NRPL: R {li.nrplPrice.toFixed(2)}</p>
                    </div>

                    {/* Remove */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeLineItem(li.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove line item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-border rounded-lg text-muted-foreground">
                <p className="text-sm">Search for a tariff code above to add line items</p>
              </div>
            )}
          </Card>
        </div>

        {/* ── Right panel: Summary + actions ────────────────────────────────── */}
        <div className="space-y-4">
          {/* Validation */}
          {lineItems.length > 0 && (
            <Card className="p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Validation</h4>
              <div className="space-y-2">
                <div className={cn("flex items-center gap-2 text-sm", selectedPatient ? "text-green-600" : "text-destructive")}>
                  {selectedPatient ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  Patient selected
                </div>
                <div className={cn("flex items-center gap-2 text-sm", lineItems.length > 0 ? "text-green-600" : "text-muted-foreground")}>
                  {lineItems.length > 0 ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {lineItems.length} line item{lineItems.length !== 1 ? "s" : ""} added
                </div>
                <div className={cn("flex items-center gap-2 text-sm", missingIcd10.length === 0 ? "text-green-600" : "text-destructive")}>
                  {missingIcd10.length === 0 ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {missingIcd10.length === 0
                    ? "All ICD-10 codes assigned"
                    : `${missingIcd10.length} ICD-10 code(s) missing`}
                </div>
                {selectedPatient && !selectedPatient.membershipNumber && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600">
                    <AlertCircle size={14} />
                    Cash patient — cannot submit to scheme
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Totals */}
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-4">Invoice Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">R {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (0%)</span>
                <span className="font-medium">R 0.00</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-lg text-foreground">R {subtotal.toFixed(2)}</span>
              </div>
              {selectedPatient?.membershipNumber && (
                <>
                  <div className="flex justify-between text-primary">
                    <span>Medical Aid Claim</span>
                    <span className="font-medium">R {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Patient Liable</span>
                    <span>R 0.00</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full gap-2" disabled={!canFinalise}>
              <Send size={15} />
              Finalise &amp; Submit Claim
            </Button>
            <Button variant="outline" className="w-full" disabled={lineItems.length === 0}>
              Save as Draft
            </Button>
            <Link href="/invoices">
              <Button variant="ghost" className="w-full">Cancel</Button>
            </Link>
          </div>

          {!canFinalise && lineItems.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Complete all required fields above to finalise
            </p>
          )}
        </div>
      </div>

      {/* ── ICD-10 fixed-position dropdown — rendered outside any scroll/clip context ── */}
      {selectedLineForIcd10 && icd10DropRect && (
        <div
          ref={icd10InputRef}
          className="rounded-xl border border-border bg-background shadow-2xl overflow-hidden"
          style={{
            position: "fixed",
            top: icd10DropRect.top,
            left: icd10DropRect.left,
            width: icd10DropRect.width,
            zIndex: 9999,
            maxHeight: 360,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search header */}
          <div className="p-2.5 border-b border-border bg-muted/30 shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Type ICD-10 code or diagnosis…"
                value={icd10Search}
                onChange={e => setIcd10Search(e.target.value)}
                className="w-full pl-8 pr-3 h-8 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Results list */}
          <div className="overflow-y-auto flex-1">
            {filteredIcd10.length === 0 ? (
              <div className="px-4 py-4 text-sm text-muted-foreground italic text-center">
                No codes match &quot;{icd10Search}&quot;
              </div>
            ) : (
              <ul>
                {filteredIcd10.map(c => (
                  <li key={c.code}>
                    <button
                      type="button"
                      className="flex items-start gap-3 w-full px-4 py-2.5 hover:bg-muted transition-colors text-left border-b border-border/50 last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        assignIcd10(c.code, c.description)
                      }}
                    >
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                        {c.code}
                      </span>
                      <span className="text-sm text-foreground leading-snug">{c.description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-border px-3 py-2 bg-muted/30 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {filteredIcd10.length} of {ICD10_CODES.length} codes
            </span>
            <button
              type="button"
              onMouseDown={() => { setSelectedLineForIcd10(null); setIcd10Search("") }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
