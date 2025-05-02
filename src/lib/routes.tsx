import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const HomePage = lazy(() => import("../pages/home-page"));
const CIIPage = lazy(() => import("../pages/cii-page"));
const SEEMPPage = lazy(() => import("../pages/seemp-page"));
const TelemetryPage = lazy(() => import("../pages/telemetry-page"));

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
    element: <SEEMPPage />,
  },
  {
    path: "/telemetry",
    element: <TelemetryPage />,
  },
]);
