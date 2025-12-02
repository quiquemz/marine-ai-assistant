// Wind pattern data for European offshore waters
// Generates heatmap data dynamically based on wind sites from database

import type { WindSite } from './windSiteData';

export interface WindVector {
  lat: number;
  lng: number;
  intensity: number;
  direction: number;
  speed: number;
}

export interface DayWindData {
  day: string;
  date: string;
  points: [number, number, number][];
  vectors: WindVector[];
  averageScore: number;
}

const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
};

const getWindDirection = (lat: number, lng: number): number => {
  let baseDirection = 90;
  
  if (lat >= 53 && lat <= 58 && lng >= -2 && lng <= 8) {
    baseDirection = 45 + Math.random() * 30;
  } else if (lat >= 58 && lng >= 0 && lng <= 8) {
    baseDirection = 30 + Math.random() * 40;
  } else if (lng >= -10 && lng <= -2) {
    baseDirection = 80 + Math.random() * 40;
  } else if (lng >= 10 && lng <= 20) {
    baseDirection = 180 + Math.random() * 90;
  } else if (lat >= 42 && lat <= 45) {
    baseDirection = Math.random() * 360;
  }
  
  return baseDirection % 360;
};

const generateWindPattern = (
  sites: WindSite[],
  monthMultiplier: number,
  seed: number
): { points: [number, number, number][]; vectors: WindVector[] } => {
  const points: [number, number, number][] = [];
  const vectors: WindVector[] = [];
  
  const seededRandom = (x: number, y: number) => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  };
  
  for (const site of sites) {
    const [siteLat, siteLng] = site.coordinates;
    const radius = 2.5;
    const step = 0.25;
    
    for (let lat = siteLat - radius; lat <= siteLat + radius; lat += step) {
      for (let lng = siteLng - radius; lng <= siteLng + radius; lng += step) {
        const distance = getDistance(lat, lng, siteLat, siteLng);
        
        if (distance <= radius) {
          const siteStrength = site.overallScore / 100;
          const distanceFactor = 1 - (distance / radius);
          const variation = seededRandom(lat, lng) * 0.2;
          
          const baseIntensity = siteStrength * distanceFactor * (0.6 + variation);
          const intensity = baseIntensity * monthMultiplier;
          const clampedIntensity = Math.max(0.1, Math.min(1, intensity));
          
          points.push([lat, lng, clampedIntensity]);
          
          const direction = getWindDirection(lat, lng);
          const speed = clampedIntensity * 15 + 3;
          vectors.push({ lat, lng, intensity: clampedIntensity, direction, speed });
        }
      }
    }
  }
  
  return { points, vectors };
};

export const generateWindPatternData = (sites: WindSite[]): DayWindData[] => {
  if (sites.length === 0) return [];
  
  const today = new Date();
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const month1Data = generateWindPattern(sites, 0.55, 1);
  const month2Data = generateWindPattern(sites, 0.80, 2);
  const month3Data = generateWindPattern(sites, 1.15, 3);

  return [
    {
      day: 'Month 1',
      date: formatMonth(new Date(today.getFullYear(), today.getMonth() - 2, 1)),
      points: month1Data.points,
      vectors: month1Data.vectors,
      averageScore: 68
    },
    {
      day: 'Month 2',
      date: formatMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      points: month2Data.points,
      vectors: month2Data.vectors,
      averageScore: 72
    },
    {
      day: 'Month 3',
      date: formatMonth(new Date(today.getFullYear(), today.getMonth(), 1)),
      points: month3Data.points,
      vectors: month3Data.vectors,
      averageScore: 75
    }
  ];
};

export const getWindScore = (intensity: number): number => {
  return Math.round(intensity * 100);
};

export const getWindColor = (intensity: number): string => {
  if (intensity >= 0.8) return '#dc2626';
  if (intensity >= 0.65) return '#f59e0b';
  if (intensity >= 0.5) return '#eab308';
  if (intensity >= 0.35) return '#3b82f6';
  return '#6b7280';
};
