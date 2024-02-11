import { type HTMLAttributes, type ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const ToolbarItem = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "pointer-events-auto flex h-8 w-8 cursor-pointer flex-row items-center justify-center rounded-full bg-white/20 duration-300 ease-in-out hover:scale-150 hover:bg-white/50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const ToolbarPopover = ({
  trigger,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  trigger: ReactNode;
  align?: "start" | "end" | "center";
}) => {
  return (
    <Popover>
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent {...props} />
    </Popover>
  );
};
