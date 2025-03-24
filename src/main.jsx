import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import './app.css'
// import App from './App.jsx'
import { RouterProvider } from "react-router-dom";
import { router } from "./router.jsx";
import { AuthContextProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <h1 className="skillupheader text-center pt-4 pb-4 text-2xl">SKILLUP</h1>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
      {/* <App /> */}
    </>
  </StrictMode>,
);
