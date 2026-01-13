import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import BaseMap from "../../components/common/maps";
import { VITE_BACKEND_URI } from "../../lib/env";
import IllegalLogSidebar from "../ilegal/components/illegal-transhipment-card";
import type { IllegalLog } from "../ilegal/components/data-illegal-log";
import { calculateDistance } from "../../components/common/maps/utils";

type ClickPayload = {
  lat: number;
  lng: number;
  radius: number;
  zoom: number;
};

type LogsApiResponse = {
  message: string;
  data: IllegalLog[];
  total: number;
  success: boolean;
};

export default function IllegalTranshipmentLogPage() {
  const [clicked, setClicked] = useState<ClickPayload | null>(null);
  const [allLogs, setAllLogs] = useState<IllegalLog[]>([]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (allLogs.length > 0) {
      return [allLogs[0].lintang, allLogs[0].bujur];
    }
    return [1.44, 125.17];
  }, [allLogs]);

  useEffect(() => {
    let cancelled = false;

    const fetchLogs = async () => {
      try {
        const response = await axios.get<LogsApiResponse>(
          `${VITE_BACKEND_URI}/illegal-transhipment/logs`,
        );
        if (cancelled) return;
        if (response.data?.success && Array.isArray(response.data.data)) {
          setAllLogs(response.data.data);
        } else {
          setAllLogs([]);
        }
      } catch (error) {
        if (!cancelled) setAllLogs([]);
        console.error("Error fetching illegal transhipment logs:", error);
      }
    };

    fetchLogs();
    return () => {
      cancelled = true;
    };
  }, []);

  const logs = useMemo<IllegalLog[]>(() => {
    if (!clicked) return [];
    const { lat, lng, radius } = clicked;
    if (!lat || !lng || !radius) return [];

    return allLogs
      .filter((log) => {
        const distance = calculateDistance(lat, lng, log.lintang, log.bujur);
        return distance <= radius;
      })
      .sort((a, b) => {
        const distA = calculateDistance(lat, lng, a.lintang, a.bujur);
        const distB = calculateDistance(lat, lng, b.lintang, b.bujur);
        return distA - distB;
      });
  }, [allLogs, clicked]);

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
          title="Illegal Transhipment Log"
        />
      </aside>

      <BaseMap
        center={mapCenter}
        heatmapData={allLogs.map((l) => ({
          lat: l.lintang,
          lon: l.bujur,
        }))}
        onMapClick={handleMapClick}
      />
    </main>
  );
}
