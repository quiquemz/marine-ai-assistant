import { windSites } from "./mockData.ts";

interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

export async function handleToolCall(toolCall: ToolCall) {
  const { name, arguments: argsStr } = toolCall.function;
  const args = JSON.parse(argsStr);

  console.log(`Executing tool: ${name}`, args);

  switch (name) {
    case "search_sites":
      return searchSites(args);
    case "get_site_details":
      return getSiteDetails(args);
    case "compare_sites":
      return compareSites(args);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function searchSites(args: any) {
  const { query, filters, sort_by = "overall_score", limit = 5 } = args;
  
  let results = [...windSites];
  
  // Apply filters
  if (filters) {
    if (filters.min_capacity_factor) {
      results = results.filter(site => site.capacityFactor >= filters.min_capacity_factor);
    }
    if (filters.max_water_depth) {
      results = results.filter(site => site.waterDepth <= filters.max_water_depth);
    }
    if (filters.environmental_impact?.length > 0) {
      results = results.filter(site => filters.environmental_impact.includes(site.environmentalImpact));
    }
    if (filters.feasibility?.length > 0) {
      results = results.filter(site => filters.feasibility.includes(site.feasibility));
    }
    if (filters.countries?.length > 0) {
      results = results.filter(site => 
        filters.countries.some((country: string) => 
          site.location.toLowerCase().includes(country.toLowerCase())
        )
      );
    }
  }
  
  // Basic text search in query
  if (query) {
    const queryLower = query.toLowerCase();
    results = results.filter(site => 
      site.name.toLowerCase().includes(queryLower) ||
      site.location.toLowerCase().includes(queryLower) ||
      site.description.toLowerCase().includes(queryLower)
    );
  }
  
  // Sort results
  switch (sort_by) {
    case "capacity_factor":
      results.sort((a, b) => b.capacityFactor - a.capacityFactor);
      break;
    case "water_depth":
      results.sort((a, b) => a.waterDepth - b.waterDepth);
      break;
    case "environmental_impact":
      const impactOrder: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
      results.sort((a, b) => impactOrder[a.environmentalImpact] - impactOrder[b.environmentalImpact]);
      break;
    case "overall_score":
    default:
      results.sort((a, b) => b.overallScore - a.overallScore);
      break;
  }
  
  // Limit results
  results = results.slice(0, limit);
  
  return {
    query,
    total_found: results.length,
    sites: results.map(site => ({
      id: site.id,
      name: site.name,
      location: site.location,
      capacity_factor: site.capacityFactor,
      water_depth: site.waterDepth,
      feasibility: site.feasibility,
      environmental_impact: site.environmentalImpact,
      overall_score: site.overallScore,
      estimated_capacity_mw: site.estimatedCapacity,
      coordinates: site.coordinates
    }))
  };
}

function getSiteDetails(args: any) {
  const { site_identifier } = args;
  
  const site = windSites.find(s => 
    s.id === site_identifier || 
    s.name.toLowerCase().includes(site_identifier.toLowerCase())
  );
  
  if (!site) {
    return { error: `Site not found: ${site_identifier}` };
  }
  
  return {
    id: site.id,
    name: site.name,
    location: site.location,
    description: site.description,
    capacity_factor: site.capacityFactor,
    water_depth: site.waterDepth,
    feasibility: site.feasibility,
    environmental_impact: site.environmentalImpact,
    bird_migration_risk: site.birdMigrationRisk,
    whale_migration_risk: site.whaleMigrationRisk,
    seafloor_impact: site.seaFloorImpact,
    overall_score: site.overallScore,
    estimated_capacity_mw: site.estimatedCapacity,
    coordinates: site.coordinates
  };
}

function compareSites(args: any) {
  const { site_identifiers, focus_criteria = [] } = args;
  
  const sites = site_identifiers
    .map((identifier: string) => 
      windSites.find(s => 
        s.id === identifier || 
        s.name.toLowerCase().includes(identifier.toLowerCase())
      )
    )
    .filter((s: any) => s !== undefined);
  
  if (sites.length === 0) {
    return { error: "No sites found matching the identifiers" };
  }
  
  return {
    comparison: sites.map((site: any) => ({
      id: site.id,
      name: site.name,
      location: site.location,
      capacity_factor: site.capacityFactor,
      water_depth: site.waterDepth,
      feasibility: site.feasibility,
      environmental_impact: site.environmentalImpact,
      bird_migration_risk: site.birdMigrationRisk,
      whale_migration_risk: site.whaleMigrationRisk,
      overall_score: site.overallScore
    })),
    focus_criteria
  };
}
