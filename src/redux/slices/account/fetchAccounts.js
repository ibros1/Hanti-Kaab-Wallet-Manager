import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { DEFAULT_ERROR_MESSAGE } from "../../../constants/error";
import supabase from "../../../lib/supabase";

const initialState = {
  data: [],
  loading: false,
  error: "",
};

export const listAccountsFn = createAsyncThunk(
  "/accounts/list",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Account")
        .select("*")
        .eq("userId", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return data;
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

export const listAccountSlice = createSlice({
  name: "list account slice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(listAccountsFn.pending, (state) => {
      state.data = [];
      state.loading = true;
      state.error = "";
    });
    builder.addCase(listAccountsFn.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    });
    builder.addCase(listAccountsFn.rejected, (state, action) => {
      state.data = [];
      state.loading = false;
      state.error = String(action.payload);
    });
  },
});
