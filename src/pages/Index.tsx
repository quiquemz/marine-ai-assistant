import { useState } from 'react';
import MarineMap from '@/components/MarineMap';
import ChatInterface from '@/components/ChatInterface';
import PriorityPanel from '@/components/PriorityPanel';
import { Waves } from 'lucide-react';
import type { MarineLitterHotspot } from '@/data/marineData';

const Index = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<string>();

  const handleHotspotSelect = (hotspot: MarineLitterHotspot) => {
    setSelectedHotspot(hotspot.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Marine Litter AI Copilot
              </h1>
              <p className="text-xs text-muted-foreground">
                Intelligent coastal cleanup management
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Left Column - Chat + Priority */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-full">
            <div className="flex-1 min-h-0">
              <ChatInterface selectedHotspot={selectedHotspot} />
            </div>
            <div className="flex-shrink-0">
              <PriorityPanel onHotspotSelect={handleHotspotSelect} />
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2 h-full min-h-[500px]">
            <MarineMap onHotspotSelect={handleHotspotSelect} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;