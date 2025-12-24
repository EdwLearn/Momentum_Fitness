"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  UserCheck,
  Users,
  CreditCard,
  UsersRound,
  Ticket,
  Bell,
  FileBarChart,
  Settings,
  HelpCircle,
  Zap,
  Lock,
} from "lucide-react"

const mainMenuItems = [
  { name: "Asistencia", href: "/asistencia", icon: UserCheck },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Empleados", href: "/empleados", icon: UsersRound },
  { name: "Cupones & Referidos", href: "/cupones", icon: Ticket },
  { name: "Notificaciones", href: "/notificaciones", icon: Bell },
]

const protectedMenuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, protected: true },
  { name: "Suscripciones", href: "/suscripciones", icon: CreditCard, protected: true },
  { name: "Reportes", href: "/reportes", icon: FileBarChart, protected: true },
]

const otherMenuItems = [
  { name: "Configuración", href: "/configuracion", icon: Settings },
  { name: "Soporte", href: "/soporte", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Momentum</h1>
            <p className="text-xs text-muted-foreground">Fitness</p>
          </div>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menú Principal
          </p>
          {mainMenuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground glow-green-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
                {item.name}
              </Link>
            )
          })}

          {/* Protected Section */}
          <div className="pt-6">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Protegido
            </p>
            {protectedMenuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground glow-green-sm"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
                  {item.name}
                  <Lock className="h-3.5 w-3.5 ml-auto opacity-60" />
                </Link>
              )
            })}
          </div>

          {/* Other Section */}
          <div className="pt-6">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Otros
            </p>
            {otherMenuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground glow-green-sm"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground text-center">© 2025 Momentum Fitness</p>
        </div>
      </div>
    </aside>
  )
}
