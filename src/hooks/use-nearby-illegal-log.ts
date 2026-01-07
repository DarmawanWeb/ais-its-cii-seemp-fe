import { useMemo } from "react";
import { dataIllegalLogs, IllegalLog } from "../pages/ilegal/components/data-illegal-log";
import { calculateDistance } from "../components/common/maps/utils";

export default function useNearbyIllegalLogs(
  lat?: number,
  lng?: number,
  radiusKm?: number
) {
  return useMemo<IllegalLog[]>(() => {
    if (!lat || !lng || !radiusKm) return [];

    return dataIllegalLogs
      .filter((log) => {
        const distance = calculateDistance(lat, lng, log.lintang, log.bujur);
        return distance <= radiusKm;
      })
      .sort((a, b) => {
        const distA = calculateDistance(lat, lng, a.lintang, a.bujur);
        const distB = calculateDistance(lat, lng, b.lintang, b.bujur);
        return distA - distB;
      });
  }, [lat, lng, radiusKm]);
}