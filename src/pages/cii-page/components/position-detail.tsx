import { IAisPosition } from "../../../components/common/map";
import { LabelValuePair } from "../../../components/common/label-value-pair";
import { formatDistanceToNow } from "date-fns";
import { getNavStatusLabel } from "../../../lib/navstatus-label";

export const PositionDetails = ({ pos }: { pos: IAisPosition[] }) => {
  const updatedAgo = formatDistanceToNow(new Date(pos[0].timestamp), {
    addSuffix: true,
  });

  return (
    <div className="grid grid-cols-3 gap-y-0.5 text-xs">
      <h4 className="font-semibold text-sm col-span-3 pb-1">
        Current Position
      </h4>
      <LabelValuePair label="Latitude" value={pos[0].lat} />
      <LabelValuePair label="Longitude" value={pos[0].lon} />
      <LabelValuePair label="Speed" value={`${pos[0].sog} kn`} />
      <LabelValuePair label="Course" value={`${pos[0].cog}°`} />
      <LabelValuePair label="Heading" value={`${pos[0].hdg}°`} />
      <LabelValuePair
        label="Nav Status"
        value={getNavStatusLabel(pos[0].navstatus)}
      />
      <div className="text-[10px] italic mt-1 col-span-2 text-center">
        Updated {updatedAgo}
      </div>
    </div>
  );
};
