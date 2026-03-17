import { type HTMLAttributes, type HTMLProps, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
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
      <span className="text-muted-foreground w-12 px-2 py-0.5 text-right text-sm">
        {value}
      </span>
    </div>
  );
};

export const SliderField = ({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  displayValue?: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-muted-foreground font-mono text-xs">
        {displayValue ?? value}
      </span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(e) => {
        const next: number =
          typeof e === "number"
            ? e
            : Array.isArray(e)
              ? Number(e[0] ?? value)
              : value;
        onChange(next);
      }}
    />
  </div>
);

export const SwitchRow = ({
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3">
    <Label className={cn("font-normal", disabled && "opacity-50")}>
      {label}
    </Label>
    <Switch
      checked={checked}
      defaultChecked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  </div>
);

export const PresetBar = ({
  activePreset,
  presetOptions,
  onSelect,
}: {
  activePreset: string | undefined;
  presetOptions: Record<string, unknown>;
  onSelect: (preset: string | undefined) => void;
}) => (
  <div className="flex w-full flex-wrap items-center gap-1">
    {[...Object.keys(presetOptions), "custom"].map((p) => {
      const isActive = p === "custom" ? !activePreset : activePreset === p;
      return (
        <Button
          key={`po_${p}`}
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 rounded-md px-2.5 text-xs capitalize",
            isActive
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onSelect(p === "custom" ? undefined : p)}
        >
          {p}
        </Button>
      );
    })}
  </div>
);

export const SelectRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="flex w-full items-center justify-between gap-3">
    <span className="text-muted-foreground shrink-0 text-xs">{label}</span>
    {children}
  </div>
);

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
