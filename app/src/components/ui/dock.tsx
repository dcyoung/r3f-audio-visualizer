"use client";

/* eslint-disable */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import {
  animate,
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

// Interface to define the types for our Dock context
interface DockContextType {
  width: number; // Width of the dock
  hovered: boolean; // If the dock is hovered
  setIsZooming: (value: boolean) => void; // Function to set zooming state
  zoomLevel: MotionValue<number>; // Motion value for zoom level
  mouseX: MotionValue<number>; // Motion value for mouse X position
}

// Initial width for the dock
const INITIAL_WIDTH = 48;

// Create a context to manage Dock state
const DockContext = createContext<DockContextType>({
  width: 0,
  hovered: false,
  /* eslint-disable @typescript-eslint/no-empty-function */
  setIsZooming: () => {},
  zoomLevel: null as any,
  mouseX: null as any,
});

// Custom hook to use Dock context
const useDock = () => useContext(DockContext);

// Props for the Dock component
interface DockProps {
  className?: string;
  children: ReactNode; // React children to be rendered within the dock
  fixedChildren: ReactNode;
}

// Main Dock component: orchestrating the dock's animation behavior
function Dock({ className, children, fixedChildren }: DockProps) {
  const [hovered, setHovered] = useState(false); // State to track if the dock is hovered. When the mouse hovers over the dock, this state changes to true.
  const [width, setWidth] = useState(0); // State to track the width of the dock. This dynamically updates based on the dock's current width.
  const dockRef = useRef<HTMLDivElement>(null); // Reference to the dock element in the DOM. This allows direct manipulation and measurement of the dock.
  const isZooming = useRef(false); // Reference to track if the zooming animation is active. This prevents conflicting animations.

  // Callback to toggle the zooming state. This ensures that we don't trigger hover animations while zooming.
  const setIsZooming = useCallback((value: boolean) => {
    isZooming.current = value; // Update the zooming reference
    setHovered(!value); // Update the hover state based on zooming
  }, []);

  const zoomLevel = useMotionValue(1); // Motion value for the zoom level of the dock. This provides a smooth zooming animation.

  // Hook to handle window resize events and update the dock's width accordingly.
  useWindowResize(() => {
    setWidth(dockRef.current?.clientWidth || 0); // Set width to the dock's current width or 0 if undefined
  });

  const mouseX = useMotionValue(Infinity); // Motion value to track the mouse's X position relative to the viewport. Initialized to Infinity to denote no tracking initially.

  return (
    // Provide the dock's state and control methods to the rest of the application through context.
    <DockContext.Provider
      value={{
        hovered, // Current hover state of the dock
        setIsZooming, // Method to set the zooming state
        width, // Current width of the dock
        zoomLevel, // Current zoom level motion value
        mouseX, // Current mouse X position motion value
      }}
    >
      <motion.div
        ref={dockRef} // Reference to the dock element
        // className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-end h-14 p-2 gap-3 bg-neutral-50 dark:bg-black bg-opacity-90 rounded-xl"
        className={cn(
          "absolute bottom-4 left-1/2 flex h-14 max-w-[80%] -translate-x-1/2 transform items-end gap-3 rounded-xl bg-opacity-90 p-2",
          "bg-gradient-to-t from-white/10 to-white/0 p-2 no-underline shadow-sm transition-colors hover:from-white/15",
          "shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(255,255,255,0.03)_inset,0_0_0_0px_rgba(0,0,0,0.1),0_2px_2px_0_rgba(0,0,0,0.1),0_4px_4px_0_rgba(0,0,0,0.1),0_8px_8px_0_rgba(0,0,0,0.1)]",
          className,
        )}
        // Event handler for mouse movement within the dock
        onMouseMove={(e) => {
          mouseX.set(e.pageX); // Update the mouseX motion value to the current mouse position
          if (!isZooming.current) {
            // Only set hovered if not zooming
            setHovered(true); // Set hovered state to true
          } else {
            // setHovered(false); // Set hovered state to false
          }
        }}
        // Event handler for when the mouse leaves the dock
        onMouseLeave={() => {
          mouseX.set(Infinity); // Reset mouseX motion value
          setHovered(false); // Set hovered state to false
        }}
        style={{
          x: "-50%", // Center the dock horizontally
          scale: zoomLevel, // Bind the zoom level to the scale style property
        }}
      >
        <div className="no-scrollbar flex items-end gap-3 overflow-y-visible overflow-x-scroll">
          {children}
        </div>
        {fixedChildren && (
          <>
            <DockDivider /> {fixedChildren}
          </>
        )}
      </motion.div>
    </DockContext.Provider>
  );
}

// Props for the DockCard component
interface DockCardProps {
  className?: string; // Additional classes to be applied to the dock card
  children: ReactNode; // React children to be rendered within the dock card
  id: string; // Unique identifier for the dock card
  active?: boolean;
  handleClick?: () => void;
}

// DockCard component: manages individual card behavior within the dock
function DockCard({
  className,
  children,
  id,
  handleClick,
  active = false,
}: DockCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null); // Reference to the card button element for direct DOM manipulation and measurement
  const [elCenterX, setElCenterX] = useState(0); // State to store the center X position of the card for accurate mouse interaction calculations
  const dock = useDock(); // Access the Dock context to get shared state and control functions

  // Spring animation for the size of the card, providing a smooth and responsive scaling effect
  const size = useSpring(INITIAL_WIDTH, {
    stiffness: 320,
    damping: 20,
    mass: 0.1,
  });

  // Spring animation for the opacity of the card, enabling smooth fade-in and fade-out effects
  const opacity = useSpring(0, {
    stiffness: 300,
    damping: 20,
  });

  // Custom hook to track mouse position and update the card size dynamically based on proximity to the mouse
  useMousePosition(
    {
      onChange: ({ value }) => {
        const mouseX = value.x;
        if (dock.width > 0) {
          // Calculate transformed value based on mouse position and card center, using a cosine function for a smooth curve
          const transformedValue =
            INITIAL_WIDTH +
            36 *
              Math.cos((((mouseX - elCenterX) / dock.width) * Math.PI) / 2) **
                12;

          // Only animate size if the dock is hovered
          if (dock.hovered) {
            animate(size, transformedValue);
          }
        }
      },
    },
    [elCenterX, dock],
  );

  // Hook to update the center X position of the card on window resize for accurate mouse interaction
  useWindowResize(() => {
    const { x } = cardRef.current?.getBoundingClientRect() || { x: 0 };
    setElCenterX(x + 24); // 24 is the half of INITIAL_WIDTH (48 / 2), centering the element
  });

  const isAnimating = useRef(false); // Reference to track if the card is currently animating to avoid conflicting animations
  const controls = useAnimation(); // Animation controls for managing card's Y position during the animation loop
  const timeoutRef = useRef<number | null>(null); // Reference to manage timeout cleanup on component unmount

  // Handle click event to start or stop the card's animation
  useEffect(() => {
    if (active === isAnimating.current) {
      return;
    }
    if (active) {
      isAnimating.current = true;
      opacity.set(0.5); // Set opacity for the animation
      controls.start({
        y: -5, // Move the card up by 24 pixels
        transition: {
          repeat: Infinity, // Repeat the animation indefinitely
          repeatType: "reverse", // Reverse the direction of the animation each cycle
          duration: 0.75, // Duration of each cycle
        },
      });
    } else {
      isAnimating.current = false;
      opacity.set(0); // Reset opacity
      controls.start({
        y: 0, // Reset Y position to the original state
        transition: { duration: 0.75 }, // Smooth transition back to original state
      });
    }
  }, [active]);

  // Cleanup timeout on component unmount to prevent memory leaks
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current!);
  }, []);

  // Calculate the distance from the mouse position to the center of the card
  const distance = useTransform(dock.mouseX, (val) => {
    const bounds = cardRef.current?.getBoundingClientRect() ?? {
      x: 0,
      width: 0,
    };
    return val - bounds.x - bounds.width / 2; // Calculate distance to the center of the card
  });

  // Transform the calculated distance into a responsive width for the card
  let widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <div className="flex flex-col items-center gap-1 pt-2" key={id}>
      {/* Motion button for the card, handling click events and animations */}
      <motion.button
        ref={cardRef} // Reference to the button element
        className={cn(
          "saturate-90 transition-filter hover:brightness-112 grid aspect-square place-content-center rounded-lg border border-black/5 border-opacity-10 bg-gradient-to-b from-slate-700 to-black brightness-90 duration-200 hover:saturate-100 dark:border-white/5",
          className,
        )}
        onClick={handleClick ? () => handleClick() : undefined}
        style={{
          width: width, // Responsive width based on mouse distance
        }}
        animate={controls} // Animation controls for Y position
        whileTap={{ scale: 0.95 }} // Scale down slightly on tap for a tactile feel
      >
        {children}{" "}
        {/* Render the children of the DockCard inside the motion button */}
      </motion.button>

      {/* AnimatePresence to manage the presence and layout animations of the card's indicator */}
      <AnimatePresence mode="popLayout">
        {isAnimating.current ? (
          <motion.div
            key={id} // Unique key for the motion div
            layoutId={id} // Layout identifier for smooth layout animations
            className="rounded-full"
            style={{ opacity }} // Bind opacity to the animated opacity spring
          >
            <motion.div
              exit={{ transition: { duration: 0 } }} // Exit transition with no duration for immediate removal
              className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white"
              style={{ opacity }} // Bind opacity to the animated opacity spring
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// Divider component for the dock
function DockDivider() {
  return (
    <motion.div
      className="flex h-full cursor-ns-resize items-center p-1.5"
      drag="y"
      dragConstraints={{ top: -100, bottom: 50 }}
    >
      <span className="h-full w-0.5 rounded bg-neutral-800/10 dark:bg-neutral-100/10"></span>
    </motion.div>
  );
}

type UseWindowResizeCallback = (width: number, height: number) => void;

// Custom hook to handle window resize events and invoke a callback with the new dimensions
function useWindowResize(callback: UseWindowResizeCallback) {
  // Create a stable callback reference to ensure the latest callback is always used
  const callbackRef = useCallbackRef(callback);

  useEffect(() => {
    // Function to handle window resize and call the provided callback with updated dimensions
    const handleResize = () => {
      callbackRef(window.innerWidth, window.innerHeight);
    };

    // Initial call to handleResize to capture the current window size
    handleResize();
    // Adding event listener for window resize events
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove the event listener when the component unmounts or dependencies change
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [callbackRef]); // Dependency array includes the stable callback reference
}

// Custom hook to create a stable callback reference
function useCallbackRef<T extends (...args: any[]) => any>(callback: T): T {
  // Use a ref to store the callback
  const callbackRef = useRef(callback);

  // Update the ref with the latest callback whenever it changes
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Return a memoized version of the callback that always uses the latest callback stored in the ref
  return useMemo(() => ((...args) => callbackRef.current?.(...args)) as T, []);
}

// Interface for mouse position options
interface MousePositionOptions {
  onChange?: (position: { value: { x: number; y: number } }) => void;
}

// Custom hook to track mouse position and animate values accordingly
export function useMousePosition(
  options: MousePositionOptions = {}, // Options to customize behavior, including an onChange callback
  deps: readonly any[] = [], // Dependencies array to determine when the effect should re-run
) {
  const { onChange } = options; // Destructure onChange from options for use in the effect

  // Create motion values for x and y coordinates, initialized to 0
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    // Function to handle mouse move events, animating the x and y motion values to the current mouse coordinates
    const handleMouseMove = (event: MouseEvent) => {
      animate(x, event.clientX);
      animate(y, event.clientY);
    };

    // Function to handle changes in the motion values, calling the onChange callback if it exists
    const handleChange = () => {
      if (onChange) {
        onChange({ value: { x: x.get(), y: y.get() } });
      }
    };

    // Subscribe to changes in the x and y motion values
    const unsubscribeX = x.on("change", handleChange);
    const unsubscribeY = y.on("change", handleChange);

    // Add event listener for mouse move events
    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup function to remove event listener and unsubscribe from motion value changes
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y, onChange, ...deps]); // Dependency array includes x, y, onChange, and any additional dependencies

  // Memoize and return the motion values for x and y coordinates
  return useMemo(
    () => ({
      x, // Motion value for x coordinate
      y, // Motion value for y coordinate
    }),
    [x, y], // Dependencies for the memoized return value
  );
}

export { Dock, DockCard, DockDivider, useDock };
