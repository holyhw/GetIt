import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.getitsju.com",
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: "https://www.getitsju.com/search",
      changeFrequency: "always",
      priority: 0.8,
    },
    {
      url: "https://www.getitsju.com/login",
      changeFrequency: "never",
      priority: 0.5,
    },
  ];
}
