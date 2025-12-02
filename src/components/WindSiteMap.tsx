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
}

const WindSiteMap = ({ onSiteSelect }: WindSiteMapProps) => {
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

    // Add markers for each wind site
    windSites.forEach((site) => {
      const color = getFeasibilityColor(site.feasibility);
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(site.coordinates, { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 280px;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1e293b;">
              ${site.name}
            </h3>
            <div style="display: grid; gap: 6px; font-size: 14px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Country:</span>
                <span style="font-weight: 600;">${site.country}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Capacity Factor:</span>
                <span style="font-weight: 600; color: #059669;">${site.capacityFactor}%</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Water Depth:</span>
                <span style="font-weight: 600;">${site.waterDepth}m</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Feasibility:</span>
                <span style="font-weight: 600; text-transform: capitalize;">${site.feasibility}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Environmental Impact:</span>
                <span style="font-weight: 600; text-transform: capitalize;">${site.environmentalImpact}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Overall Score:</span>
                <span style="font-weight: 600; color: #0891b2;">${site.overallScore}/100</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Est. Capacity:</span>
                <span style="font-weight: 600;">${site.estimatedCapacity}</span>
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                <div style="font-size: 13px; color: #64748b;">Environmental Risks:</div>
                <div style="display: grid; gap: 4px; margin-top: 4px; font-size: 13px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>Bird Migration:</span>
                    <span style="text-transform: capitalize;">${site.birdMigrationRisk}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>Whale Migration:</span>
                    <span style="text-transform: capitalize;">${site.whaleMigrationRisk}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>Seafloor Impact:</span>
                    <span style="text-transform: capitalize;">${site.seaFloorImpact}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSiteSelect) {
          onSiteSelect(site);
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [windSites, onSiteSelect]);

  return (
    <Card className="h-full overflow-hidden">
      <div ref={mapContainerRef} className="h-full w-full" />
    </Card>
  );
};

export default WindSiteMap;
