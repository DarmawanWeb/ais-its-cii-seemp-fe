import { FC } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  useMapEvents,
  Popup,
  ZoomControl, // Import ZoomControl
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useTileStore from "../../hooks/use-selected-tile";
import { STADIA_MAPS_API_KEY } from "../../lib/env";

enum ShipSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export interface MarkerData {
  mmsi: string;
  coordinates: [number, number];
  sog: number;
  cog: number;
  heading: number;
  type: string;
  size: ShipSize;
}

interface MapComponentProps {
  markers: MarkerData[] | null;
}

const MapComponent: FC<MapComponentProps> = ({ markers }) => {
  const { setSelectedTile, selectedTile } = useTileStore();

  const LayerChangeHandler: FC = () => {
    useMapEvents({
      baselayerchange: (event: L.LayersControlEvent) => {
        setSelectedTile(event.name);
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[-7.2874102, 112.7780475]}
      zoom={13}
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

      {markers?.map((marker, index) => (
        <Marker key={`marker-${index}`} position={marker.coordinates}>
          <Popup />
        </Marker>
      ))}

      {/* Add the ZoomControl at bottom-left */}
      <ZoomControl position="bottomleft" />
    </MapContainer>
  );
};

export default MapComponent;
