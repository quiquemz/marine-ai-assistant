export interface WindSite {
  id: string;
  name: string;
  coordinates: [number, number];
  capacityFactor: number; // 0-100%
  waterDepth: number; // meters
  feasibility: 'excellent' | 'good' | 'moderate' | 'challenging';
  environmentalImpact: 'low' | 'medium' | 'high' | 'critical';
  birdMigrationRisk: 'low' | 'medium' | 'high';
  whaleMigrationRisk: 'low' | 'medium' | 'high';
  seaFloorImpact: 'low' | 'medium' | 'high';
  overallScore: number; // 0-100
  lastAssessment: string;
  estimatedCapacity: string; // MW
  country: string;
  distanceToPortKm?: number;
  distanceToGridKm?: number;
  capexEurMPerMw?: number;
}

export interface FeasibilityBreakdown {
  depthScore: number;
  portDistanceScore: number;
  gridDistanceScore: number;
  capexScore: number;
  environmentalScore: number;
  totalScore: number;
}

export const calculateFeasibilityBreakdown = (site: WindSite): FeasibilityBreakdown => {
  // Water Depth Score (25%): 100 if ≤30m, scales to 0 at 150m
  const depthScore = Math.round(Math.max(0, Math.min(100, 100 - ((site.waterDepth - 30) * 100 / 120))));
  
  // Distance to Port Score (20%): 100 if ≤20km, scales to 0 at 200km
  const portDistanceScore = Math.round(Math.max(0, Math.min(100, 100 - (((site.distanceToPortKm ?? 100) - 20) * 100 / 180))));
  
  // Distance to Grid Score (20%): 100 if ≤20km, scales to 0 at 200km
  const gridDistanceScore = Math.round(Math.max(0, Math.min(100, 100 - (((site.distanceToGridKm ?? 100) - 20) * 100 / 180))));
  
  // CAPEX Score (15%): 100 if ≤3.0, scales to 0 at 5.0
  const capexScore = Math.round(Math.max(0, Math.min(100, 100 - (((site.capexEurMPerMw ?? 4.0) - 3.0) * 100 / 2.0))));
  
  // Environmental Score (20%): low=100, medium=66, high=33, critical=0
  const envMap: Record<string, number> = { low: 100, medium: 66, high: 33, critical: 0 };
  const environmentalScore = envMap[site.environmentalImpact] ?? 50;
  
  const totalScore = Math.round(
    depthScore * 0.25 +
    portDistanceScore * 0.20 +
    gridDistanceScore * 0.20 +
    capexScore * 0.15 +
    environmentalScore * 0.20
  );
  
  return { depthScore, portDistanceScore, gridDistanceScore, capexScore, environmentalScore, totalScore };
};

export const getFeasibilityColor = (feasibility: WindSite['feasibility']): string => {
  switch (feasibility) {
    case 'excellent': return '#10b981'; // green
    case 'good': return '#3b82f6'; // blue
    case 'moderate': return '#f59e0b'; // orange
    case 'challenging': return '#ef4444'; // red
    default: return '#6b7280'; // gray
  }
};

export const getEnvironmentalColor = (impact: WindSite['environmentalImpact']): string => {
  switch (impact) {
    case 'low': return '#10b981'; // green
    case 'medium': return '#f59e0b'; // orange
    case 'high': return '#ef4444'; // red
    case 'critical': return '#dc2626'; // dark red
    default: return '#6b7280'; // gray
  }
};
