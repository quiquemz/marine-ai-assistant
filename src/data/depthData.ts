// Sea depth data for European offshore waters
// Generates heatmap data dynamically based on wind sites from database

import type { WindSite } from './windSiteData';

export interface DepthDataPoint {
  lat: number;
  lng: number;
  depth: number;
  intensity: number;
}

const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
};

const depthToIntensity = (depth: number): number => {
  const maxDepth = 150;
  const normalized = Math.min(depth / maxDepth, 1);
  return normalized;
};

export const generateDepthData = (sites: WindSite[]): [number, number, number][] => {
  const points: [number, number, number][] = [];
  
  for (const site of sites) {
    const [siteLat, siteLng] = site.coordinates;
    const radius = 2.5;
    const step = 0.25;
    
    for (let lat = siteLat - radius; lat <= siteLat + radius; lat += step) {
      for (let lng = siteLng - radius; lng <= siteLng + radius; lng += step) {
        const distance = getDistance(lat, lng, siteLat, siteLng);
        
        if (distance <= radius) {
          const baseDepth = site.waterDepth;
          const distanceFactor = distance / radius;
          const variation = (Math.random() - 0.5) * 25;
          const depth = Math.max(20, baseDepth + variation + distanceFactor * 15);
          
          const falloff = 1 - (distance / radius) * 0.3;
          const intensity = depthToIntensity(depth) * falloff;
          
          points.push([lat, lng, intensity]);
        }
      }
    }
  }
  
  return points;
};

export const getDepthColor = (intensity: number): string => {
  if (intensity >= 0.8) return '#1e3a5f';
  if (intensity >= 0.6) return '#1e4d8c';
  if (intensity >= 0.4) return '#2563eb';
  if (intensity >= 0.2) return '#60a5fa';
  return '#93c5fd';
};

export const depthGradient = {
  0.0: '#dbeafe',
  0.2: '#93c5fd',
  0.4: '#60a5fa',
  0.6: '#2563eb',
  0.8: '#1e40af',
  1.0: '#1e3a5f'
};
