import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import LoadingScreen from "../components/layout/loading-screen";
import DefaultLayout from "../components/layout/default-layout";

const CIIPage = lazy(() => import("../pages/cii-page"));
const SEEMPPage = lazy(() => import("../pages/seemp-page"));
const TelemetryPage = lazy(() => import("../pages/telemetry-page"));
const NotFoundPage = lazy(() => import("../pages/not-found-page"));
const EWSPage = lazy(() => import("../pages/ews"));
const AnomalyPage = lazy(() => import("../pages/anomaly"));
const IllegalTranshipmentPage = lazy(() => import("../pages/illegal-transhipment"));

const IllegalPage = lazy(() => import("../pages/ilegal"));

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
    element: <Navigate to="/telemetry" replace />,
  },
  {
    path: "/telemetry",
    element: withAppWrappers(TelemetryPage, DefaultLayout, {
      pageTitle: "Telemetry Data",
      title: "Telemetry Page",
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
    element: withAppWrappers(SEEMPPage, DefaultLayout, {
      pageTitle: "SEEMP Recommendations",
      title: "SEEMP Page",
    }),
  },
   {
    path: "/anomaly",
    element: withAppWrappers(AnomalyPage, DefaultLayout, {
      pageTitle: "Navstatus Anomaly Detection",
      title: "Anomaly Page",
    }),
  },
  {
    path: "/ews",
    element: withAppWrappers(EWSPage, DefaultLayout, {
      pageTitle: "Early Warning System",
      title: "EWS Page",
    }),
  },
  {
    path: "/illegal",
    element: withAppWrappers(IllegalPage, DefaultLayout, {
      pageTitle: "Illegal Fishing HeatMap",
      title: "Illegal Activity Page",
    } 
    ),
  },
  {
    path: "/illegal-transhipment",
    element: withAppWrappers(IllegalTranshipmentPage, DefaultLayout, {
      pageTitle: "Illegal Transhipment Detection",
      title: "Illegal Transhipment Page",
    } 
    ),
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
