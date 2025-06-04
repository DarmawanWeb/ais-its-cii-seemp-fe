import { FC, useState } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { LabelValuePair } from "../../../components/common/label-value-pair";
import { IFuelConsumption } from "../../telemetry-page/components/telemetry-chart";
import DataNotFound from "../../../components/common/data-not-found";

export interface IDdVector {
  d1: number;
  d2: number;
  d3: number;
  d4: number;
}

export interface AnnualCIIWithDDVector {
  year: number;
  ciiRequired: number;
  ciiAttained: number;
  ciiRating: number;
  ciiGrade: string;
  totalDistance: number;
  fuelConsumption: IFuelConsumption;
  ddVector: IDdVector;
}

export interface CiiValueCardProps {
  ciis: AnnualCIIWithDDVector[];
}

const CiiValueCard: FC<CiiValueCardProps> = ({ ciis }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const handleYearChange = (year: string) => {
    const newYear = Number(year);
    setSelectedYear(newYear);
  };

  const renderCiiContent = (cii: AnnualCIIWithDDVector) => (
    <section className="text-md ">
      <div className="h-0.5 bg-black w-full mx-auto my-2"></div>
      <div className="grid grid-cols-2 ml-2">
        <LabelValuePair
          label="Total Distance"
          value={cii.totalDistance.toFixed(2)}
          isExtend={false}
        />
        <LabelValuePair
          label="CII Required"
          value={cii.ciiRequired.toFixed(5)}
          isExtend={false}
        />
        <LabelValuePair
          label="CII Attained "
          value={cii.ciiAttained.toFixed(5)}
          isExtend={false}
        />
      </div>
      <div className="h-0.5 bg-black w-full mx-auto my-2"></div>
      <div className="grid grid-cols-2 ml-2">
        <LabelValuePair
          label="CII Required "
          value={cii.ciiRequired.toFixed(5)}
          isExtend={false}
        />
        <LabelValuePair
          label="CII Rating"
          value={cii.ciiRating.toFixed(5)}
          isExtend={false}
        />
        <LabelValuePair
          label="CII Grade"
          value={cii.ciiGrade}
          isExtend={false}
        />
      </div>
    </section>
  );

  const isDataAvailable = ciis && ciis.length > 0;

  return (
    <Card className="row-span-5 h-full overflow-auto rounded-md border border-gray-300 ">
      <CardHeader className="bg-blue-200 text-black px-3 py-2">
        <h3 className="text-sm font-semibold text-center">CII Value</h3>
      </CardHeader>
      <CardContent className="p-1 -mt-4 text-xs space-y-1 h-80">
        {isDataAvailable ? (
          <Select onValueChange={handleYearChange}>
            <SelectTrigger className="w-full cursor-pointer z-50 text-xs mb-4">
              <SelectValue
                placeholder={
                  selectedYear === null ? "Select Year" : `${selectedYear}`
                }
              />
            </SelectTrigger>
            <SelectContent className="z-100 absolute h-40 ">
              <SelectGroup>
                <SelectLabel className="text-xs">Select Year</SelectLabel>
                {ciis.map((cii) => (
                  <SelectItem
                    key={cii.year}
                    value={cii.year.toString()}
                    className="text-xs"
                  >
                    {cii.year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : null}

        {isDataAvailable && selectedYear !== null ? (
          ciis.find((cii) => cii.year === selectedYear) !== undefined ? (
            renderCiiContent(ciis.find((cii) => cii.year === selectedYear)!)
          ) : null
        ) : (
          <div className={isDataAvailable ? "h-32" : "h-52"}>
            <DataNotFound />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CiiValueCard;
