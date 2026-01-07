"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L, { Map as LeafletMap } from "leaflet";

import "leaflet.heat";

type HeatmapPoint = {
  lat: number;
  lon: number;
};

// deklarasi tipe minimal untuk plugin leaflet.heat
type HeatLayer = L.Layer & {
  addTo: (map: LeafletMap) => HeatLayer;
};

type HeatLayerFactory = {
  heatLayer: (
    points: [number, number, number][],
    options?: Record<string, unknown>
  ) => HeatLayer;
};

export default function HeatmapLayer({
  data,
}: {
  data: HeatmapPoint[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || data.length === 0) return;

    const points: [number, number, number][] = data.map((p) => [
      p.lat,
      p.lon,
      1,
    ]);

    const factory = L as unknown as HeatLayerFactory;

    if (typeof factory.heatLayer === "function") {
      const heatLayer = factory.heatLayer(points, {
        radius: 25,
        blur: 20,
        maxZoom: 12,
        minOpacity: 0.4,
        gradient: {
          0.0: "#3b82f6",
          0.5: "#fbbf24",
          1.0: "#ef4444",
        },
      });

      (heatLayer as HeatLayer).addTo(map as LeafletMap);

      return () => {
        map.removeLayer(heatLayer);
      };
    } else {
      console.warn("Leaflet.heat plugin not loaded");
    }
  }, [map, data]);

  return null;
}
