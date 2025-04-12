// ShipInfoCard.tsx
import { FC } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";

interface ShipInfoProps {
  shipData: { id: number; name: string; value: string }[];
}

const ShipInfoCard: FC<ShipInfoProps> = ({ shipData }) => {
  return (
    <Card>
      <CardHeader className="bg-blue-200 text-black p-2 rounded-t-lg -mt-6">
        <h3 className="text-lg font-semibold ml-4">Ship Information</h3>
      </CardHeader>
      <CardContent className="text-xs -mt-3 space-y-2">
        {shipData.map(({ id, name, value }) => (
          <div key={id} className="grid grid-cols-2 gap-2">
            <div className="font-semibold">{name}</div>
            <div>{value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ShipInfoCard;
