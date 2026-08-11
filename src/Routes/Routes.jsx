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
import DoctorAndStaff from "../pages/DoctorAndStaff/DoctorAndStaff";
import Specialties from "../pages/Specialties/Specialties";
import TokenConfig from "../pages/TokenConfig/TokenConfig";
import TokenManagement from "../pages/TokenManagement/TokenManagement";
import QueueStats from "../pages/QueueStats/QueueStats";
import MyQueueTokens from "../pages/MyQueueTokens/MyQueueTokens";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children:[
        { index: true, Component: Home },
        { path: '/AvailableCamps', Component: AvailableCamps },
        { path: '/HospitalQueue', Component: HospitalQueue },
        { path: '/TrackQueue/:id', Component: QueueTracker },
        { path: '/CampDetails/:id', element: <CampDetails/> },
        { path: '/SignIn', Component: SignIn },
        { path: '/SignUp', Component: SignUp }
    ]
  },
  {
    path: '/admin/dashboard',
    element: <Dashboard/>,
    children: [
      { index: true, element: <Overview/> },
      { path: 'OrganizerProfile', element: <OrganizerProfile/> },
      { path: 'AddACamp', element: <AddACamp/> },
      { path: 'ManageCamps', element: <ManageCamps/> },
      { path: 'ManageRegisteredCamps', element: <ManageRegisteredCamps/> },
      { path: 'UpdateCamp/:id', element: <UpdateCamp/> },
      { path: 'DoctorAndStaff', element: <DoctorAndStaff/> },
      { path: 'Specialties', element: <Specialties/> },
      { path: 'TokenConfig', element: <TokenConfig/> },
      { path: 'TokenManagement', element: <TokenManagement/> },
      { path: 'QueueStats', element: <QueueStats/> },
    ]
  },
  {
    path: '/doctor/dashboard',
    element: <Dashboard/>,
    children: [
      { index: true, element: <DoctorQueue/> },
      { path: 'DoctorQueue', element: <DoctorQueue/> },
      { path: 'QueueStats', element: <QueueStats/> },
      { path: 'OrganizerProfile', element: <OrganizerProfile/> },
    ]
  },
  {
    path: '/user/dashboard',
    element: <Dashboard/>,
    children: [
      { index: true, element: <Overview/> },
      { path: 'OrganizerProfile', element: <OrganizerProfile/> },
      { path: 'RegisteredCamps', element: <RegisteredCamps/> },
      { path: 'PaymentHistory', element: <PaymentHistory/> },
      { path: 'MyQueueTokens', element: <MyQueueTokens/> },
      { path: 'BrowseDoctors', element: <HospitalQueue/> },
    ]
  },
  {
    path: '/PayForRegistration',
    element:<PayForRegistration/>
  },
  {
    path: '*',
    Component: PageNotFound
  }
]);
