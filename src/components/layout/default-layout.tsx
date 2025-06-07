import { FC, ReactNode, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Sidebar from "../common/sidebar";
import PageTitle from "../common/page-title";
import MobileNotSupported from "./mobile-not-suported";

interface DefaultLayoutProps {
  title: string;
  pageTitle: string;
  children: ReactNode;
}

const DefaultLayout: FC<DefaultLayoutProps> = ({
  title,
  pageTitle,
  children,
}) => {
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

  return (
    <>
      <Helmet>
        <title>AIS ITS | {title}</title>
        <meta name="description" content="Ship Emission Monitoring Dashboard" />
      </Helmet>
      <main className="min-h-screen w-screen relative">
        <PageTitle title={pageTitle} />
        <Sidebar />
        {children}
      </main>
    </>
  );
};

export default DefaultLayout;
