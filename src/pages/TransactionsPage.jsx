import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Scale,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { listTransactionsFn } from "../redux/slices/transaction/fetchTransactions";
import Spinner from "../components/ui/Spinner";

const money = (n) => {
  const value = Number(n ?? 0);
  return `${value < 0 ? "-" : "+"}$${Math.abs(value).toLocaleString("en-US")}`;
};

const formatDate = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const filters = ["All", "Income", "Expenses"];

const TransactionsPage = () => {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const dispatch = useDispatch();

  const { data: transactions, loading, error } = useSelector(
    (state) => state.listTransactionSlice,
  );

  useEffect(() => {
    if (user?.id) dispatch(listTransactionsFn({ userId: user.id }));
  }, [dispatch, user?.id]);

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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      const amount = Number(tx.amount ?? 0);
      const matchesFilter =
        filter === "All" ||
        (filter === "Income" && amount > 0) ||
        (filter === "Expenses" && amount < 0);
      const haystack = [
        tx.description,
        tx.counterParty,
        tx.category,
        tx.account?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesFilter && haystack.includes(q);
    });
  }, [transactions, filter, query]);

  const stats = [
    {
      label: "Income",
      value: income,
      icon: ArrowDownLeft,
      tone: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Expenses",
      value: expenses,
      icon: ArrowUpRight,
      tone: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Net flow",
      value: net,
      icon: Scale,
      tone: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
        <p className="text-slate-500 text-sm mt-1">
          A record of every dollar in and out.
        </p>
      </div>

      {/* summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <span
              className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} ${stat.tone}`}
            >
              <stat.icon size={20} />
            </span>
            <p className="mt-4 text-2xl font-bold text-slate-800">
              {stat.label === "Expenses"
                ? `-$${stat.value.toLocaleString("en-US")}`
                : money(stat.value)}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 bg-slate-100 rounded-lg">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === f
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          />
        </div>
      </div>

      {/* table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Spinner className="w-8 h-8" />
          </div>
        ) : error ? (
          <p className="px-5 py-10 text-center text-sm text-red-500">{error}</p>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt className="text-slate-300" size={48} />
            <p className="mt-3 text-slate-500">No transactions yet.</p>
            <p className="text-sm text-slate-400">
              Transfers and payments will show up here.
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="font-medium px-5 py-3">Transaction</th>
                  <th className="font-medium px-5 py-3 hidden sm:table-cell">
                    Account
                  </th>
                  <th className="font-medium px-5 py-3 hidden sm:table-cell">
                    Category
                  </th>
                  <th className="font-medium px-5 py-3 hidden sm:table-cell">
                    Date
                  </th>
                  <th className="font-medium px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((tx) => {
                  const incoming = Number(tx.amount ?? 0) > 0;
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
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
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">
                              {tx.description || tx.counterParty || "Transaction"}
                            </p>
                            <p className="text-xs text-slate-400 sm:hidden">
                              {formatDate(tx.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell text-slate-500">
                        {tx.account?.name || "—"}
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                          {tx.category || "Other"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell text-slate-500">
                        {formatDate(tx.created_at)}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-right font-semibold ${
                          incoming ? "text-emerald-600" : "text-slate-700"
                        }`}
                      >
                        {money(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {visible.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-slate-400">
                No transactions match your search.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
