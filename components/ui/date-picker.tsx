"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DatePickerProps {
  value?: string // ISO format: YYYY-MM-DD
  onChange: (date: string) => void
  minDate?: string
  maxDate?: string
  placeholder?: string
  yearRange?: { start: number; end: number }
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Seleccionar fecha",
  yearRange = { start: 1950, end: new Date().getFullYear() }
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const yearPickerRef = useRef<HTMLDivElement>(null)

  // Parse value to Date or use today
  const selectedDate = value ? new Date(value + "T00:00:00") : null

  useEffect(() => {
    // Set initial view date to selected date or today
    if (selectedDate) {
      setViewDate(selectedDate)
    }
  }, [])

  // Calculate position when opening
  useEffect(() => {
    if (isOpen && containerRef.current && dropdownRef.current) {
      const calculatePosition = () => {
        const container = containerRef.current
        const dropdown = dropdownRef.current
        if (!container || !dropdown) return

        const containerRect = container.getBoundingClientRect()
        const dropdownHeight = 480 // Approximate height of dropdown
        const dropdownWidth = 360 // Width of dropdown

        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth

        const spaceBelow = viewportHeight - containerRect.bottom
        const spaceAbove = containerRect.top
        const spaceRight = viewportWidth - containerRect.left
        const spaceLeft = containerRect.right

        const newPosition: { top?: number; bottom?: number; left?: number; right?: number } = {}

        // Vertical positioning
        if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
          // Open below
          newPosition.top = containerRect.bottom + 8
        } else {
          // Open above
          newPosition.bottom = viewportHeight - containerRect.top + 8
        }

        // Horizontal positioning
        if (spaceRight >= dropdownWidth) {
          // Align to left
          newPosition.left = containerRect.left
        } else if (spaceLeft >= dropdownWidth) {
          // Align to right
          newPosition.right = viewportWidth - containerRect.right
        } else {
          // Center in viewport if not enough space on either side
          newPosition.left = Math.max(8, (viewportWidth - dropdownWidth) / 2)
        }

        setPosition(newPosition)
      }

      // Calculate on open
      calculatePosition()

      // Recalculate on scroll or resize
      window.addEventListener('scroll', calculatePosition, true)
      window.addEventListener('resize', calculatePosition)

      return () => {
        window.removeEventListener('scroll', calculatePosition, true)
        window.removeEventListener('resize', calculatePosition)
      }
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsYearPickerOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "Escape") {
        setIsOpen(false)
        setIsYearPickerOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString + "T00:00:00")
    const day = date.getDate()
    const month = MONTHS[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const isDateDisabled = (date: Date): boolean => {
    const dateStr = formatDate(date)
    if (minDate && dateStr < minDate) return true
    if (maxDate && dateStr > maxDate) return true
    return false
  }

  const isSameDay = (date1: Date, date2: Date | null): boolean => {
    if (!date2) return false
    return formatDate(date1) === formatDate(date2)
  }

  const isToday = (date: Date): boolean => {
    return formatDate(date) === formatDate(new Date())
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))
  }

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth()))
    setIsYearPickerOpen(false)
  }

  const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      onChange(formatDate(date))
      setIsOpen(false)
    }
  }

  const generateYears = () => {
    const years = []
    for (let year = yearRange.end; year >= yearRange.start; year--) {
      years.push(year)
    }
    return years
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate)
    const firstDay = getFirstDayOfMonth(viewDate)
    const days: (Date | null)[] = []

    // Previous month days
    const prevMonthDays = getDaysInMonth(
      new Date(viewDate.getFullYear(), viewDate.getMonth() - 1)
    )
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, prevMonthDays - i)
      )
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i))
    }

    // Next month days to fill grid
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, i))
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) return null

          const isCurrentMonth = date.getMonth() === viewDate.getMonth()
          const isSelected = isSameDay(date, selectedDate)
          const isCurrentDay = isToday(date)
          const isDisabled = isDateDisabled(date)

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateSelect(date)}
              disabled={isDisabled}
              className={`
                aspect-square flex items-center justify-center text-base rounded-lg
                transition-all duration-200 font-medium
                ${isCurrentMonth ? "text-white" : "text-[#666]"}
                ${isSelected
                  ? "bg-[#A4FF1A] text-black scale-105 shadow-lg"
                  : isCurrentMonth && !isDisabled
                  ? "hover:bg-[#4a4a4a]"
                  : ""
                }
                ${isCurrentDay && !isSelected ? "ring-1 ring-[#A4FF1A]/40" : ""}
                ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                focus:outline-none focus:ring-2 focus:ring-[#A4FF1A]/50
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    )
  }

  const renderYearPicker = () => {
    const years = generateYears()
    const currentYear = new Date().getFullYear()

    return (
      <div
        ref={yearPickerRef}
        className="absolute top-0 left-0 right-0 bottom-0 bg-[#2a2a2a]/98 backdrop-blur-md rounded-2xl p-4 overflow-y-auto z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Seleccionar Año</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsYearPickerOpen(false)}
            className="text-white hover:bg-[#3a3a3a]"
          >
            ✕
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {years.map((year) => {
            const isCurrentYear = year === currentYear
            const isSelectedYear = year === viewDate.getFullYear()

            return (
              <button
                key={year}
                type="button"
                onClick={() => handleYearSelect(year)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isSelectedYear
                    ? "bg-[#A4FF1A] text-black"
                    : isCurrentYear
                    ? "bg-[#3a3a3a] text-[#A4FF1A] ring-1 ring-[#A4FF1A]/40"
                    : "bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]"
                  }
                  focus:outline-none focus:ring-2 focus:ring-[#A4FF1A]/50
                `}
              >
                {year}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Input Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-secondary border border-border rounded-md
                   text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#A4FF1A]/50
                   hover:border-[#A4FF1A]/30 transition-colors"
      >
        <Calendar className="h-4 w-4 text-[#A4FF1A]" />
        <span className={value ? "text-white" : "text-muted-foreground"}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 p-5 rounded-2xl shadow-2xl
                     bg-[#2a2a2a] border border-[#3a3a3a]
                     animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            width: "360px",
            top: position.top !== undefined ? `${position.top}px` : undefined,
            bottom: position.bottom !== undefined ? `${position.bottom}px` : undefined,
            left: position.left !== undefined ? `${position.left}px` : undefined,
            right: position.right !== undefined ? `${position.right}px` : undefined,
          }}
        >
          {/* Year Picker Overlay */}
          {isYearPickerOpen && renderYearPicker()}

          {/* Header - Two Cards */}
          <div className="flex items-center gap-2 mb-5">
            {/* Month Card */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#3a3a3a] rounded-xl shadow-inner">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="h-7 w-7 hover:bg-[#4a4a4a] text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1 text-center flex items-center justify-center gap-2">
                <span className="text-white font-semibold text-sm">
                  {MONTHS[viewDate.getMonth()]}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#A4FF1A]" />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="h-7 w-7 hover:bg-[#4a4a4a] text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Year Card */}
            <button
              type="button"
              onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
              className="px-4 py-2.5 bg-[#3a3a3a] rounded-xl shadow-inner hover:bg-[#4a4a4a] transition-colors"
            >
              <span className="text-white font-semibold text-sm">
                {viewDate.getFullYear()}
              </span>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-3 bg-[#3a3a3a] rounded-xl shadow-inner">
            {renderCalendar()}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(formatDate(new Date()))
                setIsOpen(false)
              }}
              className="flex-1 h-9 text-xs hover:bg-[#3a3a3a] text-white"
            >
              Hoy
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("")
                setIsOpen(false)
              }}
              className="flex-1 h-9 text-xs hover:bg-[#3a3a3a] text-white"
            >
              Limpiar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
