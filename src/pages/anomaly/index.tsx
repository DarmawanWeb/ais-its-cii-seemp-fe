import axios from "axios";
import { FC, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavstatusAnomalyCard from "./components/navstatus-anomaly-card";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData } from "../../components/common/map";
import MapComponent from "../../components/common/map";




const AnomalyPage: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mmsiParam = urlParams.get("mmsi");
    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }
  }, [location.search]);


  useEffect(() => {
    const fetchShipData = async () => {
      try {
        const response = await axios.get(`${VITE_BACKEND_URI}/ais`, {
          params: { hours: 12 },
        });
        setShipData([]);
        const allData = response.data.data;
        let i = 0;
        const chunkSize = 10;
        const interval = setInterval(() => {
          setShipData((prev) => [...prev, ...allData.slice(i, i + chunkSize)]);
          i += chunkSize;
          if (i >= allData.length) clearInterval(interval);
        }, 80);
      } catch (error) {
        console.error("Error fetching ship data:", error);
      }
    };
    fetchShipData();
    const interval = setInterval(fetchShipData, 10000);
    return () => clearInterval(interval);
  }, []);


  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden z-1">
        <aside className="absolute top-0 right-0 z-100 w-[28%] h-full bg-slate-300 p-4 pr-20">
          <NavstatusAnomalyCard markers={shipData} />
      </aside>

      <MapComponent
        markers={shipData}
        selectedMmsi={selectedMmsi}
        setSelectedMmsi={setSelectedMmsi}
      />
    </main>
  );
};
export default AnomalyPage;