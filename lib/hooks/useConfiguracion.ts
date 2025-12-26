import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { configuracionService, ConfiguracionGimnasioUpdate } from "@/lib/services/configuracion"

export function useConfiguracion() {
  return useQuery({
    queryKey: ["configuracion"],
    queryFn: () => configuracionService.getConfiguracion(),
  })
}

export function useUpdateConfiguracion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ConfiguracionGimnasioUpdate) => configuracionService.updateConfiguracion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracion"] })
    },
  })
}
