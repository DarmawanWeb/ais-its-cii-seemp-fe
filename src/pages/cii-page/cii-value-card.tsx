import { FC } from "react";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import DataNotFound from "../../components/common/data-not-found";

export interface IFuelConsumption {
  fuelConsumptionMeTon: number;
  fuelConsumptionAeTon: number;
  totalFuelConsumptionTon: number;
}

export interface ICIICalculation {
  ciiRequired: number;
  ciiAttained: number;
  ciiRating: number;
  ciiGrade: string;
  totalDistance: number;
  fuelConsumption: IFuelConsumption;
}

export interface CiiValueCardProps {
  cii: ICIICalculation | null;
}

const formatNumber = (value: number) => value.toFixed(5);

const LabelValueRow: FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <>
    <b className="col-span-2">{label}</b>
    <p>: {value}</p>
  </>
);

const CiiValueCard: FC<CiiValueCardProps> = ({ cii }) => {
  const renderCiiContent = (cii: ICIICalculation) => (
    <section className="text-xs flex flex-col h-full justify-between">
      <div className="h-0.5 bg-black w-full my-1" />
      <div className="grid grid-cols-3 gap-y-1 ml-4">
        <LabelValueRow
          label="ME Fuel Consumption"
          value={`${formatNumber(
            cii.fuelConsumption.fuelConsumptionMeTon
          )} ton`}
        />
        <LabelValueRow
          label="AE Fuel Consumption"
          value={`${formatNumber(
            cii.fuelConsumption.fuelConsumptionAeTon
          )} ton`}
        />
        <LabelValueRow
          label="Total Fuel Consumption"
          value={`${formatNumber(
            cii.fuelConsumption.totalFuelConsumptionTon
          )} ton`}
        />
      </div>
      <div className="h-0.5 bg-black w-full my-2" />
      <div className="grid grid-cols-3 gap-y-1 ml-4">
        <LabelValueRow
          label="Total Distance"
          value={`${formatNumber(cii.totalDistance)} m`}
        />
        <LabelValueRow
          label="CII Required"
          value={formatNumber(cii.ciiRequired)}
        />
        <LabelValueRow
          label="CII Attained"
          value={formatNumber(cii.ciiAttained)}
        />
      </div>
      <div className="h-0.5 bg-black w-full my-2" />
      <div className="grid grid-cols-3 gap-y-1 ml-4">
        <LabelValueRow
          label="CII  Rating"
          value={formatNumber(cii.ciiRating)}
        />
        <LabelValueRow label="CII Grade" value={cii.ciiGrade} />
      </div>
    </section>
  );

  return (
    <Card className="row-span-5 h-[260px] w-md overflow-auto rounded-md border border-gray-300">
      <CardHeader className="bg-blue-200 px-3 py-2 text-black">
        <h3 className="text-sm font-semibold text-center">CII Value</h3>
      </CardHeader>
      <CardContent className="h-full p-2 -mt-6 space-y-2 text-sm">
        {cii ? renderCiiContent(cii) : <DataNotFound />}
      </CardContent>
    </Card>
  );
};

export default CiiValueCard;
