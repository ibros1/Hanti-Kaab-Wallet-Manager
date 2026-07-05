import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { DEFAULT_ERROR_MESSAGE } from "../../../constants/error";
import supabase from "../../../lib/supabase";

const initialState = {
  data: [],
  loading: false,
  error: "",
};

export const listTransactionsFn = createAsyncThunk(
  "/transactions/list",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Transaction")
        .select("*, account:accountId (name, acc_number)")
        .eq("userId", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return data ?? [];
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

export const listTransactionSlice = createSlice({
  name: "list transaction slice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(listTransactionsFn.pending, (state) => {
      state.data = [];
      state.loading = true;
      state.error = "";
    });
    builder.addCase(listTransactionsFn.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    });
    builder.addCase(listTransactionsFn.rejected, (state, action) => {
      state.data = [];
      state.loading = false;
      state.error = String(action.payload);
    });
  },
});
