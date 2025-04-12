import { FC, useState } from "react";
import MapComponent from "../../components/common/map";
import Sidebar from "../../components/common/sidebar";
import PageTitle from "../../components/common/page-title";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import ShipInfoCard from "./components/ship-info-card";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import CiiValueCard from "./components/cii-value-card";
import { LineChart } from "lucide-react";

const SEEMPPage: FC = () => {
  const shipData = [
    { id: 1, mmsi: "123456789" },
    { id: 2, mmsi: "987654321" },
    { id: 3, mmsi: "654321987" },
    { id: 4, mmsi: "112233445" },
    { id: 5, mmsi: "443322110" },
    { id: 6, mmsi: "567890123" },
    { id: 7, mmsi: "890123456" },
    { id: 8, mmsi: "234567890" },
    { id: 9, mmsi: "345678901" },
    { id: 10, mmsi: "456789012" },
    { id: 11, mmsi: "567890124" },
    { id: 12, mmsi: "678901235" },
    { id: 13, mmsi: "789012346" },
    { id: 14, mmsi: "890123457" },
    { id: 15, mmsi: "901234568" },
    { id: 16, mmsi: "123456780" },
    { id: 17, mmsi: "234567891" },
    { id: 18, mmsi: "345678902" },
    { id: 19, mmsi: "456789013" },
    { id: 20, mmsi: "567890125" },
    { id: 21, mmsi: "678901236" },
    { id: 22, mmsi: "789012347" },
    { id: 23, mmsi: "890123458" },
    { id: 24, mmsi: "901234569" },
    { id: 25, mmsi: "234567892" },
    { id: 26, mmsi: "345678903" },
    { id: 27, mmsi: "456789014" },
    { id: 28, mmsi: "567890126" },
    { id: 29, mmsi: "678901237" },
    { id: 30, mmsi: "789012348" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShips, setFilteredShips] = useState(shipData);

  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredShips(shipData);
    } else {
      setFilteredShips(shipData.filter((ship) => ship.mmsi.includes(query)));
    }
  };

  const handleShipClick = (mmsi: string) => {
    navigate(`?mmsi=${mmsi}`);
    setSearchQuery("");
  };

  return (
    <main className="h-screen w-screen relative bg-gray-100 overflow-hidden">
      <section className="absolute top-0 right-0 z-100 w-2/5 h-full bg-slate-300 p-4">
        <div className="mb-4 mr-20 relative">
          <Input
            placeholder="Search ships..."
            className="w-full p-3 rounded-lg border border-gray-400 bg-white pl-10" // Added padding for the icon
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="text-gray-600" size={20} />
          </div>
          {searchQuery && filteredShips.length > 0 && (
            <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto absolute z-999 w-full">
              {filteredShips.map((ship) => (
                <div
                  key={ship.id}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleShipClick(ship.mmsi)}
                >
                  {ship.mmsi}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-rows-7 gap-2 mb-6 mr-20 h-[89vh]">
          <ShipInfoCard shipData={null} />
          <div className="grid grid-cols-2 gap-2 row-span-3">
            <CiiValueCard ciiData={null} ciiDataRating={null} />
            <Card>
              <CardHeader className="bg-blue-200 text-black p-1 -mt-6 rounded-t-lg">
                <h3 className="text-xl font-semibold text-center">
                  CII Grafik
                </h3>
              </CardHeader>
              <CardContent className="p-4 h-full">
                <div className="flex flex-col items-center justify-center space-y-2 h-full">
                  <LineChart className="text-gray-400" size={40} />
                  <div className="text-sm text-gray-600">
                    Data will appear here
                  </div>
                </div>
              </CardContent>
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
