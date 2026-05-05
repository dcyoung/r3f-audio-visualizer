"use client";

import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useRef,
} from "react";
import { cn } from "@/lib/utils";
import { GripHorizontal } from "lucide-react";
import { Drawer } from "vaul";

import { SettingsPortalContainerProvider } from "./settingsPortalContainer";

export const MobileDrawer = ({
  open,
  onOpenChange,
  children,
  className,
}: PropsWithChildren<{
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  className?: string;
}>) => {
  const settingsPortalContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Drawer.Root
      shouldScaleBackground={true}
      repositionInputs={false}
      snapPoints={[0.2, 0.8]}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Drawer.Portal>
        <SettingsPortalContainerProvider
          containerRef={settingsPortalContainerRef}
        >
          <Drawer.Content
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex size-full flex-col rounded-t-[10px] p-5",
              "border-white bg-black/80",
              className,
            )}
          >
            <div className="flex w-full items-center justify-center">
              <GripHorizontal className="shrink-0 p-0 text-white" />
            </div>
            <Drawer.Title hidden />
            <Drawer.Description hidden />

            <div
              ref={settingsPortalContainerRef}
              className="no-scrollbar mt-[30px] flex w-full grow flex-col gap-[30px] overflow-y-scroll"
            >
              {children}
              <div className="h-1/4 w-full shrink-0" />
            </div>
          </Drawer.Content>
        </SettingsPortalContainerProvider>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
