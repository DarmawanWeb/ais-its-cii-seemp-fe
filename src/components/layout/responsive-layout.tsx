import { useState, useEffect } from "react";
import MobileNotSupported from "../common/mobile-not-suported";

export default function ResponsiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return <>{children}</>;
}
