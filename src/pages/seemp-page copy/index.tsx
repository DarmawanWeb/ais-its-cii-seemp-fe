import { FC } from "react";
import MapComponent from "../../components/common/map";
import Sidebar from "../../components/common/sidebar";
import PageTitle from "../../components/common/page-title";
import { Input } from "../../components/ui/input";
import ShipInfoCard from "./components/ship-info-card";
import CiiValueCard from "././components/cii-value-card";

import { Card, CardHeader, CardContent } from "../../components/ui/card";

const SEEMPPage: FC = () => {
  const shipData = [
    { id: 1, name: "Ship Name", value: "Dharma Ferry VIII" },
    { id: 2, name: "Flag", value: "Indonesia" },
    { id: 3, name: "IMO Number", value: "9037941" },
    { id: 4, name: "Type", value: "Ro-ro Passenger" },
    { id: 5, name: "Speed (SOG)", value: "12 Knots" },
    { id: 6, name: "Course (COG)", value: "150°" },
    { id: 7, name: "Latitude", value: "-8.7369366" },
    { id: 8, name: "Longitude", value: "116.04695" },
    { id: 9, name: "LWL", value: "69.72 m" },
    { id: 10, name: "Breadth", value: "16.3 m" },
    { id: 11, name: "Draft", value: "4.1 m" },
  ];

  const ciiData1 = [
    { id: 4, name: "CII Required", value: "62.57" },
    { id: 5, name: "CII Attained", value: "59.62" },
  ];
  const ciiData2 = [
    { id: 6, name: "CII Rating", value: "C" },
    { id: 7, name: "CII Rating Number", value: "0.952" },
  ];

  return (
    <main className="h-screen w-screen relative bg-gray-100 overflow-hidden">
      <section className="absolute top-0 right-0 z-100 w-2/5 h-full bg-slate-300 p-4">
        <div className="mb-4 mr-20">
          <Input
            placeholder="Search ships..."
            className="w-full p-3 rounded-lg border border-gray-400 bg-white"
          />
        </div>
        <div className="grid grid-rows-2 gap-2 mb-6 mr-20 h-[90vh]">
          <ShipInfoCard shipData={shipData} />
          <div className="grid grid-cols-2 gap-6">
            <CiiValueCard ciiData={ciiData1} ciiDataRating={ciiData2} />
            <Card>
              <CardHeader className="bg-blue-200 text-black p-1 -mt-6 rounded-t-lg">
                <h3 className="text-xl font-semibold">CII Graphical Chart</h3>
              </CardHeader>
              <CardContent className="p-4"></CardContent>
            </Card>
          </div>
        </div>
      </section>
      <PageTitle title="SEEMP Recommendation" />
      <Sidebar />
      <MapComponent markers={null} />
    </main>
  );
};

export default SEEMPPage;
