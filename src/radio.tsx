import { RadioBrowserApi } from "radio-browser-api";
const api = new RadioBrowserApi("r3f-audio-visualizer");

export const getRadioStations = async () => {
  const stations = await api.searchStations({
    countryCode: "us",
    order: "votes",
    reverse: true,
    limit: 300,
    tagList: [
      "music",
      // "pop",
      // "classic",
      // "dance",
      // "oldies",
      // "80s",
      // "house",
      // "hiphop",
      // "chillout",
      // "ambient",
      // "funk",
    ],
  });
  return stations.map((s) => ({ title: s.name, streamUrl: s.urlResolved }));
};
