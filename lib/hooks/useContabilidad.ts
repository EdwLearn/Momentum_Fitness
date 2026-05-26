import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { contabilidadService } from "@/lib/services/contabilidad"
import type { MovimientoCreate } from "@/types"

const KEYS = {
  movimientos: (tipo?: string, categoria?: string) =>
    ["contabilidad", "movimientos", tipo, categoria] as const,
  resumen: ["contabilidad", "resumen"] as const,
}

export function useMovimientos(tipo?: string, categoria?: string) {
  return useQuery({
    queryKey: KEYS.movimientos(tipo, categoria),
    queryFn: () => contabilidadService.getMovimientos(tipo, categoria),
  })
}

export function useResumenFinanciero() {
  return useQuery({
    queryKey: KEYS.resumen,
    queryFn: contabilidadService.getResumen,
  })
}

export function useCreateMovimiento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (movimiento: MovimientoCreate) =>
      contabilidadService.createMovimiento(movimiento),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contabilidad"] })
    },
  })
}

export function useDeleteMovimiento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => contabilidadService.deleteMovimiento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contabilidad"] })
    },
  })
}
