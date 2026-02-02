"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type FilterType = "text" | "select" | "date" | "number" | "boolean"

export interface ColumnFilter {
  type: FilterType
  options?: Array<{ label: string; value: string }> // Para filtros tipo select
  placeholder?: string
}

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  filter?: ColumnFilter // Configuración del filtro para esta columna
  sortable?: boolean // Si la columna es ordenable
}

interface FilterableDataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowAction?: (item: T) => void
  actionLabel?: string
  searchPlaceholder?: string
  showGlobalSearch?: boolean
  emptyMessage?: string
  pageSize?: number
}

type SortConfig<T> = {
  key: keyof T | string
  direction: "asc" | "desc"
} | null

export function FilterableDataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowAction,
  actionLabel = "Ver",
  searchPlaceholder = "Buscar...",
  showGlobalSearch = true,
  emptyMessage = "No se encontraron resultados",
  pageSize = 50,
}: FilterableDataTableProps<T>) {
  const [globalSearch, setGlobalSearch] = useState("")
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Determinar si hay columnas con filtros configurados
  const hasColumnFilters = columns.some(col => col.filter)

  // Función para actualizar filtro de columna
  const updateColumnFilter = (key: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1) // Resetear a la primera página al filtrar
  }

  // Función para limpiar filtro de columna
  const clearColumnFilter = (key: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setGlobalSearch("")
    setColumnFilters({})
    setCurrentPage(1)
  }

  // Función para ordenar
  const handleSort = (key: keyof T | string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" }
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" }
      }
      return null
    })
  }

  // Obtener valor de una columna
  const getColumnValue = (item: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      // Soporte para propiedades anidadas (ej: "usuario.nombre")
      const keys = key.split('.')
      let value: any = item
      for (const k of keys) {
        value = value?.[k]
      }
      return value
    }
    return item[key as keyof T]
  }

  // Filtrar y ordenar datos
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data]

    // Aplicar búsqueda global
    if (globalSearch) {
      filtered = filtered.filter(item => {
        return columns.some(col => {
          const value = getColumnValue(item, col.key)
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(globalSearch.toLowerCase())
        })
      })
    }

    // Aplicar filtros por columna
    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(item => {
          const value = getColumnValue(item, key)
          if (value === null || value === undefined) return false

          const column = columns.find(col => String(col.key) === key)
          const filterType = column?.filter?.type

          switch (filterType) {
            case "text":
              return String(value).toLowerCase().includes(filterValue.toLowerCase())
            case "select":
              return String(value) === filterValue
            case "boolean":
              return String(value) === filterValue
            case "number":
              return Number(value) === Number(filterValue)
            case "date":
              // Comparación simple de fecha (puede mejorarse)
              return String(value).includes(filterValue)
            default:
              return String(value).toLowerCase().includes(filterValue.toLowerCase())
          }
        })
      }
    })

    // Aplicar ordenamiento
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = getColumnValue(a, sortConfig.key)
        const bVal = getColumnValue(b, sortConfig.key)

        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1

        let comparison = 0
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal
        } else if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal)
        } else {
          comparison = String(aVal).localeCompare(String(bVal))
        }

        return sortConfig.direction === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [data, globalSearch, columnFilters, sortConfig, columns])

  // Calcular paginación
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = useMemo(
    () => filteredAndSortedData.slice(startIndex, endIndex),
    [filteredAndSortedData, startIndex, endIndex]
  )

  // Funciones de navegación
  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))

  // Resetear a la primera página cuando cambian los filtros o datos
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [filteredAndSortedData.length, totalPages, currentPage])

    // Contar filtros activos
  const activeFiltersCount = Object.values(columnFilters).filter(v => v).length + (globalSearch ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Búsqueda global */}
          {showGlobalSearch && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 bg-secondary border-border focus:border-primary"
              />
            </div>
          )}

          {/* Botón de filtros por columna */}
          {hasColumnFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "gap-2",
                activeFiltersCount > 0 && "border-primary text-primary"
              )}
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Botón limpiar filtros */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}

          {/* Contador de resultados */}
          <div className="ml-auto text-sm text-muted-foreground">
            {filteredAndSortedData.length} {filteredAndSortedData.length === 1 ? 'resultado' : 'resultados'}
          </div>
        </div>

        {/* Filtros por columna */}
        {showFilters && hasColumnFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-secondary/50 rounded-lg border border-border">
            {columns
              .filter(col => col.filter)
              .map(col => {
                const filterConfig = col.filter!
                const currentValue = columnFilters[String(col.key)] || ""

                return (
                  <div key={String(col.key)} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      {col.header}
                    </label>

                    {filterConfig.type === "select" ? (
                      <div className="flex gap-2">
                        <Select
                          value={currentValue}
                          onValueChange={(value) => updateColumnFilter(String(col.key), value)}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder={filterConfig.placeholder || "Seleccionar..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {filterConfig.options?.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {currentValue && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearColumnFilter(String(col.key))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : filterConfig.type === "boolean" ? (
                      <div className="flex gap-2">
                        <Select
                          value={currentValue}
                          onValueChange={(value) => updateColumnFilter(String(col.key), value)}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Sí</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                        {currentValue && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearColumnFilter(String(col.key))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          type={filterConfig.type === "number" ? "number" : filterConfig.type === "date" ? "date" : "text"}
                          placeholder={filterConfig.placeholder || `Filtrar ${col.header.toLowerCase()}...`}
                          value={currentValue}
                          onChange={(e) => updateColumnFilter(String(col.key), e.target.value)}
                          className="bg-background"
                        />
                        {currentValue && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearColumnFilter(String(col.key))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Tabla - Con scroll horizontal en móviles */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              {columns.map((column) => (
                <TableHead key={String(column.key)} className="text-muted-foreground font-semibold">
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(column.key)}
                      className="h-auto p-0 hover:bg-transparent hover:text-foreground"
                    >
                      {column.header}
                      {sortConfig?.key === column.key && (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {onRowAction && <TableHead className="text-muted-foreground font-semibold">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onRowAction ? 1 : 0)} className="text-center py-8 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={index} className="border-border hover:bg-secondary/30 transition-colors">
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className="text-foreground">
                      {column.render ? column.render(item) : String(getColumnValue(item, column.key) ?? "")}
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
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            Mostrando {startIndex + 1} - {Math.min(endIndex, filteredAndSortedData.length)} de {filteredAndSortedData.length} registros
          </div>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            >
              <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <div className="text-xs sm:text-sm font-medium px-2">
              Pág. {currentPage}/{totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            >
              <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
