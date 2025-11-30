import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { marineLitterData, getDensityColor, type MarineLitterHotspot } from '@/data/marineData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface MarineMapProps {
  onHotspotSelect?: (hotspot: MarineLitterHotspot) => void;
}

const MarineMap = ({ onHotspotSelect }: MarineMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<MarineLitterHotspot | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Singapore
    const map = L.map(mapContainerRef.current).setView([1.3521, 103.8198], 11);
    mapRef.current = map;

    // Add minimalistic tile layer with clear water emphasis
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Add markers for each hotspot
    marineLitterData.forEach((hotspot) => {
      const marker = L.circleMarker(hotspot.coordinates, {
        radius: hotspot.impactScore / 10,
        fillColor: getDensityColor(hotspot.density),
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      }).addTo(map);

      marker.on('click', () => {
        setSelectedHotspot(hotspot);
        onHotspotSelect?.(hotspot);
        map.flyTo(hotspot.coordinates, 14);
      });

      // Add popup
      marker.bindPopup(`
        <div class="font-sans">
          <h3 class="font-semibold text-base mb-1">${hotspot.name}</h3>
          <p class="text-sm mb-1"><strong>Density:</strong> ${hotspot.density}</p>
          <p class="text-sm mb-1"><strong>Impact Score:</strong> ${hotspot.impactScore}/100</p>
          <p class="text-sm"><strong>Volume:</strong> ${hotspot.estimatedVolume}</p>
        </div>
      `);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onHotspotSelect]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full rounded-lg shadow-lg" />
      
      {selectedHotspot && (
        <Card className="absolute top-4 right-4 w-80 shadow-xl z-[1000] bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">{selectedHotspot.name}</span>
              <Badge 
                variant="outline"
                className="font-semibold"
                style={{ 
                  borderColor: getDensityColor(selectedHotspot.density),
                  color: getDensityColor(selectedHotspot.density)
                }}
              >
                {selectedHotspot.density.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Debris Types</p>
              <div className="flex flex-wrap gap-1">
                {selectedHotspot.debrisType.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Impact Score</p>
                <p className="text-xl font-bold text-accent">{selectedHotspot.impactScore}/100</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Volume</p>
                <p className="text-xl font-bold">{selectedHotspot.estimatedVolume}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Accessibility</p>
              <p className="text-sm font-medium capitalize">{selectedHotspot.accessibility}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Last Survey</p>
              <p className="text-sm font-medium">{new Date(selectedHotspot.lastSurvey).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="absolute bottom-4 left-4 shadow-xl z-[1000] bg-card/95 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getDensityColor('critical') }} />
              <span className="text-xs">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getDensityColor('high') }} />
              <span className="text-xs">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getDensityColor('medium') }} />
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getDensityColor('low') }} />
              <span className="text-xs">Low</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarineMap;