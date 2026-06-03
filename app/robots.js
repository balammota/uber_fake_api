export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/mapistry/", "/api/mapistry/"],
      },
    ],
  };
}
