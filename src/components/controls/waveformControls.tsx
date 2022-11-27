import { folder, useControls } from "leva";
import { useAppState } from "../appState";

const WaveformControls = (): JSX.Element => {
  const updateAmplitude = useAppState((state) => state.updateAmplitude);
  const updateFrequencyHz = useAppState((state) => state.updateFrequencyHz);
  useControls(
    () => ({
      "Wave Generator": folder(
        {
          amplitude: {
            value: 1.0,
            min: 0.0,
            max: 5.0,
            step: 0.01,
            onChange: (v) => {
              updateAmplitude(v);
            },
          },
          frequencyHz: {
            value: 2,
            min: 0.0,
            max: 30,
            step: 0.05,
            onChange: (v) => {
              updateFrequencyHz(v);
            },
          },
        },
        { collapsed: true }
      ),
    }),
    [updateFrequencyHz, updateAmplitude]
  );

  return <></>;
};

export default WaveformControls;
