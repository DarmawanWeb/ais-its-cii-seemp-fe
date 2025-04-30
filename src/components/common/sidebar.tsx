import { useSidebarStore } from "../../hooks/use-sidebar-store";
import { FC } from "react";
import {
  Menu,
  X,
  Home,
  Ship,
  CloudUpload,
  Thermometer,
  Fuel,
  CloudSunRain,
  Copyright,
  ChartLine,
} from "lucide-react";
import { Button } from "../ui/button";

const Sidebar: FC = () => {
  const { isOpen, toggleSidebar } = useSidebarStore();
  const currentPage = window.location.pathname;

  const icons = [
    { icon: Home, redirect: "/" },
    { icon: Ship, redirect: "#" },
    { icon: CloudUpload, redirect: "#" },
    { icon: Thermometer, redirect: "#" },
    { icon: CloudSunRain, redirect: "#" },
    { icon: Fuel, redirect: "#" },
    { icon: Copyright, redirect: "/cii" },
    { icon: ChartLine, redirect: "/semp" },
  ];

  return (
    <nav
      className={`fixed z-100 top-5 right-5 flex flex-col items-center bg-indigo-950 text-white rounded-xl shadow-lg transition-all py-2 ${
        isOpen ? "w-12" : "w-12"
      }`}
    >
      <Button
        variant="ghost"
        onClick={toggleSidebar}
        className="p-3 rounded-lg hover:bg-gray-700 transition-all"
      >
        {isOpen ? <X className="text-xl" /> : <Menu className="text-xl" />}
      </Button>
      <div
        className={`flex flex-col items-center gap-y-5 transition-all mt-4 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {icons.map(({ icon: Icon, redirect }, index) => (
          <Button
            key={index}
            variant="ghost"
            onClick={() => {
              window.location.href = redirect;
            }}
            className={`p-3 rounded-lg w-10 h-10 flex items-center justify-center cursor-pointer transition-all ${
              currentPage === redirect
                ? "bg-gray-500 text-white"
                : "hover:bg-gray-700"
            }`}
          >
            <Icon size={24} />
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;
