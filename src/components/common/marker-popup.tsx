import { Popup } from "react-leaflet";
import { formatDistanceToNow } from "date-fns";
import type { MarkerData } from "./map";

interface MarkerPopupProps {
  marker: MarkerData;
}

const navStatusLabels: Record<number, string> = {
  0: "Under way using engine",
  1: "At anchor",
  2: "Not under command",
  3: "Restricted maneuverability",
  4: "Constrained by draught",
  5: "Moored",
  6: "Aground",
  7: "Fishing",
  8: "Sailing",
  9: "Reserved",
  10: "Reserved",
  11: "Towing",
  12: "Pushing",
  13: "Reserved",
  14: "AIS-SART",
  15: "Not defined",
};

export function MarkerPopup({ marker }: MarkerPopupProps) {
  const pos = marker.positions[0];
  const updatedAgo = formatDistanceToNow(new Date(pos.timestamp), {
    addSuffix: true,
  });

  return (
    <Popup>
      <div className="text-xs space-y-0.5 font-medium text-muted-foreground">
        <div>
          <b>MMSI:</b> {marker.mmsi}
        </div>
        <div>
          <b>Status:</b>{" "}
          {navStatusLabels[pos.navstatus] ?? `Unknown (${pos.navstatus})`}
        </div>
        <div>
          <b>Lat/Lon:</b> {pos.lat.toFixed(5)} / {pos.lon.toFixed(5)}
        </div>
        <div>
          <b>HDG:</b> {pos.hdg}° <b>COG:</b> {pos.cog}° <b>SOG:</b> {pos.sog} kn
        </div>
        <div className="text-[10px] italic mt-1">Updated {updatedAgo}</div>
      </div>
    </Popup>
  );
}
