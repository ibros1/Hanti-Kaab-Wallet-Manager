import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { DEFAULT_ERROR_MESSAGE } from "../../../constants/error";
import supabase from "../../../lib/supabase";

const initialState = {
  data: {},
  loading: false,
  error: "",
};

export const transferFn = createAsyncThunk(
  "/account/transfer",
  async ({ fromAccount, toAccount, amount }, { rejectWithValue }) => {
    try {
      const value = Number(amount);

      if (!fromAccount || !toAccount) {
        throw new Error("Please select both accounts");
      }
      if (fromAccount.id === toAccount.id) {
        throw new Error("Cannot transfer to the same account");
      }
      if (!value || value <= 0) {
        throw new Error("Please enter a valid amount");
      }
      if (value > Number(fromAccount.balance ?? 0)) {
        throw new Error("Insufficient balance");
      }

      const { error: fromError } = await supabase
        .from("Account")
        .update({ balance: Number(fromAccount.balance ?? 0) - value })
        .eq("id", fromAccount.id);
      if (fromError) throw fromError;

      const { error: toError } = await supabase
        .from("Account")
        .update({ balance: Number(toAccount.balance ?? 0) + value })
        .eq("id", toAccount.id);
      if (toError) throw toError;

      // record the money movement on both sides of the transfer
      const recipientLabel = toAccount.ownerName || toAccount.name;
      const senderLabel = fromAccount.ownerName || fromAccount.name;
      const { error: txError } = await supabase.from("Transaction").insert([
        {
          userId: fromAccount.userId,
          accountId: fromAccount.id,
          type: "transfer_out",
          amount: -value,
          category: "Transfer",
          description: `Transfer to ${recipientLabel}`,
          counterParty: recipientLabel,
        },
        {
          userId: toAccount.userId,
          accountId: toAccount.id,
          type: "transfer_in",
          amount: value,
          category: "Transfer",
          description: `Transfer from ${senderLabel}`,
          counterParty: senderLabel,
        },
      ]);
      if (txError) throw txError;

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

export const transferSlice = createSlice({
  name: "transfer slice",
  initialState,
  reducers: {
    resetUploadState: (state) => {
      state.data = {};
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(transferFn.pending, (state) => {
      state.data = {};
      state.loading = true;
      state.error = "";
    });
    builder.addCase(transferFn.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    });
    builder.addCase(transferFn.rejected, (state, action) => {
      state.data = {};
      state.loading = false;
      state.error = String(action.payload);
    });
  },
});

export const { resetUploadState } = transferSlice.actions;
