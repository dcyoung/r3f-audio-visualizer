import { cn } from "@/lib/utils";
import { HTMLAttributes, PropsWithChildren, ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const ToolbarItem = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:scale-150 ease-in-out duration-300 hover:bg-white/50 pointer-events-auto cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const ToolbarPopover = ({
  trigger,
  children,
  className,
}: PropsWithChildren<{
  trigger: ReactNode;
  className?: string;
}>) => {
  return (
    <Popover>
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent align="center" className={className}>
        {children}
      </PopoverContent>
    </Popover>
  );
};
