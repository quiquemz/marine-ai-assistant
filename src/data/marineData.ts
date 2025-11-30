export interface MarineLitterHotspot {
  id: string;
  name: string;
  coordinates: [number, number];
  density: 'low' | 'medium' | 'high' | 'critical';
  debrisType: string[];
  accessibility: 'easy' | 'moderate' | 'difficult';
  impactScore: number;
  lastSurvey: string;
  estimatedVolume: string;
}

export const marineLitterData: MarineLitterHotspot[] = [
  {
    id: 'hs-001',
    name: 'Marina Bay Beach',
    coordinates: [1.2644, 103.8540],
    density: 'critical',
    debrisType: ['plastics', 'microplastics', 'fishing gear'],
    accessibility: 'easy',
    impactScore: 95,
    lastSurvey: '2025-01-15',
    estimatedVolume: '850 kg'
  },
  {
    id: 'hs-002',
    name: 'East Coast Mangroves',
    coordinates: [1.3012, 103.9275],
    density: 'high',
    debrisType: ['plastics', 'metals', 'mixed'],
    accessibility: 'moderate',
    impactScore: 82,
    lastSurvey: '2025-01-20',
    estimatedVolume: '620 kg'
  },
  {
    id: 'hs-003',
    name: 'Sentosa Beach North',
    coordinates: [1.2494, 103.8303],
    density: 'high',
    debrisType: ['plastics', 'organic', 'glass'],
    accessibility: 'easy',
    impactScore: 78,
    lastSurvey: '2025-01-18',
    estimatedVolume: '540 kg'
  },
  {
    id: 'hs-004',
    name: 'Changi Coastal Walk',
    coordinates: [1.3912, 103.9892],
    density: 'medium',
    debrisType: ['plastics', 'textiles'],
    accessibility: 'easy',
    impactScore: 65,
    lastSurvey: '2025-01-22',
    estimatedVolume: '380 kg'
  },
  {
    id: 'hs-005',
    name: 'Pulau Ubin Shore',
    coordinates: [1.4165, 103.9608],
    density: 'high',
    debrisType: ['fishing gear', 'plastics', 'metals'],
    accessibility: 'difficult',
    impactScore: 88,
    lastSurvey: '2025-01-10',
    estimatedVolume: '720 kg'
  },
  {
    id: 'hs-006',
    name: 'West Coast Park Beach',
    coordinates: [1.2933, 103.7539],
    density: 'medium',
    debrisType: ['plastics', 'paper', 'mixed'],
    accessibility: 'easy',
    impactScore: 58,
    lastSurvey: '2025-01-25',
    estimatedVolume: '290 kg'
  },
  {
    id: 'hs-007',
    name: 'Labrador Nature Reserve Coast',
    coordinates: [1.2721, 103.8025],
    density: 'low',
    debrisType: ['plastics', 'organic'],
    accessibility: 'moderate',
    impactScore: 42,
    lastSurvey: '2025-01-28',
    estimatedVolume: '180 kg'
  },
  {
    id: 'hs-008',
    name: 'Coney Island Beach',
    coordinates: [1.4137, 103.9285],
    density: 'critical',
    debrisType: ['plastics', 'fishing gear', 'microplastics', 'metals'],
    accessibility: 'difficult',
    impactScore: 92,
    lastSurvey: '2025-01-12',
    estimatedVolume: '980 kg'
  }
];

export const getDensityColor = (density: MarineLitterHotspot['density']): string => {
  switch (density) {
    case 'critical':
      return '#dc2626'; // red
    case 'high':
      return '#ea580c'; // orange
    case 'medium':
      return '#eab308'; // yellow
    case 'low':
      return '#22c55e'; // green
  }
};

export const getPriorityHotspots = (): MarineLitterHotspot[] => {
  return marineLitterData
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 3);
};