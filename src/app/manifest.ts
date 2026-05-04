import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RelocateGH",
    short_name: "RelocateGH",
    description: "Family relocation planner for organising a move to Ghana.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4efe7",
    theme_color: "#0f766e",
    icons: [
      {
        src: "/Relocateghlogo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/Relocateghlogo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
