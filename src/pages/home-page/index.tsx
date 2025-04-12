import { FC } from "react";
import MapComponent from "../../components/common/map";
import Sidebar from "../../components/common/sidebar";
import PageTitle from "../../components/common/page-title";

const HomePage: FC = () => {
  return (
    <main className="min-h-screen w-screen relative">
      <PageTitle title="Ship Emission Monitoring" />
      <Sidebar />
      <MapComponent markers={null} />
    </main>
  );
};

export default HomePage;
