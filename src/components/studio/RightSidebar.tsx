import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaptionEditor } from "./CaptionEditor";
import { MemeSoundboard } from "./MemeSoundboard";
import { ExportSettings } from "./ExportSettings";
import type { CaptionState, ExportConfig } from "./useStudioState";

interface RightSidebarProps {
  caption: CaptionState;
  setCaption: React.Dispatch<React.SetStateAction<CaptionState>>;
  exportConfig: ExportConfig;
  setExportConfig: React.Dispatch<React.SetStateAction<ExportConfig>>;
  sfxVolume: number;
  setSfxVolume: (v: number) => void;
}

export function RightSidebar({
  caption,
  setCaption,
  exportConfig,
  setExportConfig,
  sfxVolume,
  setSfxVolume,
}: RightSidebarProps) {
  return (
    <aside className="flex h-full w-[330px] shrink-0 flex-col border-l border-[#3a3228] bg-[#1d1813]">
      <Tabs defaultValue="captions" className="flex h-full flex-col">
        {/* Tab header */}
        <div className="border-b border-[#3a3228] px-3 py-2">
          <TabsList className="grid h-9 w-full grid-cols-3 bg-[#16120e]">
            <TabsTrigger
              value="captions"
              className="text-xs data-[state=active]:bg-[#231E18] data-[state=active]:text-[#E6C395]"
            >
              Captions
            </TabsTrigger>
            <TabsTrigger
              value="soundboard"
              className="text-xs data-[state=active]:bg-[#231E18] data-[state=active]:text-[#E6C395]"
            >
              Soundboard
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="text-xs data-[state=active]:bg-[#231E18] data-[state=active]:text-[#E6C395]"
            >
              Export
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab contents with scroll */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <TabsContent value="captions" className="mt-0">
            <CaptionEditor caption={caption} setCaption={setCaption} />
          </TabsContent>
          <TabsContent value="soundboard" className="mt-0">
            <MemeSoundboard volume={sfxVolume} setVolume={setSfxVolume} />
          </TabsContent>
          <TabsContent value="export" className="mt-0">
            <ExportSettings config={exportConfig} setConfig={setExportConfig} />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
