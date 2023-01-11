import { useControls } from "leva";
import { useEffect, useRef } from "react";
import { useAppState } from "../../appState";
import FFTAnalyzer from "../fft";

interface LivestreamAnalyzerProps {
  analyzerMode?: number;
}

const LivestreamAnalyzer = ({
  analyzerMode = 2,
}: LivestreamAnalyzerProps): JSX.Element => {
  const { streamUrl } = useControls({
    streamUrl: {
      value: "http://igor.torontocast.com:1950/stream",
      options: {
        Default: "http://igor.torontocast.com:1950/stream",
        //Ice: "https://icecast2.ufpel.edu.br/live" // DEAD
        Estilo:
          "https://us4.internet-radio.com/proxy/radioestiloleblon?mp=/stream",
        // LoFi: "http://192.95.39.65:5607/stream/1/",
        // "Lo Fly": "http://64.20.39.8:8421/stream/1/",
        // "Disco/Funk": "http://91.121.104.123:8000/stream/1/",
        // Soul: "http://192.95.18.39:5123/stream/1/",
        // Latin: "http://149.56.157.81:5152/stream/1/",
        // "Smooth Jazz": "http://64.95.243.43:8002/stream/1/",
        "Jazz Cafe": "http://radio.wanderingsheep.net:8090/jazzcafe320",
        // House: "http://62.210.105.16:7000/stream/1/",
        // "Drum and Bass": "http://91.232.4.33:7022/stream/1/",
      },
      // order: -99,
    },
  });

  const audioRef = useRef<HTMLAudioElement>(null!);
  const analyzerRef = useRef<FFTAnalyzer>(null!);
  const freqData = useAppState((state) => state.data);
  const resizeFreqData = useAppState((state) => state.resizeData);
  const requestRef = useRef<number>(null!);

  /**
   * Transfers data from the analyzer to the target array
   */
  const animate = (): void => {
    if (!analyzerRef.current) {
      return;
    }
    const bars = analyzerRef.current.getBars();

    if (freqData.length != bars.length) {
      console.log(`Resizing ${bars.length}`);
      resizeFreqData(bars.length);
      return;
    }

    bars.forEach(({ value }, index) => {
      freqData[index] = value;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  /**
   * Re-Synchronize the animation loop if the target data destination changes.
   */
  useEffect(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [freqData]); // Make sure the effect runs only once

  /**
   * Make sure an analyzer exists with the correct mode
   */
  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (analyzerRef.current) {
      analyzerRef.current.mode = analyzerMode;
      return;
    }

    analyzerRef.current = new FFTAnalyzer(audioRef.current);
    analyzerRef.current.mode = analyzerMode;
  }, [analyzerMode]);

  /**
   * Make sure we're playing the correct streams
   */
  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.pause();
    audioRef.current.src = streamUrl;
    const promise = audioRef.current.play();
    if (promise !== undefined) {
      promise
        .then(() => console.log(`Playing ${streamUrl}`))
        .catch((error) => {
          // Auto-play was prevented
          console.error(`Error playing ${streamUrl}`);
        });
    }
  }, [audioRef, streamUrl]);

  return <audio ref={audioRef} crossOrigin="anonymous" />;
};

export default LivestreamAnalyzer;
