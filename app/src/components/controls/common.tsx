import { type HTMLAttributes, type HTMLProps, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const ValueLabel = ({
  label,
  value,
  className,
  ...props
}: HTMLProps<HTMLDivElement> & {
  label: string;
  value: string | number;
}) => {
  return (
    <div
      className={cn("flex w-full items-center justify-between", className)}
      {...props}
    >
      <Label>{label}</Label>
      <span className="w-12 px-2 py-0.5 text-right text-sm text-muted-foreground">
        {value}
      </span>
    </div>
  );
};

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
