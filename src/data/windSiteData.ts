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
}

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
