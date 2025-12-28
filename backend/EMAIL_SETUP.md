# Configuración de Notificaciones por Email

Este documento explica cómo configurar las notificaciones por email para el sistema de soporte.

## Requisitos

El sistema utiliza Gmail SMTP para enviar notificaciones. Necesitarás:

1. Una cuenta de Gmail
2. Una "App Password" (contraseña de aplicación) de Google

## Paso 1: Crear una App Password en Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. En el menú lateral, selecciona "Seguridad"
3. En "Cómo inicias sesión en Google", habilita la "Verificación en dos pasos" si aún no está activada
4. Una vez activada la verificación en dos pasos, busca "Contraseñas de aplicaciones"
5. Selecciona "Otra (nombre personalizado)" y escribe "Momentum Fitness"
6. Haz clic en "Generar"
7. Copia la contraseña de 16 caracteres que se genera

## Paso 2: Configurar las Variables de Entorno

Edita el archivo `.env` en el directorio `backend/` y actualiza las siguientes variables:

```env
# ======================
# EMAIL CONFIGURATION
# ======================
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com          # Tu email de Gmail
SMTP_PASSWORD=xxxx xxxx xxxx xxxx         # La App Password generada (16 caracteres)
SUPPORT_EMAIL=edwardgiraldo101@gmail.com  # Email donde se recibirán los tickets
```

### Explicación de las variables:

- `SMTP_SERVER`: Servidor SMTP de Gmail (dejar como está)
- `SMTP_PORT`: Puerto SMTP (dejar como está)
- `SMTP_USERNAME`: Tu dirección de email de Gmail que enviará los mensajes
- `SMTP_PASSWORD`: La App Password que generaste en el Paso 1
- `SUPPORT_EMAIL`: Email donde llegarán las notificaciones de tickets (por defecto: edwardgiraldo101@gmail.com)

## Paso 3: Reiniciar el Backend

Después de configurar las variables de entorno, reinicia el servidor backend:

```bash
# Detén el servidor actual (Ctrl+C)
# Luego reinicia:
cd backend
python3 main.py
```

## Verificación

Para verificar que el email funciona correctamente:

1. Ve a la página de Soporte en tu aplicación
2. Crea un ticket de prueba
3. Verifica que llegue un email a `SUPPORT_EMAIL` con la información del ticket

## Formato del Email

Cada vez que se cree un ticket, se enviará un email HTML con:

- **Ticket ID**: Número único del ticket
- **Nombre**: Nombre de quien creó el ticket
- **Categoría**: Problema Técnico, Facturación, Nueva Funcionalidad, u Otro
- **Prioridad**: Baja, Media, Alta, o Urgente (con código de colores)
- **Asunto**: Resumen breve del problema
- **Mensaje**: Descripción detallada

## Troubleshooting

### El email no se envía

1. Verifica que las credenciales en `.env` sean correctas
2. Asegúrate de estar usando una App Password, no tu contraseña regular de Gmail
3. Revisa los logs del backend para ver mensajes de error
4. Verifica que la verificación en dos pasos esté habilitada en tu cuenta de Google

### "Credenciales SMTP no configuradas"

Este mensaje aparece si `SMTP_USERNAME` o `SMTP_PASSWORD` no están configurados en el archivo `.env`. El ticket se creará de todas formas, pero no se enviará el email.

### Límites de Gmail

Gmail tiene límites de envío:
- Máximo 500 emails por día para cuentas gratuitas
- Máximo 100 destinatarios por mensaje

Para este sistema (notificaciones de tickets), estos límites son más que suficientes.

## Seguridad

⚠️ **Importante**:
- Nunca compartas tu App Password
- No subas el archivo `.env` a repositorios públicos
- El archivo `.env` ya está incluido en `.gitignore`
- Si crees que tu App Password fue comprometida, revócala desde tu cuenta de Google y genera una nueva

## Usar otro proveedor de email

Si quieres usar otro proveedor (no Gmail), actualiza las variables:

### Outlook/Hotmail
```env
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@outlook.com
SMTP_PASSWORD=tu-contraseña
```

### Yahoo
```env
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@yahoo.com
SMTP_PASSWORD=tu-app-password
```

### Otro proveedor SMTP
Consulta la documentación de tu proveedor para obtener el servidor y puerto SMTP correctos.
