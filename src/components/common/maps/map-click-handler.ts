import { useMapEvents } from "react-leaflet";
import { zoomToRadiusKm } from "./utils";

type ClickPayload = {
  lat: number;
  lng: number;
  radius: number;
  zoom: number;
};

export default function MapClickHandler({
  onClick,
}: {
  onClick: (payload: ClickPayload) => void;
}) {
  const map = useMapEvents({
    click(e) {
      const zoom = map.getZoom();
      onClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        zoom,
        radius: zoomToRadiusKm(zoom),
      });
    },
  });

  return null;
}
