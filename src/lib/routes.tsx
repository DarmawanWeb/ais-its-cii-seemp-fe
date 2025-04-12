import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const HomePage = lazy(() => import("../pages/home-page"));
const CIIPage = lazy(() => import("../pages/cii-page"));
const SEMPPage = lazy(() => import("../pages/semp-page"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/cii",
    element: <CIIPage />,
  },
  {
    path: "/semp",
    element: <SEMPPage />,
  },
]);
