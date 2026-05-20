"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Bell, Shield, Save, Lock, Download, Upload, Loader2, Database } from "lucide-react"
import { useState, useEffect } from "react"
import { SuccessToast } from "@/components/success-toast"
import { useConfiguracion, useUpdateConfiguracion } from "@/lib/hooks/useConfiguracion"

export default function ConfiguracionPage() {
  const { data: configuracion, isLoading } = useConfiguracion()
  const updateConfiguracion = useUpdateConfiguracion()

  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("gimnasio")
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [backupError, setBackupError] = useState("")
  const [backupSuccess, setBackupSuccess] = useState("")
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(false)
  const [securityPassword, setSecurityPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Estados para cambiar contraseña
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changePasswordError, setChangePasswordError] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Estados para configuración del gimnasio
  const [gymName, setGymName] = useState("")
  const [gymNit, setGymNit] = useState("")
  const [gymAddress, setGymAddress] = useState("")
  const [gymPhone, setGymPhone] = useState("")
  const [gymEmail, setGymEmail] = useState("")
  const [horarioSemana, setHorarioSemana] = useState("")
  const [horarioFinde, setHorarioFinde] = useState("")
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [tiktok, setTiktok] = useState("")
  const [website, setWebsite] = useState("")

  // Cargar datos cuando llegue la configuración
  useEffect(() => {
    if (configuracion) {
      setGymName(configuracion.nombre_gimnasio || "")
      setGymNit(configuracion.nit || "")
      setGymAddress(configuracion.direccion || "")
      setGymPhone(configuracion.telefono || "")
      setGymEmail(configuracion.email || "")
      setHorarioSemana(configuracion.horario_semana || "")
      setHorarioFinde(configuracion.horario_finde || "")
      setInstagram(configuracion.instagram || "")
      setFacebook(configuracion.facebook || "")
      setTiktok(configuracion.tiktok || "")
      setWebsite(configuracion.website || "")
    }
  }, [configuracion])

  const handleSave = () => {
    setShowSuccess(true)
  }

  const handleSaveGym = async () => {
    try {
      await updateConfiguracion.mutateAsync({
        nombre_gimnasio: gymName,
        nit: gymNit,
        direccion: gymAddress,
        telefono: gymPhone,
        email: gymEmail,
        horario_semana: horarioSemana,
        horario_finde: horarioFinde,
        instagram,
        facebook,
        tiktok,
        website,
      })
      setShowSuccess(true)
    } catch (error) {
      console.error("Error al guardar configuración:", error)
    }
  }

  const handleSecurityUnlock = () => {
    if (securityPassword === "GetRich666") {
      setIsSecurityUnlocked(true)
      setPasswordError("")
    } else {
      setPasswordError("Contraseña incorrecta")
    }
  }

  const handleChangePassword = async () => {
    setChangePasswordError("")

    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangePasswordError("Todos los campos son obligatorios")
      return
    }

    if (currentPassword !== "GetRich666") {
      setChangePasswordError("La contraseña actual es incorrecta")
      return
    }

    if (newPassword.length < 6) {
      setChangePasswordError("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError("Las contraseñas no coinciden")
      return
    }

    if (currentPassword === newPassword) {
      setChangePasswordError("La nueva contraseña debe ser diferente a la actual")
      return
    }

    setIsChangingPassword(true)

    try {
      // Aquí iría la llamada al backend
      // await cambiarContrasena({ currentPassword, newPassword })

      // Simulamos una llamada al servidor
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Limpiar campos
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setShowSuccess(true)
    } catch (error) {
      setChangePasswordError("Error al cambiar la contraseña. Intenta nuevamente.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleExportBackup = async () => {
    setIsExporting(true)
    setBackupError("")
    setBackupSuccess("")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000"
      const response = await fetch(`${apiUrl}/api/backup/export`)
      if (!response.ok) throw new Error("Error al exportar")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const disposition = response.headers.get("Content-Disposition") || ""
      const match = disposition.match(/filename=(.+)/)
      a.download = match ? match[1] : "momentum_backup.zip"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setBackupSuccess("Backup exportado y descargado exitosamente")
    } catch {
      setBackupError("Error al exportar el backup. Verifica la conexión con el servidor.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    setIsImporting(true)
    setBackupError("")
    setBackupSuccess("")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000"
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch(`${apiUrl}/api/backup/import`, {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Error al importar")
      const total = data.tablas_restauradas?.reduce((acc: number, t: any) => acc + t.filas, 0) ?? 0
      setBackupSuccess(`Backup restaurado: ${data.tablas_restauradas?.length ?? 0} tablas, ${total} registros`)
    } catch (err: any) {
      setBackupError(err.message || "Error al restaurar el backup")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <DashboardLayout
      title="Configuración"
      subtitle="Administra la configuración de tu gimnasio"
    >
      <div className="space-y-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full bg-sidebar-accent">
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
              value="backup"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Database className="h-4 w-4 mr-2" />
              Backup
            </TabsTrigger>
          </TabsList>

          {/* Gimnasio Tab */}
          <TabsContent value="gimnasio" className="space-y-6">
            <Card className="p-6 bg-card border-sidebar-border">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Información del Gimnasio</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gym-name">Nombre del gimnasio</Label>
                      <Input
                        id="gym-name"
                        value={gymName}
                        onChange={(e) => setGymName(e.target.value)}
                        className="bg-sidebar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gym-nit">NIT</Label>
                      <Input
                        id="gym-nit"
                        value={gymNit}
                        onChange={(e) => setGymNit(e.target.value)}
                        className="bg-sidebar"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="gym-address">Dirección</Label>
                      <Input
                        id="gym-address"
                        value={gymAddress}
                        onChange={(e) => setGymAddress(e.target.value)}
                        className="bg-sidebar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gym-phone">Teléfono</Label>
                      <Input
                        id="gym-phone"
                        value={gymPhone}
                        onChange={(e) => setGymPhone(e.target.value)}
                        className="bg-sidebar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gym-email">Email</Label>
                      <Input
                        id="gym-email"
                        type="email"
                        value={gymEmail}
                        onChange={(e) => setGymEmail(e.target.value)}
                        className="bg-sidebar"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Horarios de Atención</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="horario-semana">Lunes a Viernes</Label>
                      <Input
                        id="horario-semana"
                        value={horarioSemana}
                        onChange={(e) => setHorarioSemana(e.target.value)}
                        className="bg-sidebar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horario-finde">Sábados y Domingos</Label>
                      <Input
                        id="horario-finde"
                        value={horarioFinde}
                        onChange={(e) => setHorarioFinde(e.target.value)}
                        className="bg-sidebar"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Redes Sociales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        placeholder="@momentumfitness"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="bg-sidebar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        placeholder="/momentumfitness"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        className="bg-sidebar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktok">TikTok</Label>
                      <Input
                        id="tiktok"
                        placeholder="@momentumfitness"
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value)}
                        className="bg-sidebar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio Web</Label>
                      <Input
                        id="website"
                        placeholder="www.momentum.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="bg-sidebar"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveGym}
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
              {!isSecurityUnlocked ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">Sección Protegida</h3>
                    <p className="text-muted-foreground">Ingresa tu contraseña para acceder a la configuración de seguridad</p>
                  </div>
                  <div className="w-full max-w-md space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="security-password">Contraseña</Label>
                      <Input
                        id="security-password"
                        type="password"
                        placeholder="Ingresa tu contraseña"
                        className="bg-sidebar"
                        value={securityPassword}
                        onChange={(e) => {
                          setSecurityPassword(e.target.value)
                          setPasswordError("")
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSecurityUnlock()
                          }
                        }}
                      />
                      {passwordError && (
                        <p className="text-sm text-red-500">{passwordError}</p>
                      )}
                    </div>
                    <Button
                      onClick={handleSecurityUnlock}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Desbloquear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Configuración de Seguridad</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsSecurityUnlocked(false)
                        setSecurityPassword("")
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Bloquear
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Cambiar Contraseña</h3>
                    <div className="grid gap-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="current-pass">Contraseña Actual</Label>
                        <Input
                          id="current-pass"
                          type="password"
                          className="bg-sidebar"
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value)
                            setChangePasswordError("")
                          }}
                          disabled={isChangingPassword}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-pass">Nueva Contraseña</Label>
                        <Input
                          id="new-pass"
                          type="password"
                          className="bg-sidebar"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value)
                            setChangePasswordError("")
                          }}
                          disabled={isChangingPassword}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-pass">Confirmar Contraseña</Label>
                        <Input
                          id="confirm-pass"
                          type="password"
                          className="bg-sidebar"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            setChangePasswordError("")
                          }}
                          disabled={isChangingPassword}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isChangingPassword) {
                              handleChangePassword()
                            }
                          }}
                        />
                      </div>
                      {changePasswordError && (
                        <p className="text-sm text-red-500">{changePasswordError}</p>
                      )}
                      <Button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
                      >
                        {isChangingPassword ? "Actualizando..." : "Actualizar contraseña"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-6">
            <Card className="p-6 bg-card border-sidebar-border">
              <div className="space-y-8">

                {/* Exportar */}
                <div className="flex items-start gap-6 p-5 rounded-lg border border-border bg-sidebar">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-base font-semibold text-foreground">Exportar Backup</h3>
                    <p className="text-sm text-muted-foreground">
                      Descarga un archivo <code className="bg-muted px-1 rounded text-xs">.zip</code> con toda la información de la base de datos dividida en archivos CSV por tabla.
                    </p>
                  </div>
                  <Button
                    onClick={handleExportBackup}
                    disabled={isExporting || isImporting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm shrink-0"
                  >
                    {isExporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {isExporting ? "Exportando..." : "Descargar Backup"}
                  </Button>
                </div>

                {/* Restaurar */}
                <div className="flex items-start gap-6 p-5 rounded-lg border border-border bg-sidebar">
                  <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Upload className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-base font-semibold text-foreground">Restaurar Backup</h3>
                    <p className="text-sm text-muted-foreground">
                      Carga un archivo <code className="bg-muted px-1 rounded text-xs">.zip</code> generado previamente para restaurar toda la información. <span className="text-yellow-500 font-medium">Esta acción reemplazará todos los datos actuales.</span>
                    </p>
                  </div>
                  <label>
                    <Button
                      variant="outline"
                      disabled={isImporting || isExporting}
                      className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 shrink-0 cursor-pointer"
                      asChild
                    >
                      <span>
                        {isImporting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        {isImporting ? "Restaurando..." : "Subir y Restaurar"}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".zip"
                      className="hidden"
                      onChange={handleImportBackup}
                      disabled={isImporting || isExporting}
                    />
                  </label>
                </div>

                {/* Feedback */}
                {backupError && (
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-sm">
                    <span className="font-medium">Error:</span> {backupError}
                  </div>
                )}
                {backupSuccess && (
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm">
                    <span className="font-medium">Listo:</span> {backupSuccess}
                  </div>
                )}

              </div>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      <SuccessToast isVisible={showSuccess} onClose={() => setShowSuccess(false)} message="Configuración guardada exitosamente" />
    </DashboardLayout>
  )
}
