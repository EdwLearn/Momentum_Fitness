"use client"

import { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function TestDatePickerPositionPage() {
  const [fecha1, setFecha1] = useState("")
  const [fecha2, setFecha2] = useState("")
  const [fecha3, setFecha3] = useState("")
  const [fecha4, setFecha4] = useState("")

  return (
    <DashboardLayout
      title="Test DatePicker - Posicionamiento Inteligente"
      subtitle="El calendario se ajusta automáticamente según el espacio disponible"
    >
      <div className="space-y-8">
        {/* Info Card */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-[#3a3a3a]">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            🎯 Posicionamiento Inteligente
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-[#A4FF1A] mb-2">Detección Vertical:</p>
              <ul className="space-y-1">
                <li>✓ Calcula espacio disponible arriba/abajo</li>
                <li>✓ Abre hacia abajo si hay espacio</li>
                <li>✓ Abre hacia arriba si está cerca del borde inferior</li>
                <li>✓ Recalcula en scroll y resize</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[#A4FF1A] mb-2">Detección Horizontal:</p>
              <ul className="space-y-1">
                <li>✓ Alinea a la izquierda si hay espacio</li>
                <li>✓ Alinea a la derecha cerca del borde derecho</li>
                <li>✓ Centra si no hay espacio en los lados</li>
                <li>✓ Previene desbordamiento del viewport</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test 1: Top Left */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            1. Esquina Superior Izquierda
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Debe abrir hacia <strong>abajo</strong> y alineado a la <strong>izquierda</strong>
          </p>
          <div className="max-w-xs">
            <DatePicker
              value={fecha1}
              onChange={setFecha1}
              placeholder="Click para probar"
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="h-96"></div>

        {/* Test 2: Middle */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            2. Centro de la Página
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Debe abrir según el scroll actual
          </p>
          <div className="max-w-xs">
            <DatePicker
              value={fecha2}
              onChange={setFecha2}
              placeholder="Click para probar"
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="h-96"></div>

        {/* Test 3: Bottom Left */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            3. Esquina Inferior Izquierda
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Debe abrir hacia <strong>arriba</strong> (no hay espacio abajo)
          </p>
          <div className="max-w-xs">
            <DatePicker
              value={fecha3}
              onChange={setFecha3}
              placeholder="Click para probar - abre arriba"
            />
          </div>
        </div>

        {/* Test 4: Right Aligned */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            4. Alineado a la Derecha
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Debe abrir alineado a la <strong>derecha</strong>
          </p>
          <div className="flex justify-end">
            <div className="w-64">
              <DatePicker
                value={fecha4}
                onChange={setFecha4}
                placeholder="Click para probar"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 rounded-xl bg-[#3a3a3a]/50 border border-[#3a3a3a]">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            📝 Instrucciones de Prueba
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Haz scroll hacia abajo y prueba cada DatePicker</li>
            <li>Observa cómo se abre arriba o abajo según el espacio</li>
            <li>Redimensiona la ventana del navegador</li>
            <li>Observa cómo se recalcula la posición automáticamente</li>
            <li>Prueba en modo responsive (móvil)</li>
          </ol>
        </div>

        {/* Bottom spacer */}
        <div className="h-32"></div>
      </div>
    </DashboardLayout>
  )
}
