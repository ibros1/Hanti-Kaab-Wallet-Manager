import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/error";
import supabase from "../../lib/supabase";

const initialState = {
  data: {},
  loading: false,
  error: "",
};

export const uploadProfileFn = createAsyncThunk(
  "/profile/upload",
  async (
    { avatar, userId, username, bucket = "Profiles" },
    { rejectWithValue },
  ) => {
    try {
      const updates = {};
      let publicUrl = null;

      if (avatar) {
        const fileExt = avatar.name.split(".").pop().toLowerCase();
        const fileName = `${Date.now()}-${userId}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, avatar, {
            contentType: avatar.type,
            upsert: true,
            cacheControl: "3600",
          });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        publicUrl = urlData.publicUrl;
        updates.avatar_url = publicUrl;
      }

      if (username) {
        updates.username = username;
      }

      let profile = null;
      if (Object.keys(updates).length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .update(updates)
          .eq("id", userId)
          .select("*")
          .single();

        if (profileError) throw profileError;
        profile = profileData;
      }

      return {
        profile,
        url: publicUrl,
      };
    } catch (error) {
      console.error("uploadProfileFn error:", error);
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || DEFAULT_ERROR_MESSAGE,
        );
      }
      return rejectWithValue(error?.message || DEFAULT_ERROR_MESSAGE);
    }
  },
);

export const profileUploadSlice = createSlice({
  name: "Profile upload slice",
  initialState,
  reducers: {
    resetUploadState: (state) => {
      state.data = {};
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(uploadProfileFn.pending, (state) => {
      state.data = {};
      state.loading = true;
      state.error = "";
    });
    builder.addCase(uploadProfileFn.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    });
    builder.addCase(uploadProfileFn.rejected, (state, action) => {
      state.data = {};
      state.loading = false;
      state.error = String(action.payload);
    });
  },
});
