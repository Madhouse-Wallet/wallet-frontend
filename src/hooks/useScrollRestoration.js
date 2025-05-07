import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const useScrollRestoration = () => {
  const router = useRouter();
  const [scrollPositions, setScrollPositions] = useState({});

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setScrollPositions((prev) => ({
        ...prev,
        [router.asPath]: window.scrollY,
      }));
    };

    const handleRouteChangeComplete = (url) => {
      if (scrollPositions[url]) {
        window.scrollTo(0, scrollPositions[url]);
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router, scrollPositions]);

  return null;
};

export default useScrollRestoration;
