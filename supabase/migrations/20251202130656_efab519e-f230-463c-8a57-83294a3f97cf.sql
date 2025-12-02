-- Add new columns for economic and infrastructure metrics
ALTER TABLE public.wind_sites
ADD COLUMN distance_to_port_km numeric,
ADD COLUMN distance_to_grid_km numeric,
ADD COLUMN nearest_project text,
ADD COLUMN indicative_lcoe_eur_mwh numeric,
ADD COLUMN capex_eur_m_per_mw numeric;