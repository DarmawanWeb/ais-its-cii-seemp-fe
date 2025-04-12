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

interface CiiValueCardProps {
  ciiData: { id: number; name: string; value: string }[];
  ciiDataRating: { id: number; name: string; value: string }[];
}

const CiiValueCard: FC<CiiValueCardProps> = ({ ciiData, ciiDataRating }) => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    console.log("Selected CII Year:", year);
  };

  return (
    <Card>
      <CardHeader className="bg-blue-200 text-black p-1 rounded-t-lg -mt-6 relative">
        <h3 className="text-xl font-semibold">CII Value</h3>
      </CardHeader>
      <CardContent className="p-2 -mt-6 text-xs space-y-2">
        <Select onValueChange={handleYearChange}>
          <SelectTrigger className="w-[180px] cursor-pointer z-50">
            <SelectValue placeholder={selectedYear || "Select CII Year"} />
          </SelectTrigger>
          <SelectContent className="z-100 absolute">
            <SelectGroup>
              <SelectLabel>Select Year</SelectLabel>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="h-0.5 bg-black w-56 mx-auto my-4"></div>

        {ciiData.map(({ id, name, value }) => (
          <div className="grid grid-cols-5" key={id}>
            <div className="font-semibold col-span-3">{name}</div>
            <div className="col-span-2 w-full">{value}</div>
          </div>
        ))}

        <div className="h-0.5 bg-black w-56 mx-auto my-3"></div>

        {ciiDataRating.map(({ id, name, value }) => (
          <div className="grid grid-cols-5" key={id}>
            <div className="font-semibold col-span-3">{name}</div>
            <div className="col-span-2 w-full">{value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CiiValueCard;
