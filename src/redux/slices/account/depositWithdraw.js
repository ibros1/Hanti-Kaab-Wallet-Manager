import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { DEFAULT_ERROR_MESSAGE } from "../../../constants/error";
import supabase from "../../../lib/supabase";

const initialState = {
  data: {},
  loading: false,
  error: "",
};

// mode: "deposit" | "withdraw"
export const depositWithdrawFn = createAsyncThunk(
  "/account/depositWithdraw",
  async ({ account, amount, mode }, { rejectWithValue }) => {
    try {
      const value = Number(amount);
      const isWithdraw = mode === "withdraw";

      if (!account) {
        throw new Error("Please select an account");
      }
      if (!value || value <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const current = Number(account.balance ?? 0);
      if (isWithdraw && value > current) {
        throw new Error("Insufficient balance");
      }

      const newBalance = isWithdraw ? current - value : current + value;

      const { error: balanceError } = await supabase
        .from("Account")
        .update({ balance: newBalance })
        .eq("id", account.id);
      if (balanceError) throw balanceError;

      // record the movement on the account
      const { error: txError } = await supabase.from("Transaction").insert([
        {
          userId: account.userId,
          accountId: account.id,
          type: isWithdraw ? "withdraw" : "deposit",
          amount: isWithdraw ? -value : value,
          category: isWithdraw ? "Withdrawal" : "Deposit",
          description: isWithdraw
            ? `Withdrawal from ${account.name}`
            : `Deposit to ${account.name}`,
          counterParty: isWithdraw ? "Withdrawal" : "Deposit",
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

export const depositWithdrawSlice = createSlice({
  name: "deposit withdraw slice",
  initialState,
  reducers: {
    resetUploadState: (state) => {
      state.data = {};
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(depositWithdrawFn.pending, (state) => {
      state.data = {};
      state.loading = true;
      state.error = "";
    });
    builder.addCase(depositWithdrawFn.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
    });
    builder.addCase(depositWithdrawFn.rejected, (state, action) => {
      state.data = {};
      state.loading = false;
      state.error = String(action.payload);
    });
  },
});

export const { resetUploadState } = depositWithdrawSlice.actions;
