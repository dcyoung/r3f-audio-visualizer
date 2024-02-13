import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Palette, Settings } from "lucide-react";

import { Dock, DockItem, DockNav } from "./dock";
import { ModeSheet } from "./modeSheet";
import { VisualSettingsSheet } from "./visualSettingsSheet";

export const SettingsDock = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <Dock {...props} className={cn("max-h-4/5 w-fit sm:h-fit", className)}>
      <DockNav className="snap-y flex-col bg-gradient-to-l sm:snap-x sm:flex-row sm:bg-gradient-to-t">
        <ModeSheet>
          <DockItem className="rounded-full">
            <Settings />
          </DockItem>
        </ModeSheet>
        <VisualSettingsSheet>
          <DockItem className="rounded-full">
            <Palette />
          </DockItem>
        </VisualSettingsSheet>
      </DockNav>
    </Dock>
  );
};

export default SettingsDock;
