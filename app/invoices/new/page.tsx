"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MOCK_PATIENTS, TARIFF_CODES, ICD10_CODES } from "@/lib/mock-data"
import { ChevronLeft, Search, Plus, Trash2, AlertCircle, CheckCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface LineItem {
  id: string
  type: "PROCEDURE" | "MEDICINE" | "CONSUMABLE"
  code: string
  description: string
  icd10: string
  quantity: number
  unitPrice: number
  nrplPrice: number
}

export default function NewInvoicePage() {
  const [selectedPatient, setSelectedPatient] = useState<typeof MOCK_PATIENTS[0] | null>(null)
  const [patientSearch, setPatientSearch] = useState("")
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [codeSearch, setCodeSearch] = useState("")
  const [icd10Search, setIcd10Search] = useState("")
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [dateOfService, setDateOfService] = useState("2026-04-25")
  const [showCodeDropdown, setShowCodeDropdown] = useState(false)
  const [showIcd10Dropdown, setShowIcd10Dropdown] = useState(false)
  const [selectedLineForIcd10, setSelectedLineForIcd10] = useState<string | null>(null)

  const filteredPatients = MOCK_PATIENTS.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    (p.membershipNumber ?? "").toLowerCase().includes(patientSearch.toLowerCase())
  ).slice(0, 5)

  const filteredCodes = TARIFF_CODES.filter(t =>
    t.code.includes(codeSearch) || t.description.toLowerCase().includes(codeSearch.toLowerCase())
  ).slice(0, 6)

  const filteredIcd10 = ICD10_CODES.filter(c =>
    c.code.toLowerCase().includes(icd10Search.toLowerCase()) ||
    c.description.toLowerCase().includes(icd10Search.toLowerCase())
  ).slice(0, 6)

  const addLineItem = (tariff: typeof TARIFF_CODES[0]) => {
    const newItem: LineItem = {
      id: `li-${Date.now()}`,
      type: "PROCEDURE",
      code: tariff.code,
      description: tariff.description,
      icd10: "",
      quantity: 1,
      unitPrice: tariff.nrpl,
      nrplPrice: tariff.nrpl,
    }
    setLineItems(prev => [...prev, newItem])
    setCodeSearch("")
    setShowCodeDropdown(false)
  }

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(li => li.id !== id))
  }

  const assignIcd10 = (code: string, desc: string) => {
    if (!selectedLineForIcd10) return
    setLineItems(prev => prev.map(li =>
      li.id === selectedLineForIcd10 ? { ...li, icd10: code } : li
    ))
    setSelectedLineForIcd10(null)
    setShowIcd10Dropdown(false)
    setIcd10Search("")
  }

  const subtotal = lineItems.reduce((sum, li) => sum + (li.unitPrice * li.quantity), 0)

  const missingIcd10 = lineItems.filter(li => !li.icd10 && li.type === "PROCEDURE")
  const canFinalise = lineItems.length > 0 && missingIcd10.length === 0 && selectedPatient

  return (
    <AppShell title="New Invoice" subtitle="Create billing invoice">
      <Link href="/invoices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft size={15} /> Back to Invoices
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main form */}
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
                onBlur={() => setTimeout(() => setShowPatientDropdown(false), 150)}
                onChange={(e) => {
                  setPatientSearch(e.target.value)
                  setSelectedPatient(null)
                }}
              />
              {showPatientDropdown && filteredPatients.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  {filteredPatients.map(p => (
                    <button
                      key={p.id}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 text-left"
                      onMouseDown={() => { setSelectedPatient(p); setPatientSearch("") }}
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
                  <p className="text-sm font-semibold text-foreground">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                  <p className="text-xs text-muted-foreground">{selectedPatient.scheme} · {selectedPatient.membershipNumber ?? "Cash patient"} · {selectedPatient.planOption}</p>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
            )}
          </Card>

          {/* Details */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date of Service</label>
                <Input type="date" value={dateOfService} onChange={e => setDateOfService(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Treating Doctor</label>
                <Input value="Dr. Sipho Dlamini" readOnly className="mt-1 bg-muted/30" />
              </div>
            </div>
          </Card>

          {/* Procedure codes */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Procedure Codes (Tariff)</h3>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tariff code..."
                  className="pl-8 h-8 text-sm w-56"
                  value={codeSearch}
                  onFocus={() => setShowCodeDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCodeDropdown(false), 150)}
                  onChange={e => { setCodeSearch(e.target.value); setShowCodeDropdown(true) }}
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
                        <span className="text-sm font-semibold text-foreground shrink-0">R {t.nrpl.toFixed(2)}</span>
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
                  <div className="col-span-2 text-xs font-semibold text-muted-foreground">Code</div>
                  <div className="col-span-4 text-xs font-semibold text-muted-foreground">Description</div>
                  <div className="col-span-2 text-xs font-semibold text-muted-foreground">ICD-10</div>
                  <div className="col-span-1 text-xs font-semibold text-muted-foreground">Qty</div>
                  <div className="col-span-2 text-xs font-semibold text-muted-foreground text-right">Amount</div>
                  <div className="col-span-1" />
                </div>
                {lineItems.map((li) => (
                  <div key={li.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-border last:border-b-0">
                    <div className="col-span-2">
                      <Badge variant="outline" className="font-mono text-xs">{li.code}</Badge>
                    </div>
                    <div className="col-span-4">
                      <p className="text-sm text-foreground">{li.description}</p>
                    </div>
                    <div className="col-span-2">
                      {li.icd10 ? (
                        <Badge className="text-xs bg-green-100 text-green-700 font-mono">{li.icd10}</Badge>
                      ) : (
                        <div className="relative">
                          <button
                            className="text-xs text-destructive underline decoration-dashed flex items-center gap-1"
                            onClick={() => { setSelectedLineForIcd10(li.id); setShowIcd10Dropdown(true) }}
                          >
                            <AlertCircle size={11} />
                            Add ICD-10
                          </button>
                          {showIcd10Dropdown && selectedLineForIcd10 === li.id && (
                            <div className="absolute top-full left-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden w-80">
                              <div className="p-2 border-b border-border">
                                <Input
                                  placeholder="Search diagnosis..."
                                  className="h-8 text-sm"
                                  value={icd10Search}
                                  autoFocus
                                  onChange={e => setIcd10Search(e.target.value)}
                                />
                              </div>
                              {filteredIcd10.map(c => (
                                <button
                                  key={c.code}
                                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-muted/50 text-left"
                                  onMouseDown={() => assignIcd10(c.code, c.description)}
                                >
                                  <Badge variant="outline" className="font-mono text-xs shrink-0">{c.code}</Badge>
                                  <p className="text-xs text-foreground">{c.description}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min={1}
                        value={li.quantity}
                        onChange={(e) => setLineItems(prev => prev.map(l => l.id === li.id ? { ...l, quantity: Number(e.target.value) } : l))}
                        className="h-7 text-sm text-center w-14"
                      />
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-semibold text-foreground">R {(li.unitPrice * li.quantity).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">NRPL: R {li.nrplPrice.toFixed(2)}</p>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeLineItem(li.id)} className="text-muted-foreground hover:text-destructive transition-colors">
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

        {/* Right: Summary + actions */}
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
                  {missingIcd10.length === 0 ? "All ICD-10 codes assigned" : `${missingIcd10.length} ICD-10 code(s) missing`}
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
            <Button
              className="w-full gap-2"
              disabled={!canFinalise}
            >
              <Send size={15} />
              Finalise & Submit Claim
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
    </AppShell>
  )
}
