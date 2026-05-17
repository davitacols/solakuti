# Solakuti

Modern Nigerian news and media platform built with Next.js, TypeScript, Tailwind CSS, Django REST Framework, PostgreSQL and Cloudinary.

## Publisher Distribution Setup

Use this checklist to prepare Solakuti for browser news feeds, Google News-style discovery, RSS readers and publisher partnership submissions.

## 1. Confirm Deployment

After pushing to GitHub, wait for Vercel to finish deploying the frontend. Then confirm these URLs open successfully:

```text
https://solakuti.com/
https://solakuti.com/rss.xml
https://solakuti.com/news-sitemap.xml
https://solakuti.com/sitemap.xml
https://solakuti.com/about
https://solakuti.com/contact
https://solakuti.com/editorial-policy
https://solakuti.com/privacy-policy
https://solakuti.com/advertise
```

## 2. Submit to Google Search Console

Go to:

```text
https://search.google.com/search-console
```

Add this property:

```text
https://solakuti.com
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
https://solakuti.com

Main RSS:
https://solakuti.com/rss.xml

News sitemap:
https://solakuti.com/news-sitemap.xml

Contact page:
https://solakuti.com/contact

Editorial policy:
https://solakuti.com/editorial-policy
```

## 4. Submit to Bing Webmaster Tools

Go to:

```text
https://www.bing.com/webmasters
```

Add the site and submit:

```text
https://solakuti.com/sitemap.xml
https://solakuti.com/news-sitemap.xml
```

## 5. Browser and Aggregator Pitch

Use this message when contacting Phoenix Browser, Opera News, browser feed teams, RSS aggregators or content partners:

```text
Hello,

I represent Solakuti, a Nigerian digital newsroom covering politics, general news, crime, economy, entertainment, world news and public affairs.

We would like Solakuti to be considered for inclusion in your news/browser content feed.

Website:
https://solakuti.com

Main RSS:
https://solakuti.com/rss.xml

News sitemap:
https://solakuti.com/news-sitemap.xml

Editorial policy:
https://solakuti.com/editorial-policy

Contact:
https://solakuti.com/contact

We can provide category-specific feeds, logos, sample articles and editorial contact details if required.

Regards,
Solakuti Editorial Team
```

## 6. Category RSS Feeds

Use category feeds when a platform asks for specific sections:

```text
https://solakuti.com/feeds/politics.xml
https://solakuti.com/feeds/entertainment.xml
https://solakuti.com/feeds/world-news.xml
https://solakuti.com/feeds/general-news.xml
https://solakuti.com/feeds/crime.xml
https://solakuti.com/feeds/economy.xml
https://solakuti.com/feeds/security-news.xml
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

