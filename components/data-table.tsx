"use client"

import type React from "react"
import { useState, useMemo } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowAction?: (item: T) => void
  actionLabel?: string
  pageSize?: number
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowAction,
  actionLabel = "Ver",
  pageSize = 50,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  // Calcular paginación
  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = useMemo(() => data.slice(startIndex, endIndex), [data, startIndex, endIndex])

  // Funciones de navegación
  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))

  // Resetear a la primera página cuando cambian los datos
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [data.length, totalPages, currentPage])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              {columns.map((column) => (
                <TableHead key={String(column.key)} className="text-muted-foreground font-semibold">
                  {column.header}
                </TableHead>
              ))}
              {onRowAction && <TableHead className="text-muted-foreground font-semibold">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={index} className="border-border hover:bg-secondary/30 transition-colors">
                {columns.map((column) => (
                  <TableCell key={String(column.key)} className="text-foreground">
                    {column.render ? column.render(item) : String(item[column.key as keyof T] ?? "")}
                  </TableCell>
                ))}
                {onRowAction && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRowAction(item)}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      {actionLabel}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} - {Math.min(endIndex, data.length)} de {data.length} registros
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    activo: "bg-primary/20 text-primary border-primary/30",
    inactivo: "bg-destructive/20 text-destructive border-destructive/30",
    "sin membresía": "bg-muted/60 text-muted-foreground border-muted",
    vencido: "bg-destructive/20 text-destructive border-destructive/30",
    "por vencer": "bg-warning/20 text-warning border-warning/30",
    pendiente: "bg-warning/20 text-warning border-warning/30",
    enviado: "bg-primary/20 text-primary border-primary/30",
    fallido: "bg-destructive/20 text-destructive border-destructive/30",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium capitalize",
        statusStyles[status.toLowerCase()] || "bg-secondary text-secondary-foreground",
      )}
    >
      {status}
    </Badge>
  )
}
