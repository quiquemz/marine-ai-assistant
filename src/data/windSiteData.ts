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

// Sample European offshore wind site data
export const windSiteData: WindSite[] = [
  {
    id: 'site-1',
    name: 'North Sea - Dogger Bank Extension',
    coordinates: [55.5, 2.0],
    capacityFactor: 52,
    waterDepth: 45,
    feasibility: 'excellent',
    environmentalImpact: 'low',
    birdMigrationRisk: 'low',
    whaleMigrationRisk: 'low',
    seaFloorImpact: 'low',
    overallScore: 92,
    lastAssessment: '2024-01',
    estimatedCapacity: '3,600 MW',
    country: 'UK'
  },
  {
    id: 'site-2',
    name: 'Celtic Sea - South West',
    coordinates: [50.0, -6.5],
    capacityFactor: 48,
    waterDepth: 75,
    feasibility: 'good',
    environmentalImpact: 'medium',
    birdMigrationRisk: 'medium',
    whaleMigrationRisk: 'medium',
    seaFloorImpact: 'low',
    overallScore: 78,
    lastAssessment: '2024-02',
    estimatedCapacity: '2,400 MW',
    country: 'UK'
  },
  {
    id: 'site-3',
    name: 'Bay of Biscay - Floating Zone',
    coordinates: [44.5, -2.0],
    capacityFactor: 45,
    waterDepth: 120,
    feasibility: 'good',
    environmentalImpact: 'medium',
    birdMigrationRisk: 'low',
    whaleMigrationRisk: 'high',
    seaFloorImpact: 'low',
    overallScore: 72,
    lastAssessment: '2024-01',
    estimatedCapacity: '1,800 MW',
    country: 'France'
  },
  {
    id: 'site-4',
    name: 'Norwegian Sea - Sørlige Nordsjø II',
    coordinates: [59.0, 3.5],
    capacityFactor: 55,
    waterDepth: 85,
    feasibility: 'excellent',
    environmentalImpact: 'low',
    birdMigrationRisk: 'low',
    whaleMigrationRisk: 'low',
    seaFloorImpact: 'low',
    overallScore: 95,
    lastAssessment: '2024-02',
    estimatedCapacity: '4,500 MW',
    country: 'Norway'
  },
  {
    id: 'site-5',
    name: 'Baltic Sea - Swedish Exclusive Zone',
    coordinates: [57.5, 19.0],
    capacityFactor: 38,
    waterDepth: 55,
    feasibility: 'moderate',
    environmentalImpact: 'medium',
    birdMigrationRisk: 'high',
    whaleMigrationRisk: 'low',
    seaFloorImpact: 'medium',
    overallScore: 65,
    lastAssessment: '2023-12',
    estimatedCapacity: '1,200 MW',
    country: 'Sweden'
  },
  {
    id: 'site-6',
    name: 'Mediterranean - Gulf of Lion',
    coordinates: [42.5, 4.0],
    capacityFactor: 40,
    waterDepth: 95,
    feasibility: 'good',
    environmentalImpact: 'high',
    birdMigrationRisk: 'medium',
    whaleMigrationRisk: 'medium',
    seaFloorImpact: 'medium',
    overallScore: 58,
    lastAssessment: '2024-01',
    estimatedCapacity: '900 MW',
    country: 'France'
  },
  {
    id: 'site-7',
    name: 'Irish Sea - East Irish Coast',
    coordinates: [53.5, -5.0],
    capacityFactor: 47,
    waterDepth: 68,
    feasibility: 'good',
    environmentalImpact: 'medium',
    birdMigrationRisk: 'medium',
    whaleMigrationRisk: 'low',
    seaFloorImpact: 'low',
    overallScore: 76,
    lastAssessment: '2024-02',
    estimatedCapacity: '2,100 MW',
    country: 'Ireland'
  },
  {
    id: 'site-8',
    name: 'German Bight - N-7.2',
    coordinates: [54.5, 7.0],
    capacityFactor: 49,
    waterDepth: 42,
    feasibility: 'excellent',
    environmentalImpact: 'low',
    birdMigrationRisk: 'low',
    whaleMigrationRisk: 'low',
    seaFloorImpact: 'low',
    overallScore: 88,
    lastAssessment: '2024-03',
    estimatedCapacity: '3,000 MW',
    country: 'Germany'
  }
];

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

export const getPrioritySites = (): WindSite[] => {
  return windSiteData
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 3);
};
