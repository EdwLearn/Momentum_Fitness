"use client"

import { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function TestDatePickerPage() {
  const [fecha1, setFecha1] = useState("")
  const [fecha2, setFecha2] = useState("2000-01-15")
  const [fecha3, setFecha3] = useState("")

  return (
    <DashboardLayout
      title="Test DatePicker"
      subtitle="Componente personalizado con glassmorphism y dark mode"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Demo Card 1 */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            1. DatePicker Básico
          </h3>
          <div className="max-w-md">
            <DatePicker
              value={fecha1}
              onChange={setFecha1}
              placeholder="Seleccionar fecha"
            />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground">Valor seleccionado:</p>
            <p className="text-white font-mono">{fecha1 || "null"}</p>
          </div>
        </div>

        {/* Demo Card 2 */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            2. DatePicker con Valor Inicial
          </h3>
          <div className="max-w-md">
            <DatePicker
              value={fecha2}
              onChange={setFecha2}
              placeholder="Fecha de nacimiento"
            />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground">Valor seleccionado:</p>
            <p className="text-white font-mono">{fecha2}</p>
          </div>
        </div>

        {/* Demo Card 3 */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            3. DatePicker con Restricciones (máximo hoy)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Este picker no permite seleccionar fechas futuras (útil para fechas de nacimiento)
          </p>
          <div className="max-w-md">
            <DatePicker
              value={fecha3}
              onChange={setFecha3}
              maxDate={new Date().toISOString().split("T")[0]}
              placeholder="Fecha de nacimiento"
            />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground">Valor seleccionado:</p>
            <p className="text-white font-mono">{fecha3 || "null"}</p>
          </div>
        </div>

        {/* Features Card */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-[#3a3a3a]">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            ✨ Características v2.0
          </h3>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <p className="text-xs font-semibold text-[#A4FF1A] mb-2">Diseño</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span>Header con dos cards (mes + año)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span>Dot verde (#A4FF1A) en header</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span>Grid con shadow-inner (#3a3a3a)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span>Bordes redondeados xl (rounded-2xl)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span>Glassmorphism sutil</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span>Días otros meses en gris (#666)</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#A4FF1A] mb-2">Funcionalidad</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span><strong>Selector de año</strong> con grid 4 columnas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span>Rango de años configurable (1950-2025)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span>Scroll rápido por años</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span>Highlight año actual y seleccionado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span>Formato ISO (YYYY-MM-DD)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A4FF1A]">✓</span>
                  <span>Keyboard navigation (ESC)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            📝 Ejemplo de Uso
          </h3>
          <pre className="p-4 rounded-lg bg-[#1a1a1a] text-sm overflow-x-auto">
            <code className="text-[#A4FF1A]">
{`import { DatePicker } from "@/components/ui/date-picker"

function MyForm() {
  const [fecha, setFecha] = useState("")

  return (
    <DatePicker
      value={fecha}
      onChange={setFecha}
      maxDate={new Date().toISOString().split("T")[0]}
      placeholder="Seleccionar fecha"
    />
  )
}`}
            </code>
          </pre>
        </div>
      </div>
    </DashboardLayout>
  )
}
