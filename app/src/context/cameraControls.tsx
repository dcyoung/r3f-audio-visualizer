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
}

export const CameraControlsContext = createContext<{
  config: CameraControlsConfig;
  setters: {
    setMode: Dispatch<SetStateAction<CameraControlsMode>>;
  };
} | null>(null);

export const CameraControlsContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [mode, setMode] = useState<CameraControlsMode>(
    CAMERA_CONTROLS_MODE.ORBIT_CONTROLS
  );

  return (
    <CameraControlsContext.Provider
      value={{
        config: {
          mode: mode,
        },
        setters: {
          setMode: setMode,
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
      "useCameraControlsContext must be used within a CameraControlsContextProvider"
    );
  }
  return context.config;
}

export function useCameraControlsContextSetters() {
  const context = useContext(CameraControlsContext);
  if (!context) {
    throw new Error(
      "useCameraControlsContext must be used within a CameraControlsContextProvider"
    );
  }
  return context.setters;
}
