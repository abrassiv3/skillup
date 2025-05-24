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
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Drafts from "./pages/Drafts";
import ArchivedPosts from "./pages/ArchivedPosts";
import FreelancerProfile from "./pages/FreelancerProfile";
import FlDashboard from "./pages/FlDashboard";
import Applications from "./pages/Applications";
import ApplyToJob from "./pages/ApplyToJob";
import FlApplications from "./pages/FlApplications";
import ClientProfile from "./pages/ClientProfile";
import FlProfile from "./pages/FlProfile";
import FlDashboardLayout from "./components/FlDashboardLayout.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import CurrentProject from "./pages/CurrentProject.jsx";
import ProjectMilestones from "./pages/ProjectMilestones.jsx";
import PostedProjects from "./pages/PostedProjects.jsx";
import ClientsChats from "./pages/ClientChats.jsx";

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
        <Route path="/update-profile" element={ <PrivateRoute><FreelancerProfile /></PrivateRoute> } /> 
        

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Client']}><Dashboard /></ProtectedRoute></PrivateRoute> } />
          <Route path="/posted-projects" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Client']}><PostedProjects /></ProtectedRoute></PrivateRoute> } />
          <Route path="/project/:id" element={<PrivateRoute><ProtectedRoute allowedRoles={['Client']}><CurrentProject /></ProtectedRoute></PrivateRoute>}/>
          <Route path="/createpost" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Client']}><CreatePost /></ProtectedRoute></PrivateRoute> } />
          <Route path="/createpost/:id" element={<PrivateRoute><ProtectedRoute allowedRoles={['Client']}><CreatePost /></ProtectedRoute></PrivateRoute> } />
          <Route path="/applications" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Client']}><Applications /></ProtectedRoute></PrivateRoute> } />
          <Route path="/applications/:jobId" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Client']}><Applications /></ProtectedRoute></PrivateRoute> } />
          <Route path="/archive" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Client']}><ArchivedPosts /></ProtectedRoute></PrivateRoute> } />
          <Route path="/client-profile" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Client']}><ClientProfile /></ProtectedRoute></PrivateRoute> } />
          <Route path="/drafts" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Client']}><Drafts /></ProtectedRoute></PrivateRoute> } />
          <Route path="/client-chats" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Client']}><ClientsChats /></ProtectedRoute></PrivateRoute> } />
        </Route>

        <Route element={<FlDashboardLayout />}>
          <Route path="/jobposts" element={ <JobPosts /> } />
          <Route path="/project-milestones/:id" element={<PrivateRoute><ProjectMilestones /></PrivateRoute>}/>

          <Route path="/fl-dashboard" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Freelancer']}><FlDashboard /></ProtectedRoute></PrivateRoute> } />
          <Route path="/fl-profile" element={ <PrivateRoute><FlProfile /></PrivateRoute> } />
          <Route path="/my-applications" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Freelancer']}><FlApplications /></ProtectedRoute></PrivateRoute> } />
          <Route path="apply-to-job/:jobId" element={ <PrivateRoute><ProtectedRoute allowedRoles={['Freelancer']}><ApplyToJob /></ProtectedRoute></PrivateRoute> } />
        </Route>

        </Routes>
      </Router>
    </AuthContextProvider>
  </StrictMode>
);
