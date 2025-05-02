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
import { Database } from "lucide-react";

export interface Cii {
  year: number;
  ciiRequired: number;
  ciiRating: number;
  ciiAttained: number;
  ciiGrade: string;
  ddVector: {
    d1: number;
    d2: number;
    d3: number;
    d4: number;
    d5: number;
  };
}

export interface CiiValueCardProps {
  ciis: Cii[];
}

const CiiValueCard: FC<CiiValueCardProps> = ({ ciis }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const handleYearChange = (year: string) => {
    const newYear = Number(year);
    setSelectedYear(newYear);
  };

  const renderCiiContent = (cii: Cii) => (
    <section className="text-md ">
      <div className="h-0.5 bg-black w-full mx-auto my-2"></div>
      <div className="grid grid-cols-2 ml-6">
        <b>CII Required</b> <p>: {cii.ciiRequired.toFixed(5)}</p>
        <b>CII Attained</b> <p>: {cii.ciiAttained.toFixed(5)}</p>
      </div>
      <div className="h-0.5 bg-black w-full mx-auto my-2"></div>
      <div className="grid grid-cols-2 ml-6">
        <b className="col-span-2">CII Rating</b>
        <b>Number</b> <p>: {cii.ciiRating.toFixed(5)}</p>
        <b>Grade</b> <p>: {cii.ciiGrade}</p>
      </div>
    </section>
  );

  const isDataAvailable = ciis && ciis.length > 0;

  return (
    <Card className="text-xs">
      {" "}
      <CardHeader className="bg-blue-200 text-black p-2 rounded-t-lg -mt-6 relative">
        <h3 className="text-base font-semibold text-center">CII Value</h3>{" "}
      </CardHeader>
      <CardContent className="p-1 -mt-4 text-xs space-y-1 h-full">
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
          <div className="flex flex-col items-center justify-center -mt-8 space-y-1 h-full">
            <Database className="text-gray-400" size={18} />
            <div className="text-xs text-gray-600">Data will appear here</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CiiValueCard;
