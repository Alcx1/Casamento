/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Permite testar o `npm run dev` pelo celular/tablet na mesma rede Wi-Fi (ex.: http://192.168.0.10:3000).
  // Sem isso o Next bloqueia o JavaScript para outros aparelhos e nenhum botão responde ao toque.
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*'],
}

export default nextConfig
