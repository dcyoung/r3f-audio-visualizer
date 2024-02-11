import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import {
  getPlatformSupportedAudioSources,
  type AudioSource,
} from "@/components/audio/sourceControls/common";

export interface AudioSourceConfig {
  audioSource: AudioSource;
}

export const AudioSourceContext = createContext<{
  config: AudioSourceConfig;
  setters: {
    setAudioSource: Dispatch<SetStateAction<AudioSource>>;
  };
} | null>(null);

export const AudioSourceContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<AudioSourceConfig>;
}>) => {
  const [audioSource, setAudioSource] = useState<AudioSource>(
    initial?.audioSource ?? getPlatformSupportedAudioSources()[0],
  );

  return (
    <AudioSourceContext.Provider
      value={{
        config: {
          audioSource: audioSource,
        },
        setters: {
          setAudioSource: setAudioSource,
        },
      }}
    >
      {children}
    </AudioSourceContext.Provider>
  );
};

export function useAudioSourceContext() {
  const context = useContext(AudioSourceContext);
  if (!context) {
    throw new Error(
      "useAudioSourceContext must be used within a AudioSourceContextProvider",
    );
  }
  return context.config;
}

export function useAudioSourceContextSetters() {
  const context = useContext(AudioSourceContext);
  if (!context) {
    throw new Error(
      "useAudioSourceContext must be used within a AudioSourceContextProvider",
    );
  }
  return context.setters;
}
