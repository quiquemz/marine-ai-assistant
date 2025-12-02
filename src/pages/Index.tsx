import { useState } from 'react';
import WindSiteMap from '@/components/WindSiteMap';
import ChatInterface from '@/components/ChatInterface';
import WindSitePriorityPanel from '@/components/WindSitePriorityPanel';
import { Wind } from 'lucide-react';
import type { WindSite } from '@/data/windSiteData';

const Index = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<string>();
  const [selectedSiteId, setSelectedSiteId] = useState<string>();
  const [highlightedSiteIds, setHighlightedSiteIds] = useState<string[]>([]);

  const handleSiteSelect = (site: WindSite) => {
    setSelectedHotspot(site.name);
    setSelectedSiteId(site.id);
  };

  const handleHighlightSites = (siteIds: string[]) => {
    setHighlightedSiteIds(siteIds);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Viento
              </h1>
              <p className="text-xs text-muted-foreground">
                Floating Offshore Wind Planning Copilot
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
          {/* Left Column - Chat */}
          <div className="lg:col-span-1 h-full min-h-[400px]">
            <ChatInterface 
              selectedHotspot={selectedHotspot} 
              onHighlightSites={handleHighlightSites}
            />
          </div>

          {/* Center Column - Map */}
          <div className="lg:col-span-2 h-full min-h-[400px]">
            <WindSiteMap 
              onSiteSelect={handleSiteSelect} 
              highlightedSiteIds={highlightedSiteIds}
              selectedSiteId={selectedSiteId}
            />
          </div>

          {/* Right Column - Search Results */}
          <div className="lg:col-span-1 h-full min-h-[400px] overflow-auto">
            <WindSitePriorityPanel 
              onSiteSelect={handleSiteSelect}
              highlightedSiteIds={highlightedSiteIds}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;