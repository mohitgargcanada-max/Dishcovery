# 🍽️ Dishcovery — Team Guide v5.0

> AI-powered recipe sharing platform. Discover. Cook. Share.
> **Live:** https://dishcoveryai.netlify.app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| State | Zustand + TanStack Query v5 |
| Routing | React Router v7 |
| Backend | Supabase (Auth, DB, Storage, Edge Functions) |
| AI — Recipes | Anthropic Claude API (Sonnet-4-6 + Haiku-4-5) |
| AI — Images | Fal.ai Flux Dev + Unsplash API |
| Deploy | Netlify (GitHub auto-deploy) |

---

## Quick Start

### 1. Clone & install
```bash
git clone https://github.com/mohitgargcanada-max/Dishcovery.git
cd Dishcovery
npm install
```

### 2. Environment variables — `.env.local`
```env
VITE_SUPABASE_URL=https://ytghphikvwakwlylkquy.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase setup
1. Run full SQL schema (see section below) in **SQL Editor**
2. Create storage buckets: `recipe-images` (public), `profile-avatars` (public)
3. Enable **Google OAuth** → Authentication → Providers
4. Add redirect URLs:
   - `http://localhost:5173/feed`
   - `https://dishcoveryai.netlify.app/feed`
5. Add Google OAuth callback to Google Cloud Console:
   - `https://ytghphikvwakwlylkquy.supabase.co/auth/v1/callback`

### 4. Supabase secrets (Edge Functions → Secrets)
```bash
npx supabase login
npx supabase link --project-ref ytghphikvwakwlylkquy
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
npx supabase secrets set FAL_API_KEY=your-fal-key
npx supabase secrets set UNSPLASH_ACCESS_KEY=your-unsplash-key
```
> ⚠️ Never put these keys in `.env.local` or any React file.

### 5. Deploy all Edge Functions
```bash
npx supabase functions deploy generate-recipe
npx supabase functions deploy score-recipe
npx supabase functions deploy adapt-recipe
npx supabase functions deploy smart-search
npx supabase functions deploy generate-image
npx supabase functions deploy get-recipe-image
npx supabase functions deploy seed-images --no-verify-jwt
```

### 6. Seed recipe images (run once after DB setup)
```bash
curl -X POST https://ytghphikvwakwlylkquy.supabase.co/functions/v1/seed-images
```

### 7. Run locally
```bash
npm run dev
```

### 8. Deploy to Netlify
Push to `main` → Netlify auto-deploys. Set env vars in Netlify → Site Settings → Environment Variables.

---

## Edge Functions

| Function | Model | Purpose |
|----------|-------|---------|
| `generate-recipe` | Claude Sonnet-4-6 | Generate 1–3 recipes from ingredients or NL query |
| `score-recipe` | Claude Haiku-4-5 | Score nutrition, difficulty, authenticity + detect allergens |
| `adapt-recipe` | Claude Sonnet-4-6 | Adapt recipe for dietary requirement |
| `smart-search` | Claude Haiku-4-5 | Parse NL search into structured filters |
| `generate-image` | Claude + Fal.ai Flux Dev | Generate AI food photo from recipe title |
| `get-recipe-image` | Unsplash API | Fetch accurate food photo by recipe title |
| `seed-images` | Unsplash API | Bulk-update all recipes with correct photos |

> All functions handle the `ANTHROPIC_API_KEY` trailing-space bug via:
> `(Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY '))?.trim()`

---

## Features — v5.0

### 🔐 Auth
- Google OAuth only — redirects to `/onboarding` on first login
- 4-step onboarding: cuisine preferences, dietary preferences, allergens
- Edit preferences anytime from Profile page (gear icon)

### 📰 Feed
- Masonry grid (3 col desktop, 1 col mobile)
- **Trending** tab — sorted by save count
- **For You** tab — strict diet + cuisine filtering based on user profile
- Infinite scroll with skeleton loaders
- Community Cooks bar — horizontal scrollable user avatars

### 🤖 AI Recipe Generator
- **By Ingredients** mode — add chips (Enter, comma, or blur to add)
- **Ask Naturally** mode — type `"vegan dinner with chickpeas, no nuts"`
- Auto-generates after 15s pause OR press **🧑‍🍳 Dishcover It!**
- Detects recipe count from NL: `"give me 1 recipe"` → generates 1
- Each saved recipe auto-gets Unsplash image stored in DB

### 📝 Post Recipe
- 3-step wizard: Details → Recipe → Media
- **Step 1 validation**: title must look like a dish name, description mandatory (5+ words)
- **Spam checker**: rejects gibberish, repeated chars, non-food entries
- **Step 2**: ingredient list + numbered steps (min 8 chars each)
- **Step 3**: upload photo OR generate AI photo (Fal.ai Flux Dev)
- On submit: uploads photo → inserts recipe → AI scores it → fetches Unsplash image
- AI score shown: `✨ AI Analysis Complete`

### 🔍 Search
- Live tag suggestions as user types (diet, cuisine, allergen chips)
- Popular filter pills when search is empty
- Keyword search across title + description + cuisine
- Tag chips: stackable, removable, color-coded by type
- Allergen filter skipped on keyword search (shows all + warns on cards)
- User dietary preferences auto-applied when browsing (no keyword)

### 🍳 Recipe Detail
- Hero image (Unsplash/TheMealDB/user upload)
- AI Score cards with animated SVG arc gauges
- **Steps to Burn** — calculates steps needed to walk off calories
- Allergen warnings above ingredients
- **Save**, **Cooked This**, **✨ Adapt**, **Cook Mode**, **Share**
- Share: native share sheet (mobile) / WhatsApp, Twitter/X, Facebook, Copy Link

### 🥘 Cook Mode
- Full-screen black overlay
- Swipe left/right or arrow keys to navigate steps
- WakeLock API — screen stays on
- Slide-up ingredients panel with backdrop blur

### ✨ AI Adapt
- Pick a dietary style → Claude adapts the full recipe
- Shows what changed and why
- Adapted version shown inline with reset option

### 👤 Profile
- Avatar upload to Supabase Storage
- Edit dietary preferences + allergens anytime
- Recipe grid + Collections tab (Phase 2)
- Follower / following counts

### 🖼️ Images (v5 — fully resolved)
- New recipes → Unsplash API auto-fetches correct image on save
- Existing recipes → `seed-images` function bulk-updates via Unsplash
- User uploads → stored in Supabase Storage (always trusted)
- Fal.ai generate → available in PostRecipe Step 3 (explicit)
- Fallback → cuisine-specific pool (varied by recipe UUID hash)

---

## Project Structure

```
dishcovery/
├── supabase/functions/
│   ├── generate-recipe/     Claude Sonnet — recipe generation
│   ├── score-recipe/        Claude Haiku — AI scoring
│   ├── adapt-recipe/        Claude Sonnet — diet adaptation
│   ├── smart-search/        Claude Haiku — NL search parsing
│   ├── generate-image/      Claude + Fal.ai — AI photo generation
│   ├── get-recipe-image/    Unsplash — auto photo on save
│   └── seed-images/         Unsplash — bulk photo seeding
├── src/
│   ├── lib/
│   │   ├── supabase.js      Client + Google OAuth
│   │   └── api.js           All edge function calls
│   ├── store/
│   │   ├── authStore.js     User + profile state
│   │   └── uiStore.js       Toasts
│   ├── hooks/
│   │   ├── useRecipes.js    Feed with diet filtering
│   │   ├── useRecipe.js     Single recipe
│   │   ├── useProfile.js    Profile by username or UUID
│   │   ├── useSaves.js      Save/unsave with optimistic UI
│   │   └── useRecipeImage.js Smart image with TheMealDB + fallback
│   ├── utils/
│   │   ├── constants.js     Cuisines, diet tags, allergens
│   │   ├── helpers.js       formatTime, timeAgo, scoreColor
│   │   ├── cuisinePhotos.js Verified cuisine image pools
│   │   └── recipeImageLookup.js TheMealDB + cuisine fallback
│   ├── pages/               Landing, Feed, RecipeDetail, CookMode,
│   │                        Generate, PostRecipe, Search, Profile,
│   │                        Saved, Onboarding
│   └── components/
│       ├── layout/          Navbar, Sidebar, BottomNav
│       ├── recipe/          RecipeCard, RecipeGrid, AIScoreCard, AdaptModal
│       ├── forms/PostForm/  3-step wizard with validation
│       └── ui/              ArcGauge, ChipInput, StepsBurner,
│                            ShareButton, EmptyState, ErrorBoundary
```

---

## Database Schema

```sql
-- profiles
create table profiles (
  id uuid references auth.users primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  taste_profile jsonb default '{}',
  allergens text[] default '{}',
  created_at timestamptz default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- recipes
create table recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  ingredients jsonb not null default '[]',
  steps jsonb not null default '[]',
  cuisine_type text,
  serving_size int default 2,
  prep_time int,
  cook_time int,
  photo_url text,
  allergens text[] default '{}',
  ai_nutrition_score int,
  ai_difficulty_score int,
  ai_authenticity_score int,
  ai_calories_per_serving int,
  ai_diet_tags text[] default '{}',
  save_count int default 0,
  cooked_count int default 0,
  is_published boolean default true,
  is_premium boolean default false,
  price decimal(10,2) default 0,
  created_at timestamptz default now()
);

-- user_saves
create table user_saves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete cascade,
  is_favourite boolean default false,
  saved_at timestamptz default now(),
  unique(user_id, recipe_id)
);

-- cooked_this
create table cooked_this (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete cascade,
  cooked_at timestamptz default now(),
  unique(user_id, recipe_id)
);

-- follows
create table follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  primary key(follower_id, following_id)
);

-- collections (Phase 2)
create table collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text, description text,
  is_public boolean default false,
  is_for_sale boolean default false,
  price decimal(10,2) default 0,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table recipes enable row level security;
alter table user_saves enable row level security;
alter table cooked_this enable row level security;
alter table follows enable row level security;

create policy "Public profiles readable" on profiles for select using (true);
create policy "Own profile editable" on profiles for update using (auth.uid() = id);
create policy "Published recipes readable by all" on recipes for select using (is_published = true);
create policy "Own recipes full access" on recipes for all using (auth.uid() = user_id);
create policy "Own saves readable" on user_saves for all using (auth.uid() = user_id);
create policy "Own cooked readable" on cooked_this for all using (auth.uid() = user_id);
create policy "Follows readable" on follows for select using (true);
create policy "Own follows editable" on follows for all using (auth.uid() = follower_id);
```

---

## Known Issues & Notes

| Issue | Status | Notes |
|-------|--------|-------|
| `ANTHROPIC_API_KEY` has trailing space in Supabase | ✅ Handled | All functions use `?.trim()` workaround |
| Netlify cache serving stale JS | ✅ Fixed | `netlify.toml` — no-cache for `index.html` |
| Build breaks silently on Netlify | ✅ Fixed | Always run `npm run build` before pushing |
| Unsplash API rate limit | ⚠️ 50 req/hour | Seed function adds 1.5s delay between calls |
| Phase 2 placeholders | 🔜 | Collections, Marketplace, AI image gen button in PostRecipe |

---

## API Keys Required

| Service | Where to get | Stored in |
|---------|-------------|-----------|
| Anthropic | console.anthropic.com | Supabase Secrets |
| Fal.ai | fal.ai/dashboard/keys | Supabase Secrets |
| Unsplash | unsplash.com/oauth/applications | Supabase Secrets |
| Supabase | supabase.com/dashboard | `.env.local` |

---

## Changelog

### v5.0 — Current
- Unsplash API integration for auto-correct recipe images
- `seed-images` + `get-recipe-image` edge functions
- Auto-image on every new recipe save
- Search tag suggestions (diet/cuisine/allergen chips)
- Social sharing (WhatsApp, Twitter/X, Facebook, copy link)
- Community Cooks bar in Feed
- Steps-to-burn calculator on Recipe Detail
- Adapt Recipe fixed (JSON extraction + status 200 errors)
- Build fixed (Twitter icon → lucide-react missing export)
- Netlify cache headers fixed

### v4.0
- AI Recipe Generator: NL mode + auto-generate on typing
- Dynamic recipe count from NL query
- Funky "🧑‍🍳 Dishcover It!" button
- PostForm: mandatory description + spam/junk checker
- ChipInput: blur-to-add ingredients
- Diet-aware strict filtering in Feed + Search
- Profile: editable dietary preferences modal
- Error boundary for blank screen crashes

### v3.0
- Fal.ai Flux Dev image generation with Claude-crafted prompts
- Cook Mode: WakeLock, swipe, keyboard nav
- AI Adapt Recipe modal
- ArcGauge animated SVG scores
- AllergenBadge warnings on cards
- CookMode slide-up ingredients panel

### v2.0
- 30 seed recipes via SQL
- Onboarding 4-step flow
- Infinite scroll feed
- Save/favourite/cooked-this
- Profile with avatar upload
- Masonry grid layout

### v1.0
- Initial build: full stack setup
- Google OAuth + Supabase
- All 4 AI edge functions
- Complete routing + pages
