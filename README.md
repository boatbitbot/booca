# X Autopilot

This project scaffolds an AI-assisted X/Twitter account that is designed to be operated transparently as an AI brand, not as a fake human persona. It can generate a content queue, attach monetization CTAs, and optionally publish posts through the X API.

## What it does

- Generates shortform posts for a single niche
- Pulls live trend/news headlines from configurable feeds
- Mixes educational, opinion, proof, and offer content
- Uses stronger hook formats and reply prompts to bias for conversation
- Assigns a predicted growth score to each queued post
- Filters higher-risk low-quality posts before they reach the queue
- Diversifies queue order across format, topic cluster, and monetization density
- Rotates monetization CTAs so the feed does not become a pure ad stream
- Stores a local queue in `data/queue.json`
- Stores live headline candidates in `data/trends.json`
- Supports a simple performance leaderboard in `data/performance.json`
- Posts the next approved item to X when API credentials are configured
- Supports dry-run mode for testing automation without publishing

## Safety and platform limits

Use this as an AI brand account with clear disclosure in the profile and pinned post. Do not use it to impersonate a real person, mass-spam replies, or run deceptive engagement loops. The code is designed around top-level posts and consent-based interactions because X’s current automation rules explicitly prohibit spammy automated mentions/replies and bulk aggressive follow behavior.

Relevant sources:

- [X automation rules](https://help.x.com/en/rules-and-policies/twitter-automation?lang=browser)
- [Automated account labels](https://help.x.com/using-x/automated-account-labels)
- [X API docs](https://developer.x.com/en/docs/twitter-api)
- [twitter/the-algorithm](https://github.com/twitter/the-algorithm)
- [Twitter's Recommendation Algorithm blog post](https://blog.x.com/engineering/en_us/topics/open-source/2023/twitter-recommendation-algorithm)

## Monetization model

The starter config is optimized around one focused niche with one primary monetization path:

1. Build attention with useful posts.
2. Convert with a simple CTA to one offer.
3. Capture proof and testimonials.
4. Recycle high-performing angles into threads, lead magnets, or products.

Recommended monetization ladder:

1. Affiliate offer
2. Lead magnet to email list
3. Low-ticket digital product
4. Consulting or sponsorship

## Quick start

```bash
npm install
cp .env.example .env
npm run generate
npm run post-next
```

## Dry run

With `DRY_RUN=true`, posting writes a preview to stdout instead of publishing. Start there first.

## Automation

Run this every few hours with cron, a VPS scheduler, GitHub Actions, or another worker:

```bash
npm run run-cycle
```

That command will top up the queue and then publish up to `POSTS_PER_RUN` queued items.

## Trend and news mode

This project can also create daily-news reaction posts from live RSS feeds.

- `npm run fetch-trends` refreshes `data/trends.json`
- `npm run run-cycle` now fetches trends before queue generation
- `TREND_AUTO_POST=false` keeps news-reactive posts in the queue for review only
- `TREND_AUTO_POST=true` lets the cycle auto-publish top-scoring trend posts too
- `BREAKING_POSTS_PER_RUN=3` queues several top breaking-news picks each generation cycle
- `BREAKING_STORY_LIMIT=6` controls how many fresh stories get expanded into multiple draft angles

You can also hit `/api/breaking` from the dashboard to generate a bigger batch of breaking-news drafts on demand. It now returns multiple angles per story, including `fast-take`, `why-it-matters`, `contrarian-angle`, `prediction`, and `creator-angle`, then queues the strongest picks automatically.

The default feeds are Google News top stories, business, technology, world, and entertainment for the United States. You can change those in [src/config.ts](/Users/boat/Documents/New project/x-autopilot/src/config.ts:1).

Trend posts are intentionally phrased as sourced reactions, not as independent factual reporting. They quote the headline and source, then add a brief take aligned with the account niche.

## Vercel deployment

This project now includes:

- a simple dashboard at `/`
- API endpoints at `/api/status`, `/api/queue`, and `/api/run-cycle`
- `vercel.json` with a default daily cron job for `/api/run-cycle`

Important current Vercel constraints:

- On the Hobby plan, cron jobs can only run once per day and may fire within an hour of the scheduled time.
- For more frequent posting on Vercel, you need a Pro plan or another scheduler.
- Vercel's filesystem is ephemeral, so deployed state should use `BLOB_READ_WRITE_TOKEN` instead of relying on local `data/*.json`.

Official docs:

- [Vercel cron jobs](https://vercel.com/docs/cron-jobs/)
- [Vercel cron job pricing and limits](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Vercel environment variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel Blob](https://vercel.com/docs/vercel-blob)

### Deploy steps

```bash
vercel
```

Then add these environment variables in Vercel:

- `X_APP_KEY`
- `X_APP_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_SECRET`
- `CRON_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `DRY_RUN`
- `TREND_AUTO_POST`

If you deploy through GitHub, import the repo in Vercel, set the project root to `x-autopilot`, add the same environment variables, and redeploy.

## 30-day growth system

The fastest compliant way to grow is not "post more," it is "test more angles and keep the winners."

This version leans on signals explicitly mentioned in X's public recommendation materials:

- Candidate sourcing and second-degree distribution matter, so content is written to be legible to adjacent communities instead of only existing followers.
- Ranking is based on probabilities of positive engagements like likes, replies, reposts, clicks, and related actions, so each queued item carries a multi-signal prediction instead of one generic score.
- Visibility filters and feedback-based fatigue exist, so the queue rejects spammy or overly risky phrasing before it can post.
- Author diversity and content balance matter, so queue order is diversified across formats and topic clusters.

1. Days 1-7: post daily, test hooks, and watch which `experimentTag` gets the most replies and follows.
2. Days 8-14: keep the top 30% of hook-format combinations and reduce weak monetized posts.
3. Days 15-21: turn winning posts into variants and tighter proof-based posts.
4. Days 22-30: increase CTA density only on proven high-reach formats.

The queue now includes:

- `format`: the writing pattern being tested
- `topicCluster`: the adjacent community/topic the post is trying to travel through
- `experimentTag`: the pillar-format-topic combination
- `predictedScore`: a weighted score for likely reach and engagement
- `visibilityRisk`: a rough downranking risk estimate
- `prediction`: expected likes, replies, reposts, clicks, bookmarks, and follows

After live posts run, create `data/performance.json` records and inspect winners with:

```bash
npm run leaderboard
```

## Customization

Edit the configuration in [src/config.ts](/Users/boat/Documents/New project/x-autopilot/src/config.ts) to change:

- niche and audience
- posting voice
- content pillars
- monetization offers
- AI disclosure

## Notes on AI generation

The current version uses a deterministic template engine so it works immediately. If you want, we can wire in an LLM next so the queue becomes more adaptive and less repetitive, but the base system already runs without extra model credentials.
