# Floating Offshore Wind Planning Copilot

An AI-powered decision support tool for planning floating offshore wind farms across European seas. It helps energy developers, planners, and environmental analysts identify **low-conflict, high-potential** sites by combining real data on water depth, wind capacity, grid proximity, port access, CAPEX estimates, and environmental risk factors (whale/bird migration, seafloor impact).

### Key Features

- 🗺️ **Interactive Site Map** — Explore 1,000+ candidate sites across European waters with colour-coded feasibility markers and heatmap overlays for wind patterns, depth, and marine activity.
- 🤖 **AI Chat Copilot** — Ask natural-language questions about sites, compare locations, and get data-driven recommendations powered by Gemini.
- 📊 **Priority Panel** — Rank and filter sites by overall score, capacity factor, feasibility, and environmental impact.
- 🎯 **Feasibility Breakdown** — Hover over any feasibility rating to see weighted component scores (depth, distance to port/grid, CAPEX, environmental).
- 🌊 **Marine & Environmental Data** — Visualise whale migration corridors, bird flyways, shipping lanes, and protected areas.

### Tech Stack

- **Frontend:** React · TypeScript · Vite · Tailwind CSS · shadcn/ui · Leaflet
- **Backend:** Lovable Cloud (Supabase) · Edge Functions
- **AI:** Google Gemini via Lovable AI

---

**URL**: https://lovable.dev/projects/ac81818a-e5f4-4926-babf-ff96d4f3adaa

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ac81818a-e5f4-4926-babf-ff96d4f3adaa) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ac81818a-e5f4-4926-babf-ff96d4f3adaa) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
