import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Landmark,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { DEFAULT_ERROR_MESSAGE } from "../constants/error";
import {
  createAccountFn,
  resetUploadState as resetCreateState,
} from "../redux/slices/account/account";
import { listAccountsFn } from "../redux/slices/account/fetchAccounts";
import {
  editAccountFn,
  resetUploadState as resetEditState,
} from "../redux/slices/account/editAccount";
import {
  deleteAccountFn,
  resetUploadState as resetDeleteState,
} from "../redux/slices/account/deleteAccount";
import {
  transferFn,
  resetUploadState as resetTransferState,
} from "../redux/slices/account/transfer";
import {
  findAccountFn,
  resetUploadState as resetFindState,
} from "../redux/slices/account/findAccount";
import {
  depositWithdrawFn,
  resetUploadState as resetAdjustState,
} from "../redux/slices/account/depositWithdraw";
import Spinner from "../components/ui/Spinner";

const money = (n) => `$${Number(n ?? 0).toLocaleString("en-US")}`;

const AccountsPage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [accountName, setAccountName] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [fromId, setFromId] = useState("");
  const [accNumberQuery, setAccNumberQuery] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [adjustMode, setAdjustMode] = useState(null); // "deposit" | "withdraw"
  const [adjustAccount, setAdjustAccount] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const { user } = useAuth();
  const dispatch = useDispatch();

  const { data: accounts, loading: listLoading } = useSelector(
    (state) => state.listAccountSlice,
  );
  const createAcoountState = useSelector((state) => state.createAccountSlice);
  const editAccountState = useSelector((state) => state.editAccountSlice);
  const deleteAccountState = useSelector((state) => state.deleteAccountSlice);
  const transferState = useSelector((state) => state.transferSlice);
  const findState = useSelector((state) => state.findAccountSlice);
  const adjustState = useSelector((state) => state.depositWithdrawSlice);
  const foundAccount = findState.data;

  useEffect(() => {
    if (user?.id) dispatch(listAccountsFn({ userId: user.id }));
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (createAcoountState.loading) {
      toast.dismiss();
      toast.loading("creating...");
      return;
    }
    if (createAcoountState.error) {
      toast.dismiss();
      toast.error(createAcoountState.error);
      dispatch(resetCreateState());
      return;
    }
    if (createAcoountState.data === true) {
      toast.dismiss();
      toast.success("Successfully created account!");
      dispatch(resetCreateState());
      if (user?.id) dispatch(listAccountsFn({ userId: user.id }));
      setIsPopupOpen(false);
      setAccountName("");
    }
  }, [createAcoountState, dispatch, user?.id]);

  useEffect(() => {
    if (editAccountState.loading) {
      toast.dismiss();
      toast.loading("updating...");
      return;
    }
    if (editAccountState.error) {
      toast.dismiss();
      toast.error(editAccountState.error);
      dispatch(resetEditState());
      return;
    }
    if (editAccountState.data === true) {
      toast.dismiss();
      toast.success("Successfully updated account!");
      dispatch(resetEditState());
      if (user?.id) dispatch(listAccountsFn({ userId: user.id }));
      setIsPopupOpen(false);
      setEditing(null);
      setAccountName("");
    }
  }, [editAccountState, dispatch, user?.id]);

  // delete feedback
  useEffect(() => {
    if (deleteAccountState.loading) {
      toast.dismiss();
      toast.loading("deleting...");
      return;
    }
    if (deleteAccountState.error) {
      toast.dismiss();
      toast.error(deleteAccountState.error);
      dispatch(resetDeleteState());
      setDeletingId(null);
      return;
    }
    if (deleteAccountState.data === true) {
      toast.dismiss();
      toast.success("Successfully deleted account!");
      dispatch(resetDeleteState());
      if (user?.id) dispatch(listAccountsFn({ userId: user.id }));
      setDeletingId(null);
    }
  }, [deleteAccountState, dispatch, user?.id]);

  // transfer feedback
  useEffect(() => {
    if (transferState.loading) {
      toast.dismiss();
      toast.loading("transferring...");
      return;
    }
    if (transferState.error) {
      toast.dismiss();
      toast.error(transferState.error);
      dispatch(resetTransferState());
      return;
    }
    if (transferState.data === true) {
      toast.dismiss();
      toast.success("Transfer completed successfully!");
      dispatch(resetTransferState());
      if (user?.id) dispatch(listAccountsFn({ userId: user.id }));
      closeTransfer();
    }
  }, [transferState, dispatch, user?.id]);

  // deposit / withdraw feedback
  useEffect(() => {
    if (adjustState.loading) {
      toast.dismiss();
      toast.loading("processing...");
      return;
    }
    if (adjustState.error) {
      toast.dismiss();
      toast.error(adjustState.error);
      dispatch(resetAdjustState());
      return;
    }
    if (adjustState.data === true) {
      toast.dismiss();
      toast.success("Balance updated successfully!");
      dispatch(resetAdjustState());
      if (user?.id) dispatch(listAccountsFn({ userId: user.id }));
      closeAdjust();
    }
  }, [adjustState, dispatch, user?.id]);

  const openCreate = () => {
    setEditing(null);
    setAccountName("");
    setIsPopupOpen(true);
  };

  const openEdit = (account) => {
    setEditing(account);
    setAccountName(account.name);
    setIsPopupOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const name = accountName.trim();
    if (!name) {
      toast.error("Please enter an account name");
      return;
    }
    const accountNumber = `${Date.now().toString().slice(-8)}`;
    try {
      if (editing) {
        dispatch(editAccountFn({ id: editing.id, name }));
      } else {
        dispatch(
          createAccountFn({
            name,
            userId: user.id,
            balance: 0,
            acc_number: accountNumber,
          }),
        );
      }
    } catch (error) {
      toast.error(error || DEFAULT_ERROR_MESSAGE);
    }
  };

  const handleDelete = (account) => {
    const confirmed = window.confirm(
      `Delete "${account.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setDeletingId(account.id);
    dispatch(deleteAccountFn({ id: account.id }));
  };

  const openTransfer = () => {
    setFromId("");
    setAccNumberQuery("");
    setTransferAmount("");
    setIsConfirming(false);
    dispatch(resetFindState());
    setIsTransferOpen(true);
  };

  const closeTransfer = () => {
    setIsTransferOpen(false);
    setFromId("");
    setAccNumberQuery("");
    setTransferAmount("");
    setIsConfirming(false);
    dispatch(resetFindState());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const number = accNumberQuery.trim();
    if (!number) {
      toast.error("Please enter an account number");
      return;
    }
    setIsConfirming(false);
    dispatch(findAccountFn({ acc_number: number }));
  };

  // move to the confirmation step after validating the form
  const handleReview = (e) => {
    e.preventDefault();
    const fromAccount = accounts.find((a) => String(a.id) === String(fromId));

    if (!fromAccount) {
      toast.error("Please select the account to send from");
      return;
    }
    if (!foundAccount) {
      toast.error("Please search and select a destination account");
      return;
    }
    if (String(fromAccount.id) === String(foundAccount.id)) {
      toast.error("Cannot transfer to the same account");
      return;
    }
    const amount = Number(transferAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > Number(fromAccount.balance ?? 0)) {
      toast.error("Insufficient balance");
      return;
    }
    setIsConfirming(true);
  };

  const handleConfirmTransfer = () => {
    const fromAccount = accounts.find((a) => String(a.id) === String(fromId));
    const amount = Number(transferAmount);
    if (!fromAccount || !foundAccount) return;
    dispatch(
      transferFn({ fromAccount, toAccount: foundAccount, amount }),
    );
  };

  const openAdjust = (account, mode) => {
    setAdjustAccount(account);
    setAdjustMode(mode);
    setAdjustAmount("");
    dispatch(resetAdjustState());
  };

  const closeAdjust = () => {
    setAdjustAccount(null);
    setAdjustMode(null);
    setAdjustAmount("");
    dispatch(resetAdjustState());
  };

  const handleAdjust = (e) => {
    e.preventDefault();
    const amount = Number(adjustAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (
      adjustMode === "withdraw" &&
      amount > Number(adjustAccount?.balance ?? 0)
    ) {
      toast.error("Insufficient balance");
      return;
    }
    dispatch(
      depositWithdrawFn({ account: adjustAccount, amount, mode: adjustMode }),
    );
  };

  const total = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Accounts</h1>
          <p className="text-slate-500 text-sm mt-1">
            {accounts.length} {accounts.length === 1 ? "account" : "accounts"} ·{" "}
            {money(total)} available in total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add account
          </button>
          <button
            onClick={openTransfer}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <ArrowRight size={18} />
            Transfer
          </button>
        </div>
      </div>

      {/* content */}
      {listLoading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Spinner className="w-8 h-8" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Landmark className="text-slate-300" size={48} />
          <p className="mt-3 text-slate-500">You have no accounts yet.</p>
          <button
            onClick={openCreate}
            className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Plus size={16} />
            Create your first account
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="group relative rounded-xl border border-gray-300 bg-white p-5  transition-shadow "
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Landmark size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {account.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Account Number:{" "}
                      <span className="text-blue-600">
                        {account.acc_number}{" "}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap space-y-2  items-center gap-1 transition-opacity ">
                  <div className="space-x-2 space-y-2">
                    <button
                      onClick={() => openAdjust(account, "deposit")}
                      className="bg-blue-600 text-white px-2 rounded-md hover:bg-blue-500 transition-bg duration-300 cursor-pointer"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => openAdjust(account, "withdraw")}
                      className="bg-red-600 text-white px-2 rounded-md hover:bg-red-500 transition-bg duration-300 cursor-pointer"
                    >
                      Withdraw
                    </button>
                  </div>
                  <div className="space-x-2 space-y-2">
                    <button
                      onClick={() => openEdit(account)}
                      aria-label="Edit account"
                      className="rounded-md p-1.5 border text-blue-500 border-gray-300"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(account)}
                      disabled={deletingId === account.id}
                      aria-label="Delete account"
                      className="rounded-md p-1.5 border text-red-500 border-gray-300"
                    >
                      {deletingId === account.id ? (
                        <Spinner className="w-4 h-4" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-2xl font-bold text-slate-800">
                {money(account.balance)}
              </p>
              <p className="text-xs text-slate-400">Available balance</p>
            </div>
          ))}
        </div>
      )}

      {/* create / edit popup */}
      {isPopupOpen && (
        <div className="fixed top-0 left-0 z-100 flex min-h-screen w-screen flex-col items-center justify-center bg-black/70 px-6">
          <div className="m-4 mx-auto w-full rounded-md bg-white px-8 py-6 lg:w-[30%]">
            <div className="flex items-center justify-between text-gray-800">
              <h2 className="text-2xl font-semibold">
                {editing ? "Edit Account" : "Create Account"}
              </h2>
              <XIcon
                className="cursor-pointer"
                onClick={() => setIsPopupOpen(false)}
              />
            </div>
            <div className="py-4">
              <form className="space-y-3" onSubmit={handleSave}>
                <div className="grid">
                  <label htmlFor="accountName">Account Name</label>
                  <input
                    id="accountName"
                    type="text"
                    autoFocus
                    value={accountName}
                    className="mt-2 rounded-md border border-gray-300 px-2 py-2"
                    placeholder="Enter account name eg: savings"
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    createAcoountState.loading || editAccountState.loading
                  }
                  className="flex items-center justify-center gap-2 rounded-md bg-slate-800 px-6 py-2 text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {createAcoountState.loading || editAccountState.loading ? (
                    <Spinner />
                  ) : editing ? (
                    "Save changes"
                  ) : (
                    "Create"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* transfer popup */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-100 flex min-h-screen w-screen items-center justify-center bg-slate-950/50 px-6 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            {/* close */}
            <button
              type="button"
              onClick={closeTransfer}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-md p-1 text-slate-400 opacity-70 transition-opacity hover:bg-slate-100 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <XIcon size={18} />
            </button>

            {/* header */}
            <div className="flex flex-col space-y-1.5 pr-6">
              <h2 className="text-lg font-semibold leading-none tracking-tight text-slate-900">
                {isConfirming ? "Confirm transfer" : "Transfer money"}
              </h2>
              <p className="text-sm text-slate-500">
                {isConfirming
                  ? "Please review the recipient before sending."
                  : "Find the recipient by their account number."}
              </p>
            </div>

            {isConfirming ? (
              /* ---------- confirmation step ---------- */
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    You are about to send
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {money(transferAmount)}
                  </p>
                  <div className="mt-3 flex items-center gap-3 border-t border-slate-200 pt-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {foundAccount?.ownerName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {foundAccount?.name} · #{foundAccount?.acc_number}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  Are you sure you want to send{" "}
                  <span className="font-semibold text-slate-900">
                    {money(transferAmount)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-900">
                    {foundAccount?.ownerName}
                  </span>{" "}
                  ({foundAccount?.name})? This can&apos;t be undone.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirming(false)}
                    disabled={transferState.loading}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmTransfer}
                    disabled={transferState.loading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60"
                  >
                    {transferState.loading ? <Spinner /> : "Send money"}
                  </button>
                </div>
              </div>
            ) : (
              /* ---------- form step ---------- */
              <form className="mt-6 space-y-4" onSubmit={handleReview}>
                {/* from */}
                <div className="grid gap-2">
                  <label
                    htmlFor="fromAccount"
                    className="text-sm font-medium leading-none text-slate-900"
                  >
                    From
                  </label>
                  <select
                    id="fromAccount"
                    value={fromId}
                    onChange={(e) => setFromId(e.target.value)}
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select source account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} · {money(account.balance)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* recipient search */}
                <div className="grid gap-2">
                  <label
                    htmlFor="accNumber"
                    className="text-sm font-medium leading-none text-slate-900"
                  >
                    Recipient account number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="accNumber"
                        type="text"
                        value={accNumberQuery}
                        onChange={(e) => setAccNumberQuery(e.target.value)}
                        className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="e.g. 48210375"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={findState.loading}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
                    >
                      {findState.loading ? <Spinner /> : "Search"}
                    </button>
                  </div>

                  {/* found account card */}
                  {foundAccount && (
                    <div className="mt-1 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <User size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {foundAccount.ownerName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {foundAccount.name} · #{foundAccount.acc_number}
                        </p>
                      </div>
                      <CheckCircle2 size={18} className="text-blue-600" />
                    </div>
                  )}
                </div>

                {/* amount */}
                <div className="grid gap-2">
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium leading-none text-slate-900"
                  >
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      $
                    </span>
                    <input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="h-10 w-full rounded-md border border-slate-200 pl-7 pr-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* footer */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeTransfer}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!foundAccount}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* deposit / withdraw popup */}
      {adjustAccount && (
        <div className="fixed inset-0 z-100 flex min-h-screen w-screen items-center justify-center bg-slate-950/50 px-6 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <button
              type="button"
              onClick={closeAdjust}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-md p-1 text-slate-400 opacity-70 transition-opacity hover:bg-slate-100 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <XIcon size={18} />
            </button>

            <div className="flex flex-col space-y-1.5 pr-6">
              <h2 className="text-lg font-semibold leading-none tracking-tight text-slate-900">
                {adjustMode === "withdraw" ? "Withdraw money" : "Deposit money"}
              </h2>
              <p className="text-sm text-slate-500">
                {adjustMode === "withdraw"
                  ? `Remove funds from ${adjustAccount.name}.`
                  : `Add funds to ${adjustAccount.name}.`}
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleAdjust}>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Current balance</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {money(adjustAccount.balance)}
                </p>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="adjustAmount"
                  className="text-sm font-medium leading-none text-slate-900"
                >
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    $
                  </span>
                  <input
                    id="adjustAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    autoFocus
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="h-10 w-full rounded-md border border-slate-200 pl-7 pr-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAdjust}
                  disabled={adjustState.loading}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustState.loading}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 disabled:opacity-60 ${
                    adjustMode === "withdraw"
                      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/40"
                      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/40"
                  }`}
                >
                  {adjustState.loading ? (
                    <Spinner />
                  ) : adjustMode === "withdraw" ? (
                    "Withdraw"
                  ) : (
                    "Deposit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
