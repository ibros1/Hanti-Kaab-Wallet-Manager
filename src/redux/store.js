import { configureStore } from "@reduxjs/toolkit";
import { profileUploadSlice } from "./slices/Profile";
import { createAccountSlice } from "./slices/account/account";
import { listAccountSlice } from "./slices/account/fetchAccounts";
import { editAccountSlice } from "./slices/account/editAccount";
import { deleteAccountSlice } from "./slices/account/deleteAccount";
import { transferSlice } from "./slices/account/transfer";
import { findAccountSlice } from "./slices/account/findAccount";
import { depositWithdrawSlice } from "./slices/account/depositWithdraw";
import { listTransactionSlice } from "./slices/transaction/fetchTransactions";

export const store = configureStore({
  reducer: {
    profileUploadSlice: profileUploadSlice.reducer,
    createAccountSlice: createAccountSlice.reducer,
    listAccountSlice: listAccountSlice.reducer,
    editAccountSlice: editAccountSlice.reducer,
    deleteAccountSlice: deleteAccountSlice.reducer,
    transferSlice: transferSlice.reducer,
    findAccountSlice: findAccountSlice.reducer,
    depositWithdrawSlice: depositWithdrawSlice.reducer,
    listTransactionSlice: listTransactionSlice.reducer,
  },
  devTools: true,
});
