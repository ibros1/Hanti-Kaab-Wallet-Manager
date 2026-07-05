import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

const AuthProtected = ({ children }) => {
  const { isAuthenticated } = useAuth();
  console.log(isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to={"/"} replace />;
  }

  return children;
};

export default AuthProtected;
