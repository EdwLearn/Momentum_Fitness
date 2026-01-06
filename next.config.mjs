/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Genera HTML/CSS/JS estáticos
  distDir: 'out',    // Carpeta de salida (por defecto es 'out' pero lo dejamos explícito)

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,  // Necesario para export estático
  },

  // Configuración adicional para export
  trailingSlash: true,  // Añade / al final de las URLs para mejor compatibilidad
}

export default nextConfig