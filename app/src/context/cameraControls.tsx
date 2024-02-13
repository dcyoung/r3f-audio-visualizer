import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import { useTimeout } from "@/hooks/useTimeout";
import { useLastCanvasInteraction } from "@/lib/appState";

export const CAMERA_CONTROLS_MODE = {
  AUTO_ORBIT: "AUTO_ORBIT",
  ORBIT_CONTROLS: "ORBIT_CONTROLS",
} as const;
export type CameraControlsMode =
  (typeof CAMERA_CONTROLS_MODE)[keyof typeof CAMERA_CONTROLS_MODE];

export interface CameraControlsConfig {
  mode: CameraControlsMode;
  autoOrbitAfterSleepMs: number; // disabled if <= 0
}

export const CameraControlsContext = createContext<{
  config: CameraControlsConfig;
  setters: {
    setMode: Dispatch<SetStateAction<CameraControlsMode>>;
    setAutoOrbitAfterSleepMs: Dispatch<SetStateAction<number>>;
  };
} | null>(null);

export const CameraControlsContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren & {
  initial?: Partial<CameraControlsConfig>;
}) => {
  const lastCanvasInteraction = useLastCanvasInteraction();
  const [mode, setMode] = useState<CameraControlsMode>(
    initial?.mode ?? CAMERA_CONTROLS_MODE.ORBIT_CONTROLS,
  );
  const [autoOrbitAfterSleepMs, setAutoOrbitAfterSleepMs] = useState<number>(
    initial?.autoOrbitAfterSleepMs ?? 10000,
  );

  const { reset } = useTimeout(autoOrbitAfterSleepMs, () => {
    if (mode !== CAMERA_CONTROLS_MODE.AUTO_ORBIT) {
      setMode(CAMERA_CONTROLS_MODE.AUTO_ORBIT);
    }
  });

  // TODO: Investigate behavior here
  useEffect(() => {
    // If the user has interacted with the canvas, set the mode back to manual control
    if (mode === CAMERA_CONTROLS_MODE.AUTO_ORBIT) {
      setMode(CAMERA_CONTROLS_MODE.ORBIT_CONTROLS);
    }
    reset();
  }, [lastCanvasInteraction, reset]);

  return (
    <CameraControlsContext.Provider
      value={{
        config: {
          mode,
          autoOrbitAfterSleepMs,
        },
        setters: {
          setMode,
          setAutoOrbitAfterSleepMs,
        },
      }}
    >
      {children}
    </CameraControlsContext.Provider>
  );
};

export function useCameraControlsContext() {
  const context = useContext(CameraControlsContext);
  if (!context) {
    throw new Error(
      "useCameraControlsContext must be used within a CameraControlsContextProvider",
    );
  }
  return context.config;
}

export function useCameraControlsContextSetters() {
  const context = useContext(CameraControlsContext);
  if (!context) {
    throw new Error(
      "useCameraControlsContext must be used within a CameraControlsContextProvider",
    );
  }
  return context.setters;
}
