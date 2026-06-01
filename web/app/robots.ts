import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/search", "/login"],
      disallow: ["/mypage", "/myinfo", "/myitems", "/notification", "/register", "/edit", "/chatroom", "/oauth"],
    },
    sitemap: "https://www.getitsju.com/sitemap.xml",
  };
}
