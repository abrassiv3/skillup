import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import './app.css';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext.jsx";

import App from "./App";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import JobPosts from "./pages/JobPosts";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import CreateUser from "./pages/CreateUser";
import PrivateRoute from "./components/PrivateRoute";
import Drafts from "./pages/Drafts";
import ArchivedPosts from "./pages/ArchivedPosts";
import FreelancerProfile from "./pages/FreelancerProfile";
import FlDashboard from "./pages/FlDashboard";
import Applications from "./pages/Applications";
import ApplyToJob from "./pages/ApplyToJob";
import FlApplications from "./pages/FlApplications";
import ClientProfile from "./pages/ClientProfile";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Messages from "./pages/Messages";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <Router>
        <Routes>
        <Route path="/" element={ <App /> } />
        <Route path="/job-posts" element={ <JobPosts /> } />
        <Route path="/signup" element={ <Signup /> } />
        <Route path="/signin" element={ <Signin /> } />
        <Route path="/create-user" element={ <PrivateRoute><CreateUser /></PrivateRoute> } />
        <Route path="/fl-dashboard" element={ <PrivateRoute><FlDashboard /></PrivateRoute> } /> 
        
        <Route path="/update-profile" element={ <PrivateRoute><FreelancerProfile /></PrivateRoute> } />
        <Route path="/my-applications" element={ <PrivateRoute><FlApplications /></PrivateRoute> } />
        <Route path="apply-to-job/:jobId" element={ <PrivateRoute><ApplyToJob /></PrivateRoute> } />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={ <PrivateRoute><Dashboard /></PrivateRoute> } />
          <Route path="/createpost" element={ <PrivateRoute><CreatePost /></PrivateRoute> } />
          <Route path="/createpost/:id" element={ <CreatePost /> } />
          <Route path="/applications/:jobId" element={ <PrivateRoute><Applications /></PrivateRoute> } />
          <Route path="/archive" element={ <PrivateRoute><ArchivedPosts /></PrivateRoute> } />
          <Route path="/client-profile" element={ <PrivateRoute><ClientProfile /></PrivateRoute> } />
          <Route path="/messages" element={ <PrivateRoute><Messages /></PrivateRoute> } />
          <Route path="/drafts" element={ <PrivateRoute><Drafts /></PrivateRoute> } />
        </Route>

        </Routes>
      </Router>
    </AuthContextProvider>
  </StrictMode>
);
