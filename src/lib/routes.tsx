import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import LoadingScreen from "../components/layout/loading-screen";
import ResponsiveLayout from "../components/layout/responsive-layout";

const HomePage = lazy(() => import("../pages/home-page"));
const CIIPage = lazy(() => import("../pages/cii-page"));
const SEEMPPage = lazy(() => import("../pages/seemp-page"));
const TelemetryPage = lazy(() => import("../pages/telemetry-page"));
const NotFoundPage = lazy(() => import("../pages/not-found-page"));

const withAppWrappers = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<LoadingScreen />}>
    <ResponsiveLayout>
      <Component />
    </ResponsiveLayout>
  </Suspense>
);

export const router = createBrowserRouter([
  { path: "/", element: withAppWrappers(HomePage) },
  { path: "/cii", element: withAppWrappers(CIIPage) },
  { path: "/seemp", element: withAppWrappers(SEEMPPage) },
  { path: "/telemetry", element: withAppWrappers(TelemetryPage) },
  { path: "*", element: withAppWrappers(NotFoundPage) },
]);
