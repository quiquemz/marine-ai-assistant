import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getFeasibilityColor, type WindSite } from '@/data/windSiteData';
import { Card } from './ui/card';
import { supabase } from '@/integrations/supabase/client';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface WindSiteMapProps {
  onSiteSelect?: (site: WindSite) => void;
  highlightedSiteIds?: string[];
}

const WindSiteMap = ({ onSiteSelect, highlightedSiteIds = [] }: WindSiteMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [windSites, setWindSites] = useState<WindSite[]>([]);

  useEffect(() => {
    const fetchWindSites = async () => {
      const { data, error } = await supabase
        .from('wind_sites')
        .select('*')
        .order('overall_score', { ascending: false });
      
      if (error) {
        console.error('Error fetching wind sites:', error);
        return;
      }
      
      // Transform database format to WindSite format
      const sites: WindSite[] = data.map(site => ({
        id: site.id,
        name: site.name,
        coordinates: site.coordinates as [number, number],
        capacityFactor: site.capacity_factor,
        waterDepth: site.water_depth,
        feasibility: site.feasibility as 'excellent' | 'good' | 'moderate' | 'challenging',
        environmentalImpact: site.environmental_impact as 'low' | 'medium' | 'high' | 'critical',
        birdMigrationRisk: site.bird_migration_risk as 'low' | 'medium' | 'high',
        whaleMigrationRisk: site.whale_migration_risk as 'low' | 'medium' | 'high',
        seaFloorImpact: site.sea_floor_impact as 'low' | 'medium' | 'high',
        overallScore: site.overall_score,
        lastAssessment: site.last_assessment,
        estimatedCapacity: site.estimated_capacity,
        country: site.country
      }));
      
      setWindSites(sites);
    };
    
    fetchWindSites();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || windSites.length === 0) return;

    // Initialize map centered on European seas
    const map = L.map(mapContainerRef.current).setView([54.0, 3.0], 5);
    mapRef.current = map;

    // Add minimalistic tile layer with clear water emphasis
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [windSites]);

  // Update markers when sites or highlighted IDs change
  useEffect(() => {
    if (!mapRef.current || windSites.length === 0) return;

    const map = mapRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each wind site
    windSites.forEach((site) => {
      const color = getFeasibilityColor(site.feasibility);
      const isHighlighted = highlightedSiteIds.includes(site.id);
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${color};
          width: ${isHighlighted ? '32px' : '24px'};
          height: ${isHighlighted ? '32px' : '24px'};
          border-radius: 50%;
          border: ${isHighlighted ? '4px solid #f59e0b' : '3px solid white'};
          box-shadow: ${isHighlighted ? '0 0 20px rgba(245, 158, 11, 0.6), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.3)'};
          transition: all 0.3s ease;
          ${isHighlighted ? 'animation: pulse 2s ease-in-out infinite;' : ''}
        "></div>
        ${isHighlighted ? `<style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        </style>` : ''}`,
        iconSize: [isHighlighted ? 32 : 24, isHighlighted ? 32 : 24],
        iconAnchor: [isHighlighted ? 16 : 12, isHighlighted ? 16 : 12],
      });

      const marker = L.marker(site.coordinates, { icon: customIcon })
        .addTo(map)
        .bindPopup(`
...
        `);

      marker.on('click', () => {
        if (onSiteSelect) {
          onSiteSelect(site);
        }
      });

      // Auto-open popup for highlighted sites
      if (isHighlighted) {
        marker.openPopup();
      }
    });
  }, [windSites, onSiteSelect, highlightedSiteIds]);

  return (
    <Card className="h-full overflow-hidden">
      <div ref={mapContainerRef} className="h-full w-full" />
    </Card>
  );
};

export default WindSiteMap;
