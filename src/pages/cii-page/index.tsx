import { FC } from "react";
import MapComponent from "../../components/common/map";
import Sidebar from "../../components/common/sidebar";
import PageTitle from "../../components/common/page-title";

const CIIPage: FC = () => {
  return (
    <main className="min-h-screen w-screen relative">
      <PageTitle title="CII Calculation" />
      <Sidebar />
      <MapComponent markers={null} />
    </main>
  );
};

export default CIIPage;
