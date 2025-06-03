interface LabelValuePairProps {
  label: string;
  value: string | number;
}

export const LabelValuePair = ({ label, value }: LabelValuePairProps) => (
  <>
    <span className="font-semibold">{label}</span>
    <span className="col-span-2">: {value}</span>
  </>
);
