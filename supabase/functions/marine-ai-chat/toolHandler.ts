import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function handleToolCall(toolCall: ToolCall) {
  const { name, arguments: argsStr } = toolCall.function;
  const args = JSON.parse(argsStr);

  console.log(`Executing tool: ${name}`, args);

  switch (name) {
    case "search_sites":
      return await searchSites(args);
    case "get_site_details":
      return await getSiteDetails(args);
    case "compare_sites":
      return await compareSites(args);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function searchSites(args: any) {
  const { query, filters, sort_by = "overall_score", limit = 5 } = args;
  
  let supabaseQuery = supabase
    .from('wind_sites')
    .select('*');
  
  // Apply filters
  if (filters) {
    if (filters.min_capacity_factor) {
      supabaseQuery = supabaseQuery.gte('capacity_factor', filters.min_capacity_factor);
    }
    if (filters.max_water_depth) {
      supabaseQuery = supabaseQuery.lte('water_depth', filters.max_water_depth);
    }
    if (filters.environmental_impact?.length > 0) {
      supabaseQuery = supabaseQuery.in('environmental_impact', filters.environmental_impact);
    }
    if (filters.feasibility?.length > 0) {
      supabaseQuery = supabaseQuery.in('feasibility', filters.feasibility);
    }
    if (filters.countries?.length > 0) {
      // Use OR condition for country matching
      const countryFilters = filters.countries.map((c: string) => `country.ilike.%${c}%`).join(',');
      supabaseQuery = supabaseQuery.or(countryFilters);
    }
  }
  
  // Basic text search in query
  if (query) {
    const queryLower = query.toLowerCase();
    supabaseQuery = supabaseQuery.or(
      `name.ilike.%${queryLower}%,location.ilike.%${queryLower}%,country.ilike.%${queryLower}%`
    );
  }
  
  // Sort results
  switch (sort_by) {
    case "capacity_factor":
      supabaseQuery = supabaseQuery.order('capacity_factor', { ascending: false });
      break;
    case "water_depth":
      supabaseQuery = supabaseQuery.order('water_depth', { ascending: true });
      break;
    case "environmental_impact":
      supabaseQuery = supabaseQuery.order('environmental_impact', { ascending: true });
      break;
    case "overall_score":
    default:
      supabaseQuery = supabaseQuery.order('overall_score', { ascending: false });
      break;
  }
  
  // Limit results
  supabaseQuery = supabaseQuery.limit(limit);
  
  const { data: results, error } = await supabaseQuery;
  
  if (error) {
    console.error('Database query error:', error);
    return { error: 'Failed to fetch sites from database' };
  }
  
  return {
    query,
    total_found: results?.length || 0,
    sites: results?.map(site => ({
      id: site.id,
      name: site.name,
      location: site.location,
      capacity_factor: site.capacity_factor,
      water_depth: site.water_depth,
      feasibility: site.feasibility,
      environmental_impact: site.environmental_impact,
      overall_score: site.overall_score,
      estimated_capacity_mw: site.estimated_capacity,
      last_assessment: site.last_assessment,
      coordinates: site.coordinates
    })) || []
  };
}

async function getSiteDetails(args: any) {
  const { site_identifier } = args;
  
  const { data: results, error } = await supabase
    .from('wind_sites')
    .select('*')
    .or(`id.eq.${site_identifier},name.ilike.%${site_identifier}%`)
    .limit(1);
  
  if (error || !results || results.length === 0) {
    console.error('Site not found:', site_identifier, error);
    return { error: `Site not found: ${site_identifier}` };
  }
  
  const site = results[0];
  
  return {
    id: site.id,
    name: site.name,
    location: site.location,
    capacity_factor: site.capacity_factor,
    water_depth: site.water_depth,
    feasibility: site.feasibility,
    environmental_impact: site.environmental_impact,
    bird_migration_risk: site.bird_migration_risk,
    whale_migration_risk: site.whale_migration_risk,
    seafloor_impact: site.sea_floor_impact,
    overall_score: site.overall_score,
    estimated_capacity_mw: site.estimated_capacity,
    last_assessment: site.last_assessment,
    coordinates: site.coordinates,
    country: site.country
  };
}

async function compareSites(args: any) {
  const { site_identifiers, focus_criteria = [] } = args;
  
  const { data: sites, error } = await supabase
    .from('wind_sites')
    .select('*')
    .in('id', site_identifiers);
  
  if (error || !sites || sites.length === 0) {
    console.error('No sites found:', error);
    return { error: "No sites found matching the identifiers" };
  }
  
  return {
    comparison: sites.map((site: any) => ({
      id: site.id,
      name: site.name,
      location: site.location,
      capacity_factor: site.capacity_factor,
      water_depth: site.water_depth,
      feasibility: site.feasibility,
      environmental_impact: site.environmental_impact,
      bird_migration_risk: site.bird_migration_risk,
      whale_migration_risk: site.whale_migration_risk,
      overall_score: site.overall_score
    })),
    focus_criteria
  };
}
