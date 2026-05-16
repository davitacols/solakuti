# Solakuti

Modern Nigerian news and media platform built with Next.js, TypeScript, Tailwind CSS, Django REST Framework, PostgreSQL and Cloudinary.

## Publisher Distribution Setup

Use this checklist to prepare Solakuti for browser news feeds, Google News-style discovery, RSS readers and publisher partnership submissions.

## 1. Confirm Deployment

After pushing to GitHub, wait for Vercel to finish deploying the frontend. Then confirm these URLs open successfully:

```text
https://solakuti.vercel.app/
https://solakuti.vercel.app/rss.xml
https://solakuti.vercel.app/news-sitemap.xml
https://solakuti.vercel.app/sitemap.xml
https://solakuti.vercel.app/about
https://solakuti.vercel.app/contact
https://solakuti.vercel.app/editorial-policy
https://solakuti.vercel.app/privacy-policy
https://solakuti.vercel.app/advertise
```

## 2. Submit to Google Search Console

Go to:

```text
https://search.google.com/search-console
```

Add this property:

```text
https://solakuti.vercel.app
```

Submit these sitemaps:

```text
sitemap.xml
news-sitemap.xml
```

## 3. Set Up Google Publisher Center

Go to:

```text
https://publishercenter.google.com
```

Create a publication for **Solakuti**.

Use these details:

```text
Website:
https://solakuti.vercel.app

Main RSS:
https://solakuti.vercel.app/rss.xml

News sitemap:
https://solakuti.vercel.app/news-sitemap.xml

Contact page:
https://solakuti.vercel.app/contact

Editorial policy:
https://solakuti.vercel.app/editorial-policy
```

## 4. Submit to Bing Webmaster Tools

Go to:

```text
https://www.bing.com/webmasters
```

Add the site and submit:

```text
https://solakuti.vercel.app/sitemap.xml
https://solakuti.vercel.app/news-sitemap.xml
```

## 5. Browser and Aggregator Pitch

Use this message when contacting Phoenix Browser, Opera News, browser feed teams, RSS aggregators or content partners:

```text
Hello,

I represent Solakuti, a Nigerian digital newsroom covering politics, general news, crime, economy, entertainment, world news and public affairs.

We would like Solakuti to be considered for inclusion in your news/browser content feed.

Website:
https://solakuti.vercel.app

Main RSS:
https://solakuti.vercel.app/rss.xml

News sitemap:
https://solakuti.vercel.app/news-sitemap.xml

Editorial policy:
https://solakuti.vercel.app/editorial-policy

Contact:
https://solakuti.vercel.app/contact

We can provide category-specific feeds, logos, sample articles and editorial contact details if required.

Regards,
Solakuti Editorial Team
```

## 6. Category RSS Feeds

Use category feeds when a platform asks for specific sections:

```text
https://solakuti.vercel.app/feeds/politics.xml
https://solakuti.vercel.app/feeds/entertainment.xml
https://solakuti.vercel.app/feeds/world-news.xml
https://solakuti.vercel.app/feeds/general-news.xml
https://solakuti.vercel.app/feeds/crime.xml
https://solakuti.vercel.app/feeds/economy.xml
https://solakuti.vercel.app/feeds/security-news.xml
```

## 7. Production Domain

For publisher applications, a custom domain is more credible than a Vercel subdomain.

Recommended final domain:

```text
https://solakuti.com
```

After adding the custom domain, update:

```text
NEXT_PUBLIC_SITE_URL=https://solakuti.com
```

Then resubmit the sitemaps and feeds with the final domain.

## Development

```bash
npm install
npm run dev
```

Backend setup lives in:

```text
backend/README.md
```
