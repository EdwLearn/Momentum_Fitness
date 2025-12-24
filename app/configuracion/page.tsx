"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Building2, Bell, Shield, Palette, CreditCard, Mail, Save } from "lucide-react"
import { useState } from "react"
import { SuccessToast } from "@/components/success-toast"

export default function ConfiguracionPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("perfil")

  const handleSave = () => {
    setShowSuccess(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-1">Administra la configuración de tu gimnasio</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full bg-sidebar-accent">
            <TabsTrigger
              value="perfil"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="gimnasio"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Gimnasio
            </TabsTrigger>
            <TabsTrigger
              value="notificaciones"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger
              value="seguridad"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="h-4 w-4 mr-2" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger
              value="apariencia"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Palette className="h-4 w-4 mr-2" />
              Apariencia
            </TabsTrigger>
            <TabsTrigger
              value="facturacion"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Facturación
            </TabsTrigger>
          </TabsList>

          {/* Perfil Tab */}
          <TabsContent value="perfil" className="space-y-6">
            <Card className="p-6 bg-card border-sidebar-border">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Información Personal</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre completo</Label>
                      <Input id="nombre" defaultValue="Admin User" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="admin@momentum.com" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input id="telefono" defaultValue="+57 300 123 4567" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cargo">Cargo</Label>
                      <Select defaultValue="admin">
                        <SelectTrigger className="bg-sidebar">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Foto de Perfil</h3>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                      >
                        Cambiar foto
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG. Máximo 2MB.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Gimnasio Tab */}
          <TabsContent value="gimnasio" className="space-y-6">
            <Card className="p-6 bg-card border-sidebar-border">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Información del Gimnasio</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gym-name">Nombre del gimnasio</Label>
                      <Input id="gym-name" defaultValue="Momentum Fitness" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gym-nit">NIT</Label>
                      <Input id="gym-nit" defaultValue="900.123.456-7" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="gym-address">Dirección</Label>
                      <Input id="gym-address" defaultValue="Calle 123 #45-67, Bogotá" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gym-phone">Teléfono</Label>
                      <Input id="gym-phone" defaultValue="+57 1 234 5678" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gym-email">Email</Label>
                      <Input id="gym-email" type="email" defaultValue="info@momentum.com" className="bg-sidebar" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Horarios de Atención</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="horario-semana">Lunes a Viernes</Label>
                      <Input id="horario-semana" defaultValue="6:00 AM - 10:00 PM" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horario-finde">Sábados y Domingos</Label>
                      <Input id="horario-finde" defaultValue="7:00 AM - 8:00 PM" className="bg-sidebar" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Redes Sociales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input id="instagram" placeholder="@momentumfitness" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input id="facebook" placeholder="/momentumfitness" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktok">TikTok</Label>
                      <Input id="tiktok" placeholder="@momentumfitness" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio Web</Label>
                      <Input id="website" placeholder="www.momentum.com" className="bg-sidebar" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notificaciones Tab */}
          <TabsContent value="notificaciones" className="space-y-6">
            <Card className="p-6 bg-card border-sidebar-border">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Configuración de Email</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">Servidor SMTP</Label>
                      <Input id="smtp-host" placeholder="smtp.gmail.com" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">Puerto</Label>
                      <Input id="smtp-port" placeholder="587" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">Usuario</Label>
                      <Input id="smtp-user" placeholder="notifications@momentum.com" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-pass">Contraseña</Label>
                      <Input id="smtp-pass" type="password" placeholder="••••••••" className="bg-sidebar" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Configuración de WhatsApp</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wa-api">API Key</Label>
                      <Input id="wa-api" placeholder="Tu API Key de WhatsApp Business" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wa-number">Número de WhatsApp</Label>
                      <Input id="wa-number" placeholder="+57 300 123 4567" className="bg-sidebar" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Preferencias de Notificación</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones por Email</Label>
                        <p className="text-sm text-muted-foreground">Recibir alertas importantes por correo</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones Push</Label>
                        <p className="text-sm text-muted-foreground">Recibir notificaciones en tiempo real</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Resumen Diario</Label>
                        <p className="text-sm text-muted-foreground">Recibir un resumen diario de actividad</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas de Vencimiento</Label>
                        <p className="text-sm text-muted-foreground">Notificar sobre suscripciones por vencer</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Seguridad Tab */}
          <TabsContent value="seguridad" className="space-y-6">
            <Card className="p-6 bg-card border-sidebar-border">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Cambiar Contraseña</h3>
                  <div className="grid gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="current-pass">Contraseña Actual</Label>
                      <Input id="current-pass" type="password" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-pass">Nueva Contraseña</Label>
                      <Input id="new-pass" type="password" className="bg-sidebar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-pass">Confirmar Contraseña</Label>
                      <Input id="confirm-pass" type="password" className="bg-sidebar" />
                    </div>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Actualizar contraseña
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Autenticación de Dos Factores</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Activar 2FA</Label>
                        <p className="text-sm text-muted-foreground">Agrega una capa extra de seguridad</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Sesiones Activas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-sidebar-accent">
                      <div>
                        <p className="font-medium text-foreground">Windows - Chrome</p>
                        <p className="text-sm text-muted-foreground">Bogotá, Colombia · Activo ahora</p>
                      </div>
                      <p className="text-xs text-primary font-medium">Este dispositivo</p>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-sidebar-accent">
                      <div>
                        <p className="font-medium text-foreground">iPhone - Safari</p>
                        <p className="text-sm text-muted-foreground">Bogotá, Colombia · Hace 2 horas</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Apariencia Tab */}
          <TabsContent value="apariencia" className="space-y-6">
            <Card className="p-6 bg-card border-sidebar-border">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Tema del Dashboard</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative cursor-pointer group">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-gray-900 to-black border-2 border-primary">
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-primary/20 rounded"></div>
                          <div className="h-2 w-3/4 bg-gray-700 rounded"></div>
                          <div className="h-2 w-1/2 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-center mt-2 text-primary">Oscuro (Actual)</p>
                    </div>
                    <div className="relative cursor-pointer group opacity-50">
                      <div className="p-4 rounded-lg bg-white border-2 border-gray-300">
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-gray-200 rounded"></div>
                          <div className="h-2 w-3/4 bg-gray-300 rounded"></div>
                          <div className="h-2 w-1/2 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-center mt-2 text-muted-foreground">Claro</p>
                    </div>
                    <div className="relative cursor-pointer group opacity-50">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-gray-300">
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-blue-400/30 rounded"></div>
                          <div className="h-2 w-3/4 bg-blue-200/30 rounded"></div>
                          <div className="h-2 w-1/2 bg-blue-200/30 rounded"></div>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-center mt-2 text-muted-foreground">Azul Profundo</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Color de Acento</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {[
                      { name: "Verde Neón", color: "#A4FF1A", active: true },
                      { name: "Azul", color: "#22D3EE", active: false },
                      { name: "Púrpura", color: "#8B5CF6", active: false },
                      { name: "Naranja", color: "#F97316", active: false },
                      { name: "Rosa", color: "#EC4899", active: false },
                      { name: "Amarillo", color: "#FBBF24", active: false },
                    ].map((item) => (
                      <div key={item.name} className="text-center cursor-pointer group">
                        <div
                          className={`h-12 w-12 rounded-full mx-auto ${item.active ? "ring-2 ring-offset-2 ring-offset-background ring-primary" : ""}`}
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <p className="text-xs mt-2 text-muted-foreground group-hover:text-foreground">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Preferencias de Visualización</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Modo Compacto</Label>
                        <p className="text-sm text-muted-foreground">Reduce el espaciado entre elementos</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Animaciones</Label>
                        <p className="text-sm text-muted-foreground">Habilitar animaciones y transiciones</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sidebar Expandido</Label>
                        <p className="text-sm text-muted-foreground">Mantener el sidebar siempre visible</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Facturación Tab */}
          <TabsContent value="facturacion" className="space-y-6">
            <Card className="p-6 bg-card border-sidebar-border">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Plan Actual</h3>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">Plan Pro</p>
                        <p className="text-muted-foreground">Hasta 2,000 clientes activos</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary">$89.99</p>
                        <p className="text-muted-foreground">por mes</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                      >
                        Cambiar plan
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                      >
                        Cancelar suscripción
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Método de Pago</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-sidebar-accent border border-primary">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-16 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Visa •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Vence 12/2025</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 border-red-500 bg-transparent">
                          Eliminar
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-dashed bg-transparent">
                      + Agregar método de pago
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Facturas</h3>
                  <div className="space-y-2">
                    {[
                      { fecha: "Dic 2024", monto: "$89.99", estado: "Pagado" },
                      { fecha: "Nov 2024", monto: "$89.99", estado: "Pagado" },
                      { fecha: "Oct 2024", monto: "$89.99", estado: "Pagado" },
                    ].map((factura, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-sidebar-accent">
                        <div className="flex items-center gap-4">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{factura.fecha}</p>
                            <p className="text-sm text-muted-foreground">Factura #{1000 + i}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-primary">{factura.estado}</span>
                          <span className="font-semibold text-foreground">{factura.monto}</span>
                          <Button variant="outline" size="sm">
                            Descargar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <SuccessToast open={showSuccess} onOpenChange={setShowSuccess} message="Configuración guardada exitosamente" />
    </DashboardLayout>
  )
}
