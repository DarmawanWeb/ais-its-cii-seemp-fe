import { FC, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import useTileStore from "../../hooks/use-selected-tile";
import { MarkerPopup } from "./marker-popup";
import { STADIA_MAPS_API_KEY } from "../../lib/env";

export interface IAisPosition {
  navstatus: number;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  hdg: number;
  timestamp: Date;
}

export interface MarkerData {
  mmsi: string;
  icon?: string;
  positions: IAisPosition[];
}

export interface MapComponentProps {
  markers: MarkerData[] | null;
}

const MapComponent: FC<MapComponentProps> = ({ markers }) => {
  const { setSelectedTile, selectedTile } = useTileStore();
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mmsiParam = urlParams.get("mmsi");
    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }
  }, []);

  const LayerChangeHandler: FC = () => {
    useMapEvents({
      baselayerchange: (event: L.LayersControlEvent) => {
        setSelectedTile(event.name);
      },
    });
    return null;
  };

  const getIcon = (
    heading: number,
    isSelected: boolean,
    icon: string | undefined
  ) => {
    const iconSize: [number, number] = isSelected ? [20, 30] : [10, 15];

    const iconUrl = icon ? `ships/${icon}.png` : "ships/unknown.png";

    return L.divIcon({
      className: "custom-icon",
      html: `<img src="${iconUrl}" style="width: ${iconSize[0]}px; height: ${iconSize[1]}px; transform: rotate(${heading}deg);" />`,
      iconSize,
      iconAnchor: [6, 16],
      popupAnchor: [0, -32],
    });
  };

  const handleMarkerClick = (mmsi: string) => {
    setSelectedMmsi(mmsi);
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("mmsi", mmsi);
    window.history.pushState(null, "", "?" + urlParams.toString());
  };

  return (
    <MapContainer
      center={[-8.452174, 115.843191]}
      zoom={10}
      style={{ height: "100vh", width: "100vw" }}
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <LayerChangeHandler />
      <LayersControl position="bottomleft">
        <LayersControl.BaseLayer
          checked={selectedTile === "Leaflet"}
          name="Leaflet"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer
          checked={selectedTile === "Default"}
          name="Default"
        >
          <TileLayer
            url={`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_MAPS_API_KEY}`}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer
          checked={selectedTile === "Satellite"}
          name="Satellite"
        >
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>
      </LayersControl>
      {markers?.map((marker, index) => {
        const isSelected = marker.mmsi === selectedMmsi;
        return (
          <Marker
            key={`marker-${index}`}
            position={[marker.positions[0].lat, marker.positions[0].lon]}
            icon={getIcon(marker.positions[0].cog, isSelected, marker.icon)}
            eventHandlers={{
              click: () => handleMarkerClick(marker.mmsi),
            }}
          >
            <MarkerPopup marker={marker} />
          </Marker>
        );
      })}
      <ZoomControl position="bottomleft" />
    </MapContainer>
  );
};

export default MapComponent;
