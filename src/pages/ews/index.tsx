import axios from "axios";
import { FC, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import EarlyWarningSystemCard from "./components/ews-card";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData } from "../../components/common/map";
import MapComponent from "../../components/common/map";

const EWSPage: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mmsiParam = urlParams.get("mmsi");
    if (mmsiParam) setSelectedMmsi(mmsiParam);
  }, [location.search]);

  useEffect(() => {
    const fetchAisData = async () => {
      try {
        const res = await axios.get(`${VITE_BACKEND_URI}/ais`);
        const allData = res.data.data;
        let i = 0;
        const chunkSize = 10;
        const interval = setInterval(() => {
          setShipData((prev) => [...prev, ...allData.slice(i, i + chunkSize)]);
          i += chunkSize;
          if (i >= allData.length) {
            clearInterval(interval);
            setIsLoading(false);
          }
        }, 80);
      } catch (error) {
        console.error("Error fetching AIS data:", error);
        setIsLoading(false);
      }
    };
    fetchAisData();
  }, []);

  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden z-1">
      <aside className="absolute top-0 right-0 z-100 w-[28%] h-full bg-slate-300 p-4 pr-20 overflow-y-auto">
        <EarlyWarningSystemCard markers={shipData} />
      </aside>
      <MapComponent
        markers={shipData}
        selectedMmsi={selectedMmsi}
        setSelectedMmsi={setSelectedMmsi}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-lg">
          Loading ship data...
        </div>
      )}
    </main>
  );
};

export default EWSPage;
