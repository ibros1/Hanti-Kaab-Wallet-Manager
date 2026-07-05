import React from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <div>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
