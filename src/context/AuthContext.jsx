import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 track loading

  const signUpNewUser = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("There was a problem signing up:", error);
      return { success: false, error };
    }
    return { success: true, data };
  };

  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error occurred:", error);
        return { success: false, error: error.message };
      }

      fetchUserRole(data.session?.user?.id);
      return { success: true, data };
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const fetchUserRole = async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("users")
      .select("usertype")
      .eq("userid", userId)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
    } else {
      setUserRole(data.usertype);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user?.id) {
        await fetchUserRole(session.user.id);
      }
      setLoading(false); // ✅ done loading
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user?.id) {
          fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
      }
    );

    init();

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("There was an error:", error);
    } else {
      setUserRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, userRole, loading, signUpNewUser, signInUser, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const userAuth = () => useContext(AuthContext);
