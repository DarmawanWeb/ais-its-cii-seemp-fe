import { useState } from "react";
import BaseMap from "../../components/common/maps";
import IllegalLogSidebar from "./components/illegal-transhipment-card";
import useNearbyIllegalLogs from "../../hooks/use-nearby-illegal-log";
import { dataIllegalLogs } from "./components/data-illegal-log";

type ClickPayload = {
  lat: number;
  lng: number;
  radius: number;
  zoom: number;
};

export default function IllegalLogPage() {
  const [clicked, setClicked] = useState<ClickPayload | null>(null);

  const logs = useNearbyIllegalLogs(
    clicked?.lat,
    clicked?.lng,
    clicked?.radius
  );

  const handleMapClick = (payload: ClickPayload) => {
    setClicked(payload);
  };

  const handleClear = () => {
    setClicked(null);
  };

  return (
       <main className="h-screen w-screen relative bg-gray-300 overflow-hidden z-1">
      <aside className="absolute top-0 right-0 z-999 w-[28%] h-full bg-slate-300 p-4 pr-20">
        <IllegalLogSidebar
              logs={logs}
              onClear={handleClear}
            />
      </aside>

        <BaseMap
          center={[1.44, 125.17]}
          heatmapData={dataIllegalLogs.map((l) => ({
            lat: l.lintang,
            lon: l.bujur,
          }))}
          onMapClick={handleMapClick}
        />
      </main>
  );
}
