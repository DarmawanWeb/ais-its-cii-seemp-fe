import { FC, useState } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { VesselDetails } from "./ship-detail";
import { PositionDetails } from "./position-detail";
import { AlertTriangle } from "lucide-react";
import { IAisPosition } from "../../../components/common/map";

export interface ShipData {
  NAME: string;
  MMSI: string;
  IMO: string;
  FLAG: string;
  TYPE: string;
  BUILT: number;
  GT: number;
  DWT: number;
  LOA: number;
  BEAM: number;
  DRAUGHT: number;
  positions: IAisPosition[];
}

export interface ShipInfoProps {
  shipData: ShipData | null;
  onClick: () => void;
}

const ShipInfoCard: FC<ShipInfoProps> = ({ shipData, onClick }) => {
  const [showCII, setShowCII] = useState(false);

  return (
    <Card className="row-span-5 h-full overflow-auto rounded-md border border-gray-300">
      <CardHeader className="bg-blue-200 text-black px-3 py-2">
        <h3 className="text-sm font-semibold text-center">Ship Information</h3>
      </CardHeader>
      <CardContent className="px-3 flex flex-col gap-4">
        {!shipData ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-600 mt-8 gap-2 h-[65vh]">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <span className="text-sm font-medium">Ships Data not found</span>
          </div>
        ) : (
          <>
            <VesselDetails ship={shipData} />
            {shipData.positions && <PositionDetails pos={shipData.positions} />}

            <div className="flex justify-center">
              <img
                src={
                  shipData.MMSI
                    ? `/assets/ships/${shipData.MMSI}.jpg`
                    : "/assets/ships/no-image.jpg"
                }
                alt="Ship"
                className="max-w-xs rounded-md shadow-md max-h-[190px] w-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/assets/ships/no-image.jpg";
                }}
              />
            </div>

            <div className="flex justify-center">
              <Button
                variant="default"
                size="sm"
                className="w-32"
                onClick={() => {
                  setShowCII(!showCII);
                  onClick();
                }}
              >
                {showCII ? "Hide CII" : "Calculate CII"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipInfoCard;
