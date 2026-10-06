import type { MetadataRoute } from "next";
import { baseUrl } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = baseUrl();
  const lastModified = new Date();
  return [
    { url: `${url}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${url}/mentions-legales`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${url}/confidentialite`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
