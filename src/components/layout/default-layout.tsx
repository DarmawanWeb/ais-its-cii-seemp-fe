import { FC, ReactNode } from "react";
import { Helmet } from "react-helmet";
import ResponsiveLayout from "./responsive-layout";
import Sidebar from "../common/sidebar";
import PageTitle from "../common/page-title";
import MapComponent from "../common/map";

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
        <MapComponent markers={null} />
        <ResponsiveLayout />
      </main>
    </>
  );
};

export default DefaultLayout;
