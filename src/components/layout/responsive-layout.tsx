import { useState, useEffect } from "react";
import MobileNotSupported from "../layout/mobile-not-suported";

export default function ResponsiveLayout() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkIsDesktop = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= 1024);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => {
      window.removeEventListener("resize", checkIsDesktop);
    };
  }, []);

  if (!isDesktop) {
    return <MobileNotSupported />;
  }

  return <></>;
}
