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
  trailingSlash: false,  // Desactivado para evitar problemas de navegación con puerto diferente
}

export default nextConfig