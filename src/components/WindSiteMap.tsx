import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { getFeasibilityColor, type WindSite } from '@/data/windSiteData';
import { generateWindPatternData } from '@/data/windPatternData';
import { generateDepthData, depthGradient } from '@/data/depthData';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ChevronLeft, ChevronRight, Wind, Waves } from 'lucide-react';
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
  selectedSiteId?: string;
}

const WindSiteMap = ({ onSiteSelect, highlightedSiteIds = [], selectedSiteId }: WindSiteMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const heatLayerRef = useRef<any>(null);
  const depthLayerRef = useRef<any>(null);
  const [windSites, setWindSites] = useState<WindSite[]>([]);
  const [allSites, setAllSites] = useState<WindSite[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showWind, setShowWind] = useState(false);
  const [showDepth, setShowDepth] = useState(false);

  // Handle mutually exclusive toggles
  const handleWindToggle = (checked: boolean) => {
    setShowWind(checked);
    if (checked) setShowDepth(false);
  };

  const handleDepthToggle = (checked: boolean) => {
    setShowDepth(checked);
    if (checked) setShowWind(false);
  };

  // Fetch all sites for heatmap generation
  useEffect(() => {
    const fetchAllSites = async () => {
      const { data, error } = await supabase
        .from('wind_sites')
        .select('*')
        .order('overall_score', { ascending: false })
        .limit(100); // Limit to top 100 for performance
      
      if (error) {
        console.error('Error fetching all wind sites:', error);
        return;
      }
      
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
      
      setAllSites(sites);
    };
    
    fetchAllSites();
  }, []);

  // Generate heatmap data based on all sites
  const windPatternData = useMemo(() => generateWindPatternData(allSites), [allSites]);
  const depthData = useMemo(() => generateDepthData(allSites), [allSites]);

  useEffect(() => {
    const fetchWindSites = async () => {
      if (highlightedSiteIds.length === 0) {
        setWindSites([]);
        return;
      }

      const { data, error } = await supabase
        .from('wind_sites')
        .select('*')
        .in('id', highlightedSiteIds)
        .order('overall_score', { ascending: false });
      
      if (error) {
        console.error('Error fetching wind sites:', error);
        return;
      }
      
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
  }, [highlightedSiteIds]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([54.0, 3.0], 5);
    mapRef.current = map;

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
  }, []);

  // Initialize heatmap layers when data is ready
  useEffect(() => {
    if (!mapRef.current || allSites.length === 0) return;

    // Create depth heatmap
    if (depthData.length > 0 && !depthLayerRef.current) {
      // @ts-ignore - leaflet.heat types
      depthLayerRef.current = L.heatLayer(depthData, {
        radius: 25,
        blur: 35,
        minOpacity: 0.3,
        max: 2.0,
        gradient: depthGradient
      });
    }

    // Create wind pattern heatmap
    if (windPatternData.length > 0 && !heatLayerRef.current) {
      const currentWindData = windPatternData[selectedDay];
      if (currentWindData) {
        // @ts-ignore - leaflet.heat types
        heatLayerRef.current = L.heatLayer(currentWindData.points, {
          radius: 30,
          blur: 40,
          minOpacity: 0.4,
          max: 3.0,
          gradient: {
            0.0: '#6b7280',
            0.35: '#3b82f6',
            0.5: '#eab308',
            0.65: '#f59e0b',
            0.8: '#dc2626'
          }
        });
      }
    }
  }, [allSites, depthData, windPatternData, selectedDay]);

  // Update wind heatmap when day changes
  useEffect(() => {
    if (!mapRef.current || !heatLayerRef.current || windPatternData.length === 0) return;
    
    const currentWindData = windPatternData[selectedDay];
    if (currentWindData) {
      // @ts-ignore - leaflet.heat types
      heatLayerRef.current.setLatLngs(currentWindData.points);
    }
  }, [selectedDay, windPatternData]);

  // Toggle wind layer
  useEffect(() => {
    if (!mapRef.current || !heatLayerRef.current) return;

    if (showWind) {
      heatLayerRef.current.addTo(mapRef.current);
    } else {
      mapRef.current.removeLayer(heatLayerRef.current);
    }
  }, [showWind]);

  // Toggle depth layer
  useEffect(() => {
    if (!mapRef.current || !depthLayerRef.current) return;

    if (showDepth) {
      depthLayerRef.current.addTo(mapRef.current);
    } else {
      mapRef.current.removeLayer(depthLayerRef.current);
    }
  }, [showDepth]);

  // Update markers when sites or highlighted IDs change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    markersRef.current.clear();

    if (windSites.length === 0) return;

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
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; color: #1e3a5f;">${site.name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${site.country}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
              <span style="color: #666;">Capacity Factor:</span>
              <span style="font-weight: 600;">${site.capacityFactor}%</span>
              <span style="color: #666;">Water Depth:</span>
              <span style="font-weight: 600;">${site.waterDepth}m</span>
              <span style="color: #666;">Feasibility:</span>
              <span style="font-weight: 600; text-transform: capitalize;">${site.feasibility}</span>
              <span style="color: #666;">Overall Score:</span>
              <span style="font-weight: 600; color: #1e3a5f;">${site.overallScore}/100</span>
            </div>
            <p style="font-size: 11px; color: #888; margin-top: 8px;">${site.estimatedCapacity}</p>
          </div>
        `);

      marker.on('click', () => {
        if (onSiteSelect) {
          onSiteSelect(site);
        }
      });

      markersRef.current.set(site.id, marker);
    });
    
    if (windSites.length > 0) {
      const bounds = L.latLngBounds(windSites.map(site => site.coordinates));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }, [windSites, onSiteSelect, highlightedSiteIds]);

  // Handle selected site - zoom and open popup
  useEffect(() => {
    if (!mapRef.current || !selectedSiteId) return;
    
    const marker = markersRef.current.get(selectedSiteId);
    const site = windSites.find(s => s.id === selectedSiteId);
    
    if (marker && site) {
      mapRef.current.setView(site.coordinates, 7, { animate: true });
      marker.openPopup();
    }
  }, [selectedSiteId, windSites]);

  const handlePreviousDay = () => {
    setSelectedDay(prev => (prev > 0 ? prev - 1 : windPatternData.length - 1));
  };

  const handleNextDay = () => {
    setSelectedDay(prev => (prev < windPatternData.length - 1 ? prev + 1 : 0));
  };

  const currentDayData = windPatternData[selectedDay];

  return (
    <Card className="h-full overflow-hidden relative">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-border z-[1000]">
        {showWind && currentDayData && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handlePreviousDay}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[100px]">
                <div className="text-sm font-semibold">{currentDayData.day}</div>
                <div className="text-xs text-muted-foreground">{currentDayData.date}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleNextDay}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-center text-muted-foreground mb-2">
              Wind Avg Score: <span className="font-semibold text-foreground">{currentDayData.averageScore}</span>
            </div>
          </>
        )}
        <div className={`flex items-center gap-2 ${showWind ? 'pt-2 border-t border-border' : ''}`}>
          <Switch
            id="wind-heatmap"
            checked={showWind}
            onCheckedChange={handleWindToggle}
            disabled={allSites.length === 0}
          />
          <Label htmlFor="wind-heatmap" className="text-xs cursor-pointer flex items-center gap-1">
            <Wind className="h-3 w-3" />
            Wind Heatmap
          </Label>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Switch
            id="depth"
            checked={showDepth}
            onCheckedChange={handleDepthToggle}
            disabled={allSites.length === 0}
          />
          <Label htmlFor="depth" className="text-xs cursor-pointer flex items-center gap-1">
            <Waves className="h-3 w-3" />
            Sea Depth
          </Label>
        </div>
      </div>

      {/* Legends Container */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-[1000]">
        {/* Wind Legend */}
        {showWind && (
          <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-border">
            <div className="text-xs font-semibold mb-2">Wind Consistency</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                <span className="text-xs">Strong (80-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span className="text-xs">Good (65-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: '#eab308' }}></div>
                <span className="text-xs">Moderate (50-64)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                <span className="text-xs">Light (35-49)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: '#6b7280' }}></div>
                <span className="text-xs">Calm (0-34)</span>
              </div>
            </div>
          </div>
        )}

        {/* Depth Legend */}
        {showDepth && (
          <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-border">
            <div className="text-xs font-semibold mb-2">Sea Depth</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: '#1e3a5f' }}></div>
                <span className="text-xs">Very Deep (200m+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: '#1e40af' }}></div>
                <span className="text-xs">Deep (150-200m)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: '#2563eb' }}></div>
                <span className="text-xs">Moderate (100-150m)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: '#60a5fa' }}></div>
                <span className="text-xs">Shallow (50-100m)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: '#93c5fd' }}></div>
                <span className="text-xs">Very Shallow (0-50m)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WindSiteMap;
