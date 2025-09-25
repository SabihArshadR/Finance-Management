"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiCreditCard,
  FiDollarSign,
  FiGrid,
  FiLogOut,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import { ErrorToast, SuccessToast } from "../ui/Toast";
import { usePathname, useRouter } from "next/navigation";
import Hamburger from "../ui/Hamburger";
import MobileSidebar from "../ui/MobileSidebar";
import { TbCategory } from "react-icons/tb";

type Expense = {
  _id?: string;
  categoryName?: string;
  amount: string;
  date: string;
  description: string;
  employee: string;
  employeeName?: string;
  flow: "in" | "out";
  txnDate?: string;
  spentBy?: any;
  category?: any;
};

type Category = {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  flow: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
};

export default function ExpenseManager() {
  const apiUrl = "https://finance-management-backend-eight.vercel.app";

  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<Expense>({
    category: "",
    categoryName: "",
    amount: "",
    date: "",
    description: "",
    employee: "",
    employeeName: "",
    flow: "out",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const router = useRouter();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTxns, setFilteredTxns] = useState<any[]>([]);
  const [searchName, setSearchName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [filterFlow, setFilterFlow] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDateRange, setFilterDateRange] = useState({
    start: "",
    end: "",
  });

  const getCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${apiUrl}/api/all-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data || []);
    } catch (error: any) {
      console.error(
        "Error fetching categories:",
        error.response?.data || error
      );
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${apiUrl}/api/auth/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error: any) {
      console.error("Error fetching users:", error.response?.data || error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(
        `${apiUrl}/api/transaction-report?year=2025`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data.data?.transactions || [];
      setTransactions(data);
      setFilteredTxns(data);
    } catch (err: any) {
      console.error("Error fetching transactions:", err.response?.data || err);
    }
  };

  useEffect(() => {
    getCategory();
    fetchUsers();
    fetchTransactions();
  }, []);

  useEffect(() => {
    let data = [...transactions];

    if (filterFlow) {
      data = data.filter((t) => t.flow === filterFlow);
    }
    if (filterUser) {
      data = data.filter((t) => t.spentBy?._id === filterUser);
    }
    if (filterCategory) {
      data = data.filter((t) => t.category?._id === filterCategory);
    }
    if (filterDateRange.start && filterDateRange.end) {
      const start = new Date(filterDateRange.start);
      const end = new Date(filterDateRange.end);
      data = data.filter((t) => {
        const txnDate = new Date(t.txnDate || t.date || t.createdAt);
        return txnDate >= start && txnDate <= end;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((t) =>
        (t.spentBy?.name || t.employeeName || "").toLowerCase().includes(q)
      );
    }

    setFilteredTxns(data);
  }, [
    filterFlow,
    filterUser,
    filterCategory,
    filterDateRange,
    transactions,
    searchQuery,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.amount) newErrors.amount = "Please enter an amount";
    if (!form.date) newErrors.date = "Please select a date";
    if (!form.description) newErrors.description = "Please enter a description";
    if (!form.employee) newErrors.employee = "Please select an employee";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addExpense = async () => {
    if (!validateForm()) return;
    setIsAddingExpense(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const payload = {
        spentBy: form.employee,
        category: form.category,
        amount: Number(form.amount),
        description: form.description,
        txnDate: new Date(form.date).toISOString(),
        flow: form.flow,
      };
      await axios.post(`${apiUrl}/api/add-transaction`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      SuccessToast("Expense added successfully!");
      setForm({
        category: "",
        categoryName: "",
        amount: "",
        date: "",
        description: "",
        employee: "",
        employeeName: "",
        flow: "out",
      });
      setErrors({});
      setShowExpenseModal(false);
      fetchTransactions();
    } catch (err: any) {
      console.error("Error adding expense:", err.response?.data || err);
      ErrorToast("Failed to add expense");
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleQuickSearch = () => {
    setSearchQuery(searchName.trim());
  };

  const clearQuickSearch = () => {
    setSearchName("");
    setSearchQuery("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { icon: <FiGrid />, label: "Dashboard", path: "/dashboard" },
    { icon: <FiUsers />, label: "Employees", path: "/employee" },
    { icon: <FiDollarSign />, label: "Transactions", path: "/expense" },
    { icon: <FiCreditCard />, label: "Loans", path: "/loan" },
    { icon: <TbCategory />, label: "Category", path: "/category" },
    { icon: <FiUsers />, label: "Partners", path: "/partner" },
  ];

  return (
    <div className="desktop:mb-0 tablet:mb-0 mobile:mb-10 fixed">
      <div className="text-white bg-gray-900 py-3 desktop:px-10 tablet:px-10 mobile:px-2 fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center">
          <div className="desktop:hidden tablet:hidden text-white">
            <Hamburger
              isOpen={isMobileOpen}
              onToggle={() => setIsMobileOpen(!isMobileOpen)}
            />
            <MobileSidebar
              isOpen={isMobileOpen}
              navItems={navItems}
              pathname={pathname}
              onClose={() => setIsMobileOpen(false)}
              onNavigate={(path) => router.push(path)}
            />
          </div>
          <h1 className="desktop:text-2xl tablet:text-3xl mobile:text-xl font-semibold">
            Transactions
          </h1>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-green-600 desktop:px-4 desktop:py-2 tablet:px-4 tablet:py-2 mobile:px-2 mobile:py-2 rounded-lg hover:bg-green-700 cursor-pointer flex"
            >
              + Add{" "}
              <span className="desktop:block tablet:block mobile:hidden">
                Transaction
              </span>
            </button>
            <div
              onClick={() => {
                handleLogout();
              }}
              className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors items-center flex"
            >
              <FiLogOut className="text-xl items-center" />
            </div>
          </div>
        </div>
      </div>

      <div className="desktop:px-10 tablet:px-10 mobile:px-2 mt-5 flex gap-3 text-white items-center relative pt-[60px]">
        <input
          type="text"
          placeholder="Search by employee name ..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
          className="px-4 desktop:py-3 tablet:py-3 mobile:py-1.5 rounded-full bg-white/10 border border-white/20 text-white w-full"
        />

        <button
          onClick={handleQuickSearch}
          className="p-2 rounded-lg hover:text-blue-600 cursor-pointer absolute desktop:right-25 tablet:right-25 mobile:right-15"
          title="Search"
        >
          <FiSearch size={20} />
        </button>

        <button
          onClick={() => setShowFilterModal(true)}
          className="p-2 rounded-lg bg-white/10 hover:bg-blue-600 cursor-pointer"
          title="Filters"
        >
          <IoFilter size={20} />
        </button>

        {searchQuery ? (
          <button
            onClick={clearQuickSearch}
            className="ml-2 p-2 rounded-lg bg-white/10 hover:bg-gray-700 cursor-pointer"
            title="Clear search"
          >
            <FiX size={18} />
          </button>
        ) : null}
      </div>

      <div className="min-h-screen desktop:p-10 tablet:p-10 mobile:p-2 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div>
          {filteredTxns.length === 0 ? (
            <p className="text-gray-400 text-center">
              No transactions available.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 desktop:gap-5 tablet:gap-5 mobile:gap-2">
              {filteredTxns.map((txn) => (
                <div
                  key={txn._id}
                  className="bg-white/10 p-4 rounded-lg border border-white/20"
                >
                  <p className="text-sm text-gray-400">
                    Spent By:{" "}
                    {txn.spentBy?.name || txn.employeeName || txn.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    Category:{" "}
                    {txn.category?.name || txn.categoryName || txn.name}
                  </p>
                  <p className="text-sm text-gray-400">Amount: {txn.amount}</p>
                  <p className="text-sm text-gray-400">Flow: {txn.flow}</p>
                  <p className="text-sm text-gray-400">
                    Date:{" "}
                    {new Date(
                      txn.txnDate || txn.date || txn.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {showFilterModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-lg bg-white/10 p-6 rounded-2xl shadow-xl text-white relative border border-white/20">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                onClick={() => setShowFilterModal(false)}
              >
                <FiX size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Search Filters
              </h2>

              <div className="space-y-4">
                <select
                  value={filterFlow}
                  onChange={(e) => setFilterFlow(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="">All Flows</option>
                  <option value="in">In</option>
                  <option value="out">Out</option>
                </select>

                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="">All Users</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="flex desktop:gap-2 mobile:gap-10 desktop:mr-0 mobile:mr-5">
                  <div className="relative w-full">
                    {!filterDateRange.start && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none mobile:block desktop:hidden">
                        Enter start date
                      </span>
                    )}
                    <input
                      type="date"
                      value={filterDateRange.start}
                      onChange={(e) =>
                        setFilterDateRange({
                          ...filterDateRange,
                          start: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    />
                  </div>
                  <div className="relative w-full">
                    {!filterDateRange.end && (
                      <span className="w-full absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none mobile:block desktop:hidden">
                        Enter end date
                      </span>
                    )}
                    <input
                      type="date"
                      value={filterDateRange.end}
                      onChange={(e) =>
                        setFilterDateRange({
                          ...filterDateRange,
                          end: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => {
                      setFilterFlow("");
                      setFilterUser("");
                      setFilterCategory("");
                      setFilterDateRange({ start: "", end: "" });
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 cursor-pointer"
                  >
                    Reset
                  </button>

                  <button
                    onClick={() => {
                      setShowFilterModal(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-md bg-white/10 p-6 rounded-2xl shadow-xl text-white relative border border-white/20">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                onClick={() => setShowExpenseModal(false)}
              >
                <FiX size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Add Transaction
              </h2>

              <div className="space-y-3">
                <label className="block text-sm font-medium">Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                      categoryName:
                        categories.find((c) => c._id === e.target.value)
                          ?.name || "",
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.category ? "border-red-500" : "border-white/20"
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <label className="block text-sm font-medium">Amount</label>
                <input
                  type="text"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.amount ? "border-red-500" : "border-white/20"
                  }`}
                />

                <label className="block text-sm font-medium">Date</label>
                <div className="relative w-full desktop:pr-0 mobile:pr-5">
                  {!form.date && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none mobile:block desktop:hidden">
                      Enter date
                    </span>
                  )}
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white ${
                      errors.date ? "border-red-500" : "border-white/20"
                    }`}
                  />
                </div>

                <label className="block text-sm font-medium">Description</label>
                <input
                  type="text"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.description ? "border-red-500" : "border-white/20"
                  }`}
                />

                <label className="block text-sm font-medium">Employee</label>
                <select
                  value={form.employee}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      employee: e.target.value,
                      employeeName:
                        users.find((u) => u._id === e.target.value)?.name || "",
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.employee ? "border-red-500" : "border-white/20"
                  }`}
                >
                  <option value="">Select Employee</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>

                <label className="block text-sm font-medium">Flow</label>
                <select
                  value={form.flow}
                  onChange={(e) =>
                    setForm({ ...form, flow: e.target.value as "in" | "out" })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
                >
                  <option value="in">In</option>
                  <option value="out">Out</option>
                </select>

                <button
                  onClick={addExpense}
                  disabled={isAddingExpense}
                  className="mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white px-4 py-2 rounded-lg w-full"
                >
                  {isAddingExpense
                    ? "Adding transaction..."
                    : "Add Transaction"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
