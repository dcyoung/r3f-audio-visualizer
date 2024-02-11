import { AudioSourceControls, AudioSourceSelect } from "./common";

export const AudioScopeModeControls = () => {
  return (
    <div className="space-y-4 p-4">
      <AudioSourceSelect />
      <AudioSourceControls />
    </div>
  );
};
