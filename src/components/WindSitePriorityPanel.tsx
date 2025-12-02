import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type WindSite } from '@/data/windSiteData';
import { Wind, TrendingUp, Anchor } from 'lucide-react';
import FeasibilityTooltip from './FeasibilityTooltip';
import { supabase } from '@/integrations/supabase/client';

interface WindSitePriorityPanelProps {
  onSiteSelect?: (site: WindSite) => void;
  highlightedSiteIds?: string[];
}

const WindSitePriorityPanel = ({ onSiteSelect, highlightedSiteIds = [] }: WindSitePriorityPanelProps) => {
  const [prioritySites, setPrioritySites] = useState<WindSite[]>([]);

  useEffect(() => {
    const fetchPrioritySites = async () => {
      if (highlightedSiteIds.length === 0) {
        setPrioritySites([]);
        return;
      }

      const { data, error } = await supabase
        .from('wind_sites')
        .select('*')
        .in('id', highlightedSiteIds)
        .order('overall_score', { ascending: false });

      if (error) {
        console.error('Error fetching priority sites:', error);
        return;
      }

      const sites: WindSite[] = data.map((site) => ({
        id: site.id,
        name: site.name,
        coordinates: site.coordinates as [number, number],
        capacityFactor: site.capacity_factor,
        waterDepth: site.water_depth,
        feasibility: site.feasibility as WindSite['feasibility'],
        environmentalImpact: site.environmental_impact as WindSite['environmentalImpact'],
        birdMigrationRisk: site.bird_migration_risk as WindSite['birdMigrationRisk'],
        whaleMigrationRisk: site.whale_migration_risk as WindSite['whaleMigrationRisk'],
        seaFloorImpact: site.sea_floor_impact as WindSite['seaFloorImpact'],
        overallScore: site.overall_score,
        lastAssessment: site.last_assessment,
        estimatedCapacity: site.estimated_capacity,
        country: site.country,
        distanceToPortKm: site.distance_to_port_km ?? undefined,
        distanceToGridKm: site.distance_to_grid_km ?? undefined,
        capexEurMPerMw: site.capex_eur_m_per_mw ?? undefined,
      }));

      setPrioritySites(sites);
    };

    fetchPrioritySites();
  }, [highlightedSiteIds]);

  const getFeasibilityBadgeVariant = (feasibility: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (feasibility) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'moderate': return 'outline';
      default: return 'destructive';
    }
  };

  if (highlightedSiteIds.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 py-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Search Results
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            Ask the copilot to search for sites to see results here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 py-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5" />
          Search Results ({prioritySites.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 overflow-auto">
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
              <FeasibilityTooltip site={site} variant={getFeasibilityBadgeVariant(site.feasibility)} />
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
