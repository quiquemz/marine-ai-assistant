import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { getPriorityHotspots, type MarineLitterHotspot } from '@/data/marineData';

interface PriorityPanelProps {
  onHotspotSelect?: (hotspot: MarineLitterHotspot) => void;
}

const PriorityPanel = ({ onHotspotSelect }: PriorityPanelProps) => {
  const priorityHotspots = getPriorityHotspots();

  return (
    <Card className="bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-accent" />
          Top Priority Hotspots
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {priorityHotspots.map((hotspot, index) => (
          <div
            key={hotspot.id}
            onClick={() => onHotspotSelect?.(hotspot)}
            className="p-3 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">{index + 1}</span>
                </div>
                <h4 className="font-semibold text-sm">{hotspot.name}</h4>
              </div>
              <Badge variant="outline" className="text-xs">
                {hotspot.density}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Score: {hotspot.impactScore}</span>
              </div>
              <span>{hotspot.estimatedVolume}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PriorityPanel;