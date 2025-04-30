import { FC } from "react";

interface IPageTitleProps {
  readonly title: string;
}

const PageTitle: FC<IPageTitleProps> = ({ title }) => {
  return (
    <div className="absolute top-0 left-0 z-100  bg-indigo-950  px-10 py-2 rounded-sm ">
      <h1 className="text-lg font-bold text-white">{title}</h1>
    </div>
  );
};

export default PageTitle;
