const nextConfig = {
  async rewrites() {
    const apiURL = (process.env.API_SERVER_URL || "http://localhost:5000").replace(/\/$/, "");
    return [{ source: "/api/:path*", destination: `${apiURL}/api/:path*` }];
  }
};
export default nextConfig;
