import { createBrowserRouter, Outlet } from "react-router";
import MainPage from "./pages/mainPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AccountsPage from "./pages/AccountsPage";
import TransactionsPage from "./pages/TransactionsPage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthProtected from "./pages/protectors/AuthProtected";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProtectedRoutes from "./pages/protectors/ProtectedRoutes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainPage />{" "}
      </ProtectedRoutes>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "accounts",
        element: <AccountsPage />,
      },
      {
        path: "transactions",
        element: <TransactionsPage />,
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/auth",
    element: (
      <AuthProtected>
        <Outlet />
      </AuthProtected>
    ),
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
]);
