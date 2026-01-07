import { Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { formatRadius } from "./utils";

type Props = {
  lat: number;
  lng: number;
  radiusKm: number;
};

// Create custom icon for center marker
const centerIcon = new L.DivIcon({
  className: 'custom-center-marker',
  html: `
    <div style="
      width: 16px;
      height: 16px;
      background-color: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function MapRadiusCircle({
  lat,
  lng,
  radiusKm,
}: Props) {
  return (
    <>
      {/* Search radius circle */}
      <Circle
        center={[lat, lng]}
        radius={radiusKm * 1000} // Convert km to meters
        pathOptions={{
          color: "#3b82f6",
          fillColor: "#3b82f6",
          dashArray: "10, 10",
          fillOpacity: 0.1,
          weight: 2,
        }}
      />

      {/* Center marker */}
      <Marker 
        position={[lat, lng]} 
        icon={centerIcon}
      >
        <Popup>
          <div className="text-sm">
            <p className="font-bold text-gray-900 mb-1">Search Center</p>
            <p className="text-gray-600 text-xs mb-2">
              {lat.toFixed(6)}°, {lng.toFixed(6)}°
            </p>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">Search Radius:</p>
              <p className="text-base font-bold text-blue-600">
                {formatRadius(radiusKm)}
              </p>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}