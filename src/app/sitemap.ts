import type { MetadataRoute } from 'next';
import { getDeadlines, getSubjects } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const subjects = await getSubjects();
  const deadlines = await getDeadlines();

  const now = new Date();

  // Các trang tĩnh chính
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deadlines`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  // Các trang môn học (SSG)
  const subjectRoutes: MetadataRoute.Sitemap = subjects.map((sub) => ({
    url: `${baseUrl}/subjects/${sub.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Toàn bộ các trang deadline chi tiết (ISR)
  const deadlineRoutes: MetadataRoute.Sitemap = deadlines.map((item) => ({
    url: `${baseUrl}/deadlines/${item.id}`,
    lastModified: new Date(item.dueDate),
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  return [...staticRoutes, ...subjectRoutes, ...deadlineRoutes];
}

