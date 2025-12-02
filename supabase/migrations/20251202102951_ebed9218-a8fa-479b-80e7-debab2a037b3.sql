-- Create wind_sites table
CREATE TABLE public.wind_sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates DOUBLE PRECISION[] NOT NULL,
  capacity_factor INTEGER NOT NULL CHECK (capacity_factor >= 0 AND capacity_factor <= 100),
  water_depth INTEGER NOT NULL CHECK (water_depth > 0),
  feasibility TEXT NOT NULL CHECK (feasibility IN ('excellent', 'good', 'moderate', 'challenging')),
  environmental_impact TEXT NOT NULL CHECK (environmental_impact IN ('low', 'medium', 'high', 'critical')),
  bird_migration_risk TEXT NOT NULL CHECK (bird_migration_risk IN ('low', 'medium', 'high')),
  whale_migration_risk TEXT NOT NULL CHECK (whale_migration_risk IN ('low', 'medium', 'high')),
  sea_floor_impact TEXT NOT NULL CHECK (sea_floor_impact IN ('low', 'medium', 'high')),
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  last_assessment TEXT NOT NULL,
  estimated_capacity TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.wind_sites ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (this is reference data, no authentication needed)
CREATE POLICY "Wind sites are viewable by everyone"
  ON public.wind_sites
  FOR SELECT
  USING (true);

-- Create indexes for faster queries
CREATE INDEX idx_wind_sites_overall_score ON public.wind_sites(overall_score DESC);
CREATE INDEX idx_wind_sites_location ON public.wind_sites(location);
CREATE INDEX idx_wind_sites_country ON public.wind_sites(country);