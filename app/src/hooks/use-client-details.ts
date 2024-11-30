"use client";

import { useEffect, useState } from "react";
import { useMedia } from "react-use";

export const useClientDetails = () => {
  const [ready, setReady] = useState(false);
  // Tailwindcss filters will only allow conditional rendering... but the data fetching will still occur in all components
  // We have to update this in JS so we can conditionally INCLUDE components (ex: swipe drawers) for performance
  const md = useMedia("(min-width: 768px)", false);
  const supportsHover = useMedia("(hover: hover)", false);

  useEffect(() => {
    setReady(true);
  }, [md]);

  return {
    isPending: !ready,
    // isTabletOrMobileLike,
    isSmallScreen: !md,
    supportsHover,
  };
};
