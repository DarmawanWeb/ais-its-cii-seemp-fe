"use client";
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  ZoomControl,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import HeatmapLayer from "./heatmap-layer";
import MapClickHandler from "./map-click-handler";
import MapRadiusCircle from "./map-radius-circle";
import useTileStore from "../../../hooks/use-selected-tile";
import { STADIA_MAPS_API_KEY } from "../../../lib/env";
import { formatRadius } from "./utils";

type HeatmapPoint = {
  lat: number;
  lon: number;
};

  const defaultCenter: [number, number] = [1.143238, 103.856406];

type ClickPayload = {
  lat: number;
  lng: number;
  radius: number;
  zoom: number;
};

type Props = {
  center: [number, number];
  heatmapData?: HeatmapPoint[];
  onMapClick?: (payload: ClickPayload) => void;
};

export default function BaseMap({
  heatmapData,
  onMapClick,
}: Props) {
  const { setSelectedTile } = useTileStore();
  const [zoomLevel, setZoomLevel] = useState(10);
  const [clicked, setClicked] = useState<ClickPayload | null>(null);

  function LayerChangeHandler() {
    useMapEvents({
      baselayerchange: (e) => setSelectedTile(e.name),
      zoom: (e) => {
        const newZoom = e.target.getZoom();
        setZoomLevel(newZoom);
        if (clicked && onMapClick) {
          const updatedPayload: ClickPayload = {
            ...clicked,
            zoom: newZoom,
            radius: calculateRadiusFromZoom(newZoom),
          };
          setClicked(updatedPayload);
          onMapClick(updatedPayload);
        }
      },
    });
    return null;
  }

  const calculateRadiusFromZoom = (zoom: number): number => {
    if (zoom >= 18) return 0.5;
    if (zoom >= 17) return 0.75;
    if (zoom >= 16) return 1;
    if (zoom >= 15) return 1.5;
    if (zoom >= 14) return 2;
    if (zoom >= 13) return 3;
    if (zoom >= 12) return 5;
    if (zoom >= 11) return 7;
    if (zoom >= 10) return 10;
    if (zoom >= 9) return 15;
    if (zoom >= 8) return 25;
    if (zoom >= 7) return 40;
    if (zoom >= 6) return 60;
    if (zoom >= 5) return 100;
    if (zoom >= 4) return 150;
    if (zoom >= 3) return 250;
    if (zoom >= 2) return 500;
    if (zoom >= 1) return 1000;
    return 2000;
  };

  const handleClick = (payload: ClickPayload) => {
    setClicked(payload);
    onMapClick?.(payload);
  };

  return (
    <div className="relative w-full h-full">
  <MapContainer
  center={defaultCenter}
  zoom={zoomLevel}
  style={{ height: "100vh", width: "100%" }}
  zoomControl={false}
>

        <LayerChangeHandler />
        <MapClickHandler onClick={handleClick} />

        {/* Heatmap Layer */}
        {heatmapData && heatmapData.length > 0 && (
          <HeatmapLayer data={heatmapData} />
        )}

        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer name="Leaflet">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer checked name="Default">
            <TileLayer
              url={`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_MAPS_API_KEY}`}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
        </LayersControl>

        {clicked && (
          <>
            <MapRadiusCircle
              lat={clicked.lat}
              lng={clicked.lng}
              radiusKm={clicked.radius}
            />
          </>
        )}

        <ZoomControl position="bottomleft" />
      </MapContainer>

      {clicked && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-999 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
              <span className="text-gray-600 dark:text-gray-400">Radius:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {formatRadius(clicked.radius)}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Zoom:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {clicked.zoom}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}