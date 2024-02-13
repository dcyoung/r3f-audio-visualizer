import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

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
  const [mode, setMode] = useState<CameraControlsMode>(
    initial?.mode ?? CAMERA_CONTROLS_MODE.ORBIT_CONTROLS,
  );
  const [autoOrbitAfterSleepMs, setAutoOrbitAfterSleepMs] = useState<number>(
    initial?.autoOrbitAfterSleepMs ?? 10000,
  );

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
