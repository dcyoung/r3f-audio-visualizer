import { useEffect, useRef } from "react";
import { VISUAL_REGISTRY, type TVisualId } from "@/components/visualizers/registry";
import {
  createParser,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

import {
  getPlatformSupportedApplicationModes,
  isCameraMode,
  type TApplicationMode,
} from "./applicationModes";
import {
  useAppStateActions,
  useCameraState,
  useMode,
  useVisual,
} from "./appState";

const AUTO_ORBIT_AFTER_SLEEP_MS = 3500;
const SUPPORTED_APPLICATION_MODES = getPlatformSupportedApplicationModes();
const VISUAL_IDS = Object.keys(VISUAL_REGISTRY) as TVisualId[];

const parseAsAutoOrbit = createParser({
  parse(value) {
    switch (value) {
      case "1":
      case "true":
      case "on":
        return true;
      case "0":
      case "false":
      case "off":
        return false;
      default:
        return null;
    }
  },
  serialize(value) {
    return value ? "1" : "0";
  },
});

const urlStateParsers = {
  mode: parseAsStringLiteral(SUPPORTED_APPLICATION_MODES),
  visual: parseAsStringLiteral(VISUAL_IDS),
  autoOrbit: parseAsAutoOrbit,
};

type ParsedUrlState = {
  mode?: TApplicationMode;
  visualId?: TVisualId;
  autoOrbitEnabled?: boolean;
};

const visualSupportsMode = (visualId: TVisualId, mode: TApplicationMode) => {
  return [...VISUAL_REGISTRY[visualId].supportedApplicationModes].includes(mode);
};

const isSupportedUrlMode = (
  value: TApplicationMode,
): value is (typeof SUPPORTED_APPLICATION_MODES)[number] => {
  return SUPPORTED_APPLICATION_MODES.some((mode) => mode === value);
};

export const parseUrlState = (
  queryState: {
    mode: TApplicationMode | null;
    visual: TVisualId | null;
    autoOrbit: boolean | null;
  },
  fallbackMode: TApplicationMode,
): ParsedUrlState => {
  const mode = queryState.mode ?? undefined;
  const resolvedMode = mode ?? fallbackMode;
  const visualId =
    queryState.visual !== null &&
    visualSupportsMode(queryState.visual, resolvedMode)
      ? queryState.visual
      : undefined;

  return {
    mode,
    visualId,
    autoOrbitEnabled: queryState.autoOrbit ?? undefined,
  };
};

const getAutoOrbitCameraState = (enabled: boolean) => {
  return enabled
    ? {
        mode: "AUTO_ORBIT" as const,
        autoOrbitAfterSleepMs: AUTO_ORBIT_AFTER_SLEEP_MS,
      }
    : {
        mode: "ORBIT_CONTROLS" as const,
        autoOrbitAfterSleepMs: 0,
      };
};

export const UrlStateSync = () => {
  const mode = useMode();
  const visual = useVisual();
  const camera = useCameraState();
  const { setMode, setVisual, setCamera } = useAppStateActions();
  const [urlState, setUrlState] = useQueryStates(urlStateParsers);
  const hasAppliedInitialUrlState = useRef(false);
  const skipNextUrlWrite = useRef(false);

  useEffect(() => {
    if (hasAppliedInitialUrlState.current) return;
    hasAppliedInitialUrlState.current = true;

    const parsedState = parseUrlState(urlState, mode);
    const resolvedMode = parsedState.mode ?? mode;
    const autoOrbitEnabled = parsedState.autoOrbitEnabled;
    const shouldApplyCameraState =
      autoOrbitEnabled !== undefined && isCameraMode(resolvedMode);
    const shouldApplyUrlState =
      parsedState.mode !== undefined ||
      parsedState.visualId !== undefined ||
      shouldApplyCameraState;

    skipNextUrlWrite.current = shouldApplyUrlState;

    if (parsedState.mode !== undefined) {
      setMode(parsedState.mode);
    }

    if (parsedState.visualId !== undefined) {
      setVisual(parsedState.visualId);
    }

    if (autoOrbitEnabled !== undefined && isCameraMode(resolvedMode)) {
      setCamera(getAutoOrbitCameraState(autoOrbitEnabled));
    }
  }, [mode, setCamera, setMode, setVisual, urlState]);

  useEffect(() => {
    if (!hasAppliedInitialUrlState.current) return;
    if (skipNextUrlWrite.current) {
      skipNextUrlWrite.current = false;
      return;
    }

    void setUrlState({
      mode: isSupportedUrlMode(mode) ? mode : null,
      visual: visual.id,
      autoOrbit: isCameraMode(mode) ? camera.autoOrbitAfterSleepMs > 0 : null,
    });
  }, [camera.autoOrbitAfterSleepMs, mode, setUrlState, visual.id]);

  return null;
};
