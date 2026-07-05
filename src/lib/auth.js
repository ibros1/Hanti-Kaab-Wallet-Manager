import supabase from "./supabase";

export const signUp = async (email, password, username = "") => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    const displayName = username || email.split("@")[0];
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      username: displayName,
    });

    if (profileError) {
      console.error("profile creation error", profileError);
    }
  }

  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  try {
    await getUserProfile(data.user.id);
  } catch (error) {
    console.error("something went wrong!", error);
  }

  return data;
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code === "PGRST116") {
    console.error("profile not exists");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return console.error("user not found!");
    }

    const displayName = user.email.split("@")[0];
    const { data: profileData } = await supabase
      .from("users")
      .insert({
        id: user.id,
        username: displayName,
        avatar_url: null,
      })
      .select()
      .single();

    if (profileData) {
      console.log("successfully created profile", profileData);
      return profileData;
    }
  }

  return data;
};
export const onAuthChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, event);
  });

  return () => data.subscription.unsubscribe();
};

export const signOut = async () => await supabase.auth.signOut();
