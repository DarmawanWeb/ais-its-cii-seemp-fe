import axios from "axios";
import { FC, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import ShipInfoCard from "./components/ship-info-card";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData } from "../../components/common/map";
import MapComponent from "../../components/common/map";
import TelemetryChart from "./components/telemetry-chart";
import { IFuelConsumption } from "./components/telemetry-chart";

import { ShipData } from "./components/ship-info-card";

const TelemetryPage: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [shipDetail, setShipDetail] = useState<ShipData | null>(null);
  const [fuelData, setFuelData] = useState<IFuelConsumption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShips, setFilteredShips] = useState(shipData);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mmsiParam = urlParams.get("mmsi");
    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (!selectedMmsi) return setShipDetail(null);
    const fetchDetails = async () => {
      try {
        const { data } = await axios.get(
          `${VITE_BACKEND_URI}/ships/data/secondary/mmsi/${selectedMmsi}`
        );
        setShipDetail(data.data);
      } catch (error) {
        console.error("Error fetching ship detail:", error);
      }
    };
    fetchDetails();
  }, [selectedMmsi]);

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

  useEffect(() => {
    const fetchShipData = async () => {
      try {
        const response = await axios.get(`${VITE_BACKEND_URI}/ais`);
        setShipData(response.data.data);
      } catch (error) {
        console.error("Error fetching ship data:", error);
      }
    };

    fetchShipData();
  }, []);

  useEffect(() => {
    const fetchFuelData = async () => {
      if (!selectedMmsi) return;
      try {
        const { data } = await axios.get(
          `${VITE_BACKEND_URI}/telemetry/${selectedMmsi}`
        );
        setFuelData(data.data.fuel);
      } catch (error) {
        setFuelData([]);
        console.error("Error fetching telemetry data:", error);
      }
    };
    fetchFuelData();
  }, [selectedMmsi]);

  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden z-1">
      <aside className="absolute top-0 right-0 z-100 w-7/20 h-full bg-slate-300 p-3 rounded-l-xl">
        <div className="mb-2 mr-16 relative mt-2">
          <Input
            placeholder="Search ships..."
            className="w-full p-1 rounded-md border border-gray-400 bg-white pl-8 text-xs"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <Search className="text-gray-600" size={16} />
          </div>
          {searchQuery && filteredShips.length > 0 && (
            <div className="mt-2 bg-white border rounded-md shadow-lg text-sm max-h-40 overflow-y-auto absolute z-999 w-full ">
              {filteredShips.map((ship) => (
                <div
                  key={ship.mmsi}
                  className="block px-3 py-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleShipClick(ship.mmsi)}
                >
                  {ship.mmsi}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-rows-9 gap-4 mb-4 mr-16 h-[90vh]">
          <ShipInfoCard shipData={shipDetail} />
          <TelemetryChart fuel={fuelData} />
        </div>
      </aside>

      <MapComponent
        markers={shipData}
        selectedMmsi={selectedMmsi}
        setSelectedMmsi={setSelectedMmsi}
      />
    </main>
  );
};

export default TelemetryPage;
