import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { DEFAULT_ERROR_MESSAGE } from "../../../constants/error";
import supabase from "../../../lib/supabase";

const initialState = {
  data: null,
  loading: false,
  error: "",
};

export const findAccountFn = createAsyncThunk(
  "/account/find",
  async ({ acc_number }, { rejectWithValue }) => {
    try {
      const number = String(acc_number ?? "").trim();
      if (!number) {
        throw new Error("Please enter an account number");
      }

      const { data: account, error } = await supabase
        .from("Account")
        .select("*")
        .eq("acc_number", number)
        .maybeSingle();
      if (error) throw error;
      if (!account) {
        throw new Error("No account found with that number");
      }

      // fetch the owner's name
      const { data: owner, error: ownerError } = await supabase
        .from("users")
        .select("username, avatar_url")
        .eq("id", account.userId)
        .maybeSingle();
      if (ownerError) throw ownerError;

      return {
        ...account,
        ownerName: owner?.username || "Unknown user",
        ownerAvatar: owner?.avatar_url || null,
      };
    } catch (error) {
      console.error("error:", error);
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || DEFAULT_ERROR_MESSAGE,
        );
      }
      return rejectWithValue(error?.message || DEFAULT_ERROR_MESSAGE);
    }
  },
);

export const findAccountSlice = createSlice({
  name: "find account slice",
  initialState,
  reducers: {
    resetUploadState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(findAccountFn.pending, (state) => {
      state.data = null;
      state.loading = true;
      state.error = "";
    });
    builder.addCase(findAccountFn.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    });
    builder.addCase(findAccountFn.rejected, (state, action) => {
      state.data = null;
      state.loading = false;
      state.error = String(action.payload);
    });
  },
});

export const { resetUploadState } = findAccountSlice.actions;
