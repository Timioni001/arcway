import type { MetadataRoute } from "next";

/** Makes Arcway installable to a phone's home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arcway",
    short_name: "Arcway",
    description: "Discover apps on Arc, complete quests and build your passport.",
    start_url: "/overview",
    display: "standalone",
    background_color: "#F7FAFC",
    theme_color: "#10224A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ],
    shortcuts: [
      { name: "Create a pay link", url: "/pay" },
      { name: "My passport", url: "/passport" },
      { name: "Quests", url: "/quests" }
    ]
  };
}
