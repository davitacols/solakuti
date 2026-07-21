# Solakuti Newsroom Onboarding

## Why This Changed

Every Solakuti article was published under a single anonymous byline: **"News Desk."** All 1,146 of them.

Google evaluates news sites on **E-E-A-T** — Experience, Expertise, Authoritativeness, Trust. A site with over a thousand articles and no identifiable human behind any of them fails that standard, and it is a significant reason our AdSense applications kept being rejected as "low value content."

From now on, **every byline belongs to a real, named person with a public profile.** This document explains how to get onboarded and how editors bring new writers in.

---

## For Journalists: Getting Your Account

### If you received an invitation link

1. Open the link an editor sent you. It looks like `https://www.solakuti.com/join?token=...`
2. Complete your profile (details below)
3. Submit — your account is active immediately and you can sign in at `/admin`

Invitation links **expire after 14 days** and can only be used once. If yours has expired, ask an editor for a new one.

### If you are applying on your own

1. Go to **[/write-for-us](https://www.solakuti.com/write-for-us)**
2. Complete the same profile form
3. An editor reviews your application

You can sign in while pending, but **you cannot publish until an editor approves you.**

### What you must provide

| Field | Required | Notes |
|---|---|---|
| **Full name** | Yes | Your real first and last name. Single names are rejected. |
| **Profile photo** | Yes | A real headshot. Readers should see who wrote the story. |
| **Biography** | Yes | Minimum 80 characters. Your reporting background and the subjects you cover. |
| **Password** | Yes | Minimum 8 characters. |
| **Email** | Yes | Pre-filled and locked if you were invited. |
| **X (Twitter)** | Optional | Strongly encouraged — helps readers verify you are real. |
| **LinkedIn** | Optional | Same. |

> **Your bio and photo are public.** They appear on your author page and on every article you publish. Write the bio for readers, not for the form — it is part of how Google and our audience judge whether Solakuti is trustworthy.

### Writing a bio that works

**Too thin (will be rejected):**
> Journalist at Solakuti.

**Good:**
> Chidi Okeke is a Lagos-based political correspondent covering the National Assembly, election administration and public accountability. He has reported on Nigerian politics since 2019.

State where you are based, what you cover, and what gives you standing to cover it.

---

## For Editors: Bringing Someone In

All controls live in the **Journalists** panel of the admin dashboard (`/admin`, below the article queue).

### Inviting someone

1. Enter their email address
2. Pick a role — Journalist, Editor, or Contributor
3. Add an optional note (e.g. "Politics desk")
4. Click **Create invite link**
5. Click **Copy link** and send it to them via email or WhatsApp

> **Note:** We do not have automated email yet, so invite links must be sent manually. This is intentional for now — it keeps onboarding deliberate.

Invited journalists are **auto-verified** and can publish as soon as they complete their profile. Only invite people you have actually vetted.

### Reviewing applications

Applications from `/write-for-us` appear under **Byline applications** with the applicant's photo, name and bio.

- **Approve** — promotes them to Journalist; they can now publish
- **Decline** — deactivates the account; the record is kept

Before approving, ask: *would I be comfortable with this person's name and face on a Solakuti story?* If the bio is vague, the photo is not a real headshot, or you cannot establish that they are who they claim, decline it. An anonymous or fabricated author profile is worse than no author at all — it is a trust violation that can get the site permanently banned rather than merely rejected.

### Revoking an invite

Click **Revoke** on any open invitation. The link stops working immediately. Accepted invitations cannot be revoked — deactivate the user account instead.

---

## Roles and What They Can Do

| Role | Publish articles | Manage invites | Approve applicants | Manage users |
|---|---|---|---|---|
| **Admin** | Yes | Yes | Yes | Yes |
| **Editor** | Yes | Yes | No | No |
| **Journalist** | Yes | No | No | No |
| **Contributor** | No | No | No | No |

**Contributor** is also the role assigned to ordinary readers who register to comment. Registering as a reader never grants publishing rights — that separation is deliberate.

An account can only publish when it is **both** verified **and** holds an Admin, Editor or Journalist role.

---

## Rules That Are Enforced, Not Suggested

These are validated by the API, so they cannot be bypassed by editing the page:

- A byline requires a real first and last name
- A byline requires a profile photo
- A byline requires a bio of at least 80 characters
- Invites cannot create Admin accounts
- Invites cannot target an email that already has an account
- An email cannot have two pending invites at once
- Invite tokens are single-use and expire after 14 days
- Reader registration can never grant publishing rights

---

## Still To Come

**Existing articles have not been reassigned yet.** All 1,146 published stories still carry the "News Desk" byline. Once real journalists are onboarded, we will bulk-reassign historical articles to their actual authors. Until that happens, the AdSense problem is only partly solved.

Other known gaps:

- **No automated email** — invite links and password resets are shared manually
- **Article depth** — our articles average roughly 550 words. Google reads short, derivative coverage as low value. Aim for original framing, context and consequence, not a summary of what someone said
- **Source attribution** — where a story builds on another outlet's reporting, credit it

---

## Questions

Editorial and access issues: **editorial@solakuti.com**

See also [Editorial Policy](https://www.solakuti.com/editorial-policy).
