import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://secureshare.bilalkhan.online'
  const currentDate = new Date()

  // Define all public pages
  const routes = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
    '/security',
    '/faq',
    '/encryption',
    '/how-it-works',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))
}
