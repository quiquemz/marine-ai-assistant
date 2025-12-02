import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrioritySites, type WindSite } from '@/data/windSiteData';
import { Wind, TrendingUp, Anchor } from 'lucide-react';
import { Badge } from './ui/badge';

interface WindSitePriorityPanelProps {
  onSiteSelect?: (site: WindSite) => void;
}

const WindSitePriorityPanel = ({ onSiteSelect }: WindSitePriorityPanelProps) => {
  const prioritySites = getPrioritySites();

  const getFeasibilityBadgeVariant = (feasibility: string) => {
    switch (feasibility) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'moderate': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5" />
          Top Priority Sites
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {prioritySites.map((site, index) => (
          <div
            key={site.id}
            onClick={() => onSiteSelect?.(site)}
            className="p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2 flex-1">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm leading-tight mb-1">{site.name}</h4>
                  <p className="text-xs text-muted-foreground">{site.country}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs ml-8">
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">CF:</span>
                <span className="font-semibold">{site.capacityFactor}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Anchor className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">Depth:</span>
                <span className="font-semibold">{site.waterDepth}m</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 ml-8">
              <Badge variant={getFeasibilityBadgeVariant(site.feasibility)} className="text-xs">
                {site.feasibility}
              </Badge>
              <div className="text-xs">
                <span className="text-muted-foreground">Score: </span>
                <span className="font-bold text-primary">{site.overallScore}/100</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-2 ml-8">
              {site.estimatedCapacity}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WindSitePriorityPanel;
