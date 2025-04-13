import { FC } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { Ship } from "lucide-react";
import { Button } from "../../../components/ui/button";

export interface ShipData {
  name: string;
  mmsi: string;
  imo: string;
  flag: string;
  type: string;
  foto: string;
  lwl: number;
  capacity: number;
  breadth: number;
  draft: number;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  port: string;
}

export interface ShipInfoProps {
  shipData: ShipData | null;
}

const ShipInfoCard: FC<ShipInfoProps> = ({ shipData }) => {
  return (
    <Card className="h-full">
      <CardHeader className="bg-blue-200 text-black p-2 rounded-t-lg -mt-6">
        <h3 className="text-lg font-semibold ml-4 text-center">
          Ship Information
        </h3>
      </CardHeader>
      <CardContent className="text-sm -mt-3 space-y-2 h-full">
        {shipData ? (
          <section className="w-full flex flex-col justify-between h-full">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Name</div>
              <div>{shipData.name}</div>
              <div className="font-semibold">MMSI</div>
              <div>{shipData.mmsi}</div>
              <div className="font-semibold">IMO</div>
              <div>{shipData.imo}</div>
              <div className="font-semibold">Flag</div>
              <div>{shipData.flag}</div>
              <div className="font-semibold">Type</div>
              <div>{shipData.type}</div>
              <div className="font-semibold">Capacity</div>
              <div>{shipData.capacity}</div>
              <div className="font-semibold">LWL</div>
              <div>{shipData.lwl}</div>
              <div className="font-semibold">Breadth</div>
              <div>{shipData.breadth}</div>
              <div className="font-semibold">Draft</div>
              <div>{shipData.draft}</div>
              <div className="font-semibold">Latitude</div>
              <div>{shipData.lat}</div>
              <div className="font-semibold">Longitude</div>
              <div>{shipData.lon}</div>
              <div className="font-semibold">Speed (SOG)</div>
              <div>{shipData.sog}</div>
              <div className="font-semibold">Course (COG)</div>
              <div>{shipData.cog}</div>
              <div className="font-semibold">Port</div>
              <div>{shipData.port}</div>
            </div>
            <div className="flex justify-center mt-4">
              <img
                src={shipData.foto}
                alt="Ship"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
            <Button variant="default" className="w-40 ml-7 mt-4">
              Calculate CII
            </Button>
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 h-full">
            <Ship className="text-gray-400" size={40} />
            <div className="text-sm text-gray-600">
              Ship data will appear here
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipInfoCard;
