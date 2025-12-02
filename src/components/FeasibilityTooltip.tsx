import { type WindSite, calculateFeasibilityBreakdown } from '@/data/windSiteData';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Anchor, Plug, Ship, Euro, Leaf } from 'lucide-react';

interface FeasibilityTooltipProps {
  site: WindSite;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

const ScoreBar = ({ score, label, icon: Icon }: { score: number; label: string; icon: React.ElementType }) => {
  const getScoreColor = (s: number) => {
    if (s >= 75) return 'bg-green-500';
    if (s >= 50) return 'bg-yellow-500';
    if (s >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${getScoreColor(score)} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right">{score}</span>
    </div>
  );
};

const FeasibilityTooltip = ({ site, variant = 'default' }: FeasibilityTooltipProps) => {
  const breakdown = calculateFeasibilityBreakdown(site);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className="text-xs cursor-help">
            {site.feasibility}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="left" className="w-64 p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
              <span className="text-xs font-semibold">Feasibility Breakdown</span>
              <span className="text-xs font-bold text-primary">{breakdown.totalScore}/100</span>
            </div>
            <ScoreBar score={breakdown.depthScore} label="Depth" icon={Anchor} />
            <ScoreBar score={breakdown.portDistanceScore} label="Port Dist" icon={Ship} />
            <ScoreBar score={breakdown.gridDistanceScore} label="Grid Dist" icon={Plug} />
            <ScoreBar score={breakdown.capexScore} label="CAPEX" icon={Euro} />
            <ScoreBar score={breakdown.environmentalScore} label="Environ." icon={Leaf} />
            <div className="text-[10px] text-muted-foreground pt-2 border-t border-border">
              Weights: Depth 25%, Port 20%, Grid 20%, CAPEX 15%, Env 20%
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FeasibilityTooltip;