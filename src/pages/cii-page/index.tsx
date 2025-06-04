import { FC, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Search } from "lucide-react";

import MapComponent from "../../components/common/map";
import { Input } from "../../components/ui/input";
import CIISection from "./components/cii-section";
import ShipInfoCard from "./components/ship-info-card";

import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData } from "../../components/common/map";
import { ShipData } from "./components/ship-info-card";
import { ICIICalculation } from "./cii-value-card";

export type ciiGrafik = {
  ciiData: {
    ciiAttained: number;
    timestamp: string;
  }[];
  ddVector: {
    d1: number;
    d2: number;
    d3: number;
    d4: number;
  };
} | null;

const CIIPage: FC = () => {
  const [ships, setShips] = useState<MarkerData[]>([]);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [shipDetail, setShipDetail] = useState<ShipData | null>(null);
  const [ciiData, setCiiData] = useState<ICIICalculation | null>(null);
  const [ciiGrafik, setCiiGrafik] = useState<ciiGrafik>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCiiSection, setShowCiiSection] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const mmsi = new URLSearchParams(location.search).get("mmsi");
    if (mmsi) setSelectedMmsi(mmsi);
  }, [location.search]);

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const { data } = await axios.get(`${VITE_BACKEND_URI}/ais`);
        setShips(data.data);
      } catch (error) {
        console.error("Error fetching ship data:", error);
      }
    };
    fetchShips();
  }, []);

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

  useEffect(() => {
    if (!selectedMmsi) return;
    setShowCiiSection(false);
    const fetchCii = async () => {
      try {
        const { data } = await axios.get(
          `${VITE_BACKEND_URI}/cii/daily/${selectedMmsi}/latest`
        );
        setCiiData(data.data.cii[0].cii);
      } catch (error) {
        setCiiData(null);
        console.error("Error fetching CII data:", error);
      }
    };
    fetchCii();
  }, [selectedMmsi]);

  useEffect(() => {
    if (!selectedMmsi) return;
    const fetchGrafik = async () => {
      try {
        const { data } = await axios.get(
          `${VITE_BACKEND_URI}/cii/daily/${selectedMmsi}/attained`
        );
        setCiiGrafik(data.data);
      } catch (error) {
        setCiiGrafik(null);
        console.error("Error fetching CII grafik:", error);
      }
    };
    fetchGrafik();
  }, [selectedMmsi]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleShipClick = (mmsi: string) => {
    navigate(`?mmsi=${mmsi}`);
    setSearchQuery("");
  };

  const filteredShips = searchQuery
    ? ships.filter((ship) => ship.mmsi.includes(searchQuery))
    : [];

  const toggleCiiSection = () => {
    setShowCiiSection(!showCiiSection);
  };

  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden z-0">
      <aside className="absolute top-0 right-0 z-100 w-[28%] h-full bg-slate-300 p-4">
        <div className="mb-4 mr-16 relative">
          <Input
            placeholder="Search ships..."
            className="w-full p-3 rounded-lg border border-gray-400 bg-white pl-10"
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
                  key={ship.mmsi}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleShipClick(ship.mmsi)}
                >
                  {ship.mmsi}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mr-16 h-[90vh]">
          <ShipInfoCard
            shipData={shipDetail}
            toogleCiiSection={toggleCiiSection}
            showCiiSection={showCiiSection}
          />
        </div>
      </aside>

      <CIISection
        ciiGrafik={ciiGrafik}
        ciiData={ciiData}
        show={showCiiSection}
      />

      <MapComponent
        markers={ships}
        selectedMmsi={selectedMmsi}
        setSelectedMmsi={setSelectedMmsi}
      />
    </main>
  );
};

export default CIIPage;
