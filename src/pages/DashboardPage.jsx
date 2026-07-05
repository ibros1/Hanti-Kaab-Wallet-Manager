import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  PiggyBank,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { listAccountsFn } from "../redux/slices/account/fetchAccounts";
import { listTransactionsFn } from "../redux/slices/transaction/fetchTransactions";
import Spinner from "../components/ui/Spinner";

const money = (n) => {
  const value = Number(n ?? 0);
  return `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-US")}`;
};

const formatDate = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const DashboardPage = () => {
  const { profile, user } = useAuth();
  const name = profile?.username || "there";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: accounts, loading: accountsLoading } = useSelector(
    (state) => state.listAccountSlice,
  );
  const { data: transactions, loading: txLoading } = useSelector(
    (state) => state.listTransactionSlice,
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(listAccountsFn({ userId: user.id }));
      dispatch(listTransactionsFn({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) => sum + Number(acc.balance ?? 0), 0),
    [accounts],
  );

  const { income, expenses, net } = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount ?? 0);
        if (amount >= 0) acc.income += amount;
        else acc.expenses += Math.abs(amount);
        acc.net += amount;
        return acc;
      },
      { income: 0, expenses: 0, net: 0 },
    );
  }, [transactions]);

  const recent = useMemo(() => transactions.slice(0, 5), [transactions]);

  const stats = [
    { label: "Income", value: income, icon: ArrowDownLeft, tone: "text-emerald-600" },
    { label: "Expenses", value: expenses, icon: ArrowUpRight, tone: "text-red-500" },
    { label: "Net flow", value: net, icon: PiggyBank, tone: "text-blue-600" },
  ];

  return (
    <div className="py-6 space-y-6">
      {/* greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, {name} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here's how your money is moving.
        </p>
      </div>

      {/* signature: total balance + supporting stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* balance hero */}
        <div className="lg:col-span-1 relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-blue-600/30 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Wallet size={18} />
              Total Balance
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight">
              {accountsLoading ? "—" : money(totalBalance)}
            </p>
            <div
              className={`mt-4 inline-flex items-center gap-1 text-sm ${
                net >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {net >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {money(net)} net flow
            </div>
          </div>
        </div>

        {/* supporting stats */}
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between"
            >
              <stat.icon size={22} className={stat.tone} />
              <div className="mt-6">
                <p className="text-2xl font-bold text-slate-800">
                  {txLoading ? "—" : money(stat.value)}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* lower grid: transactions + accounts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* recent transactions */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent transactions</h2>
            <button
              onClick={() => navigate("/transactions")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </button>
          </div>

          {txLoading ? (
            <div className="flex justify-center py-12 text-slate-400">
              <Spinner className="w-7 h-7" />
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="text-slate-300" size={40} />
              <p className="mt-2 text-sm text-slate-500">No transactions yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((tx) => {
                const incoming = Number(tx.amount ?? 0) > 0;
                return (
                  <li
                    key={tx.id}
                    className="flex items-center gap-3 px-5 py-3.5"
                  >
                    <span
                      className={`flex items-center justify-center w-9 h-9 rounded-full ${
                        incoming
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {incoming ? (
                        <ArrowDownLeft size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {tx.description || tx.counterParty || "Transaction"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {tx.category || "Other"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          incoming ? "text-emerald-600" : "text-slate-700"
                        }`}
                      >
                        {money(tx.amount)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* accounts */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Your accounts</h2>
            <button
              onClick={() => navigate("/accounts")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Manage
            </button>
          </div>

          {accountsLoading ? (
            <div className="flex justify-center py-12 text-slate-400">
              <Spinner className="w-7 h-7" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Landmark className="text-slate-300" size={40} />
              <p className="mt-2 text-sm text-slate-500">No accounts yet.</p>
            </div>
          ) : (
            <ul className="p-3 space-y-1">
              {accounts.map((acc) => (
                <li
                  key={acc.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600">
                    <Landmark size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {acc.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      #{acc.acc_number}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {money(acc.balance)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
