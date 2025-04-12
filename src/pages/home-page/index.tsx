import { FC } from "react";
import MapComponent from "../../components/common/map";
import Sidebar from "../../components/common/sidebar";

const HomePage: FC = () => {
  return (
    <main className="min-h-screen w-screen relative">
      <Sidebar />

      <MapComponent markers={null} />
    </main>
  );
};

export default HomePage;
