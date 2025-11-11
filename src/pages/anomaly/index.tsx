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
        const response = await axios.get(`${VITE_BACKEND_URI}/ais`);
        setShipData(response.data.data);
      } catch (error) {
        console.error("Error fetching ship data:", error);
      }
    };

    fetchShipData();
  }, []);

  console.log("Ship Data:", shipData);


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