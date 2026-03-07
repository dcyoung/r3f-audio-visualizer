import { AudioSourceControls, AudioSourceSelect } from "./common";

export const AudioScopeModeControls = () => {
  return (
    <div className="space-y-4">
      <AudioSourceSelect />
      <AudioSourceControls />
    </div>
  );
};
