import type { NextConfig } from "next";

const config: NextConfig = {
  async redirects() {
    return [{ source: "/explore", destination: "/apps", permanent: true }];
  }
};

export default config;
