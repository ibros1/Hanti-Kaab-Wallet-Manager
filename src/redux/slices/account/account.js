import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { DEFAULT_ERROR_MESSAGE } from "../../../constants/error";
import supabase from "../../../lib/supabase";

const initialState = {
  data: {},
  loading: false,
  error: "",
};

export const createAccountFn = createAsyncThunk(
  "/account/create",
  async ({ name, userId, balance, acc_number }, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("Account").insert({
        name,
        userId,
        balance,
        acc_number,
      });
      if (error) throw error;

      return true;
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

export const createAccountSlice = createSlice({
  name: "create account slice",
  initialState,
  reducers: {
    resetUploadState: (state) => {
      state.data = {};
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createAccountFn.pending, (state) => {
      state.data = {};
      state.loading = true;
      state.error = "";
    });
    builder.addCase(createAccountFn.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    });
    builder.addCase(createAccountFn.rejected, (state, action) => {
      state.data = {};
      state.loading = false;
      state.error = String(action.payload);
    });
  },
});

export const { resetUploadState } = createAccountSlice.actions;
