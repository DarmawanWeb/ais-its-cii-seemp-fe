interface LabelValuePairProps {
  label: string;
  value: string | number;
  isExtend?: boolean;
}

export const LabelValuePair = ({
  label,
  value,
  isExtend = true,
}: LabelValuePairProps) => (
  <>
    <span className="font-semibold">{label}</span>
    <span className={`${isExtend ? "col-span-2" : ""}`}>: {value}</span>
  </>
);
