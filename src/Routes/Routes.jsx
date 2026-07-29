import { createBrowserRouter } from "react-router";
import Root from "../layouts/Root";
import Home from "../pages/Home/Home";
import CampDetails from "../pages/CampDetails/CampDetails";
import SignIn from "../pages/SignIn/SignIn";
import SignUp from "../pages/SignUp/SignUp";
import PrivateRoute from "../hooks/PrivateRoute/PrivateRoute";
import AvailableCamps from "../pages/AvailableCamps/AvailableCamps";
import Dashboard from "../layouts/Dashboard";
import Overview from "../pages/Overview/Overview";
import OrganizerProfile from "../pages/OrganizerProfile/OrganizerProfile";
import AddACamp from "../pages/AddACamp/AddACamp";
import ManageCamps from "../pages/ManageCamps/ManageCamps";
import UpdateCamp from "../pages/UpdateCamp/UpdateCamp";
import RegisteredCamps from "../pages/RegisteredCamps/RegisteredCamps";
import PayForRegistration from "../pages/PayForRegistration/PayForRegistration";
import PaymentHistory from "../pages/PaymentHistory/PaymentHistory";
import ManageRegisteredCamps from "../pages/ManageRegisteredCamps/ManageRegisteredCamps";
import PageNotFound from "../pages/PageNotFound/PageNotFound";

// Smart Hospital Queue System Pages
import HospitalQueue from "../pages/HospitalQueue/HospitalQueue";
import QueueTracker from "../pages/HospitalQueue/QueueTracker";
import DoctorQueue from "../pages/DoctorQueue/DoctorQueue";
import ManageQueueSystem from "../pages/ManageQueueSystem/ManageQueueSystem";
import QueueAnalytics from "../pages/QueueAnalytics/QueueAnalytics";
import MyQueueTokens from "../pages/MyQueueTokens/MyQueueTokens";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children:[
        {
            index: true,
            Component: Home
        },
        {
          path: '/AvailableCamps',
          Component: AvailableCamps
        },
        {
          path: '/HospitalQueue',
          Component: HospitalQueue
        },
        {
          path: '/TrackQueue/:id',
          Component: QueueTracker
        },
        {
          path: '/CampDetails/:id',
          element: <PrivateRoute><CampDetails/></PrivateRoute>
        },
        {
          path: '/SignIn',
          Component: SignIn,
        },
        {
          path: '/SignUp',
          Component: SignUp,
        }
    ]
  },
  {
    path: '/Dashboard',
    element: <PrivateRoute><Dashboard/></PrivateRoute>,
    children: [
      {
        index: true,
        element: <PrivateRoute><Overview/></PrivateRoute>
      },
      {
        path: '/Dashboard/OrganizerProfile',
        element: <PrivateRoute><OrganizerProfile/></PrivateRoute>
      },
      {
        path: '/Dashboard/AddACamp',
        element: <PrivateRoute><AddACamp/></PrivateRoute>
      },
      {
        path: '/Dashboard/ManageCamps',
        element: <PrivateRoute><ManageCamps/></PrivateRoute>
      },
      {
        path: '/Dashboard/ManageRegisteredCamps',
        element: <PrivateRoute><ManageRegisteredCamps/></PrivateRoute>
      },
      {
        path: '/Dashboard/UpdateCamp/:id',
        element: <PrivateRoute><UpdateCamp/></PrivateRoute>
      },
      {
        path: '/Dashboard/RegisteredCamps',
        element: <PrivateRoute><RegisteredCamps/></PrivateRoute>
      },
      {
        path: '/Dashboard/PaymentHistory',
        element: <PrivateRoute><PaymentHistory/></PrivateRoute>
      },
      {
        path: '/Dashboard/DoctorQueue',
        element: <PrivateRoute><DoctorQueue/></PrivateRoute>
      },
      {
        path: '/Dashboard/ManageQueueSystem',
        element: <PrivateRoute><ManageQueueSystem/></PrivateRoute>
      },
      {
        path: '/Dashboard/QueueAnalytics',
        element: <PrivateRoute><QueueAnalytics/></PrivateRoute>
      },
      {
        path: '/Dashboard/MyQueueTokens',
        element: <PrivateRoute><MyQueueTokens/></PrivateRoute>
      },
    ]
  },
  {
    path: '/PayForRegistration',
    element:<PrivateRoute><PayForRegistration/></PrivateRoute>
  },
  {
    path: '*',
    Component: PageNotFound
  }
]);
