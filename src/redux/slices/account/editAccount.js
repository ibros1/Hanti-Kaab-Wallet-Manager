import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { DEFAULT_ERROR_MESSAGE } from "../../../constants/error";
import supabase from "../../../lib/supabase";

const initialState = {
  data: {},
  loading: false,
  error: "",
};

export const editAccountFn = createAsyncThunk(
  "/account/edit",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("Account")
        .update({ name })
        .eq("id", id);
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

export const editAccountSlice = createSlice({
  name: "edit account slice",
  initialState,
  reducers: {
    resetUploadState: (state) => {
      state.data = {};
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(editAccountFn.pending, (state) => {
      state.data = {};
      state.loading = true;
      state.error = "";
    });
    builder.addCase(editAccountFn.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    });
    builder.addCase(editAccountFn.rejected, (state, action) => {
      state.data = {};
      state.loading = false;
      state.error = String(action.payload);
    });
  },
});

export const { resetUploadState } = editAccountSlice.actions;
