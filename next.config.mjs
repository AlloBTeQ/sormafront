/** @type {import('next').NextConfig} */
// Static export: `next build` writes plain HTML/CSS/JS to out/. No server, no
// API routes, no middleware on this origin — that is the point of the split.
const nextConfig = {
  output: 'export',
  poweredByHeader: false,
  images: { unoptimized: true },
  trailingSlash: false,
};
export default nextConfig;
