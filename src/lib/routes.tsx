import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import LoadingScreen from "../components/layout/loading-screen";
import ResponsiveLayout from "../components/layout/responsive-layout";
import DefaultLayout from "../components/layout/default-layout";

const HomePage = lazy(() => import("../pages/home-page"));
const CIIPage = lazy(() => import("../pages/cii-page"));
const SEEMPPage = lazy(() => import("../pages/seemp-page"));
const TelemetryPage = lazy(() => import("../pages/telemetry-page"));
const NotFoundPage = lazy(() => import("../pages/not-found-page"));

const withAppWrappers = <
  LProps extends { children?: React.ReactNode } = { children?: React.ReactNode }
>(
  Component: React.LazyExoticComponent<React.FC>,
  Layout: React.FC<LProps>,
  layoutProps: Omit<LProps, "children"> = {} as Omit<LProps, "children">
) => (
  <Suspense fallback={<LoadingScreen />}>
    <Layout {...(layoutProps as LProps)}>
      <Component />
    </Layout>
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: withAppWrappers(HomePage, DefaultLayout, {
      pageTitle: "Ship Emission Monitoring",
      title: "Home Page",
    }),
  },
  {
    path: "/cii",
    element: withAppWrappers(CIIPage, DefaultLayout, {
      pageTitle: "CII Monitoring",
      title: "CII Page",
    }),
  },
  {
    path: "/seemp",
    element: withAppWrappers(SEEMPPage, ResponsiveLayout),
  },
  {
    path: "/telemetry",
    element: withAppWrappers(TelemetryPage, ResponsiveLayout),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);
