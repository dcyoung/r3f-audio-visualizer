import { forwardRef, type HTMLAttributes, type HTMLProps } from "react";
import { cn } from "@/lib/utils";

export const DockItem = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid size-10 flex-none grow cursor-pointer snap-center place-items-center rounded-sm bg-gradient-to-b from-slate-700 to-black text-white shadow-inner duration-300 ease-in-out hover:scale-110 hover:from-slate-500 hover:to-slate-900 aria-selected:from-slate-100 aria-selected:to-slate-500 aria-selected:text-black",
          className,
        )}
        style={{
          animationName: "scale, scale",
          animationFillMode: "both",
          animationTimingFunction: "ease-in-out",
          animationDirection: "normal, reverse",
          animationTimeline: "view(inline)",
          animationRange: "entry 0% entry 150%, exit -50% exit 100%",
        }}
        {...props}
      />
    );
  },
);
DockItem.displayName = "DockItem";

export const DockNav = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "pointer-events-auto flex h-full w-full snap-x snap-mandatory flex-row items-center justify-start gap-4 overflow-auto rounded-xl bg-gradient-to-t from-white/10 to-white/0 p-4 shadow-inner",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Dock = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "max-w-4/5 sm:max-w-3/5 pointer-events-none h-fit overflow-hidden bg-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
