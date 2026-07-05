import { createContext, useContext, useEffect, useState } from "react";
import { getUserProfile, onAuthChange, signOut } from "../lib/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [profile, setProfile] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cleanUp = onAuthChange(async (user, event) => {
      setLoading(true);
      setUser(user);

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (user) {
          const profile = await getUserProfile(user.id);

          setProfile(profile);
        }
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
      }

      setLoading(false);
    });

    return cleanUp;
  }, []);

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("error signout", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isAuthenticated: !!user, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used withIn and authProvider");
  }

  return context;
};
