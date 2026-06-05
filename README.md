# Dishcovery — AI Recipe Sharing App

A production-ready AI recipe sharing platform built with React 18 + Vite, Supabase, and Claude AI.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS v4
- **State**: Zustand + TanStack Query v5
- **Routing**: React Router v7
- **Backend**: Supabase (Auth, DB, Storage, Edge Functions)
- **AI**: Anthropic Claude API (via Supabase Edge Functions only)
- **Deploy**: Netlify

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure `.env.local`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase setup

1. Run the SQL schema (see `README.md` → Database Schema section) in the **Supabase SQL Editor**
2. Create storage buckets: `recipe-images` (public) and `profile-avatars` (public)
3. Enable **Google OAuth** in Authentication → Providers
4. Add redirect URLs: `http://localhost:5173/feed` and your production URL

### 4. Add Anthropic API key to Supabase Vault

In Supabase → Edge Functions → Secrets:
```
ANTHROPIC_API_KEY=sk-ant-...
```

> Never put the Anthropic key in React or `.env.local`.

### 5. Deploy Edge Functions

```bash
npx supabase login
npx supabase link --project-ref your-ref
npx supabase functions deploy generate-recipe
npx supabase functions deploy score-recipe
npx supabase functions deploy adapt-recipe
npx supabase functions deploy smart-search
```

### 6. Run locally

```bash
npm run dev
```

## Database Schema

Run in Supabase SQL Editor:

```sql
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

create table user_saves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete cascade,
  is_favourite boolean default false,
  saved_at timestamptz default now(),
  unique(user_id, recipe_id)
);

create table cooked_this (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete cascade,
  cooked_at timestamptz default now(),
  unique(user_id, recipe_id)
);

create table follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  primary key(follower_id, following_id)
);

create table collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text,
  description text,
  is_public boolean default false,
  is_for_sale boolean default false,
  price decimal(10,2) default 0,
  created_at timestamptz default now()
);

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

## Features

- Google OAuth login → onboarding → personalised feed
- AI Recipe Generator (Claude Sonnet-4-6) — 3 recipes from any ingredients
- Post recipe → AI scoring (Claude Haiku-4-5) → scores cached in DB
- Recipe detail with animated SVG arc gauges for AI scores
- AI Recipe Adaptation — swap for any diet/allergen restriction
- Cook Mode — fullscreen, swipe + keyboard navigation, WakeLock API
- Smart Search — natural language parsed by AI into Supabase filters
- Save, favourite, cooked-this tracking
- User profiles with avatar upload to Supabase Storage
- Mobile responsive — masonry grid, bottom nav, collapsible sidebar
- Phase 2 placeholders: Collections, Marketplace, AI image generation
