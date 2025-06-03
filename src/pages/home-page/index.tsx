import { FC, useEffect, useState } from "react";
import MapComponent from "../../components/common/map";
import Sidebar from "../../components/common/sidebar";
import PageTitle from "../../components/common/page-title";
import MobileNotSupported from "../../components/common/mobile-not-suported";

const HomePage: FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (isMobile) {
    return <MobileNotSupported />;
  }

  return (
    <main className="min-h-screen w-screen relative">
      <PageTitle title="Ship Emission Monitoring" />
      <Sidebar />
      <MapComponent markers={null} />
    </main>
  );
};

export default HomePage;
