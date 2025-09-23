"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { ErrorToast, SuccessToast } from "../ui/Toast";

type Expense = {
  _id?: string;
  category: string;
  categoryName?: string;
  amount: string;
  date: string;
  description: string;
  employee: string;
  employeeName?: string;
  flow: "in" | "out";
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
  // const apiUrl = "https://finance-backend-phi.vercel.app";
  const apiUrl = "http://localhost:3000";

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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [reportExpenses, setReportExpenses] = useState<Expense[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTxns, setFilteredTxns] = useState<any[]>([]);
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
      console.log(response.data.data, "categories");
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
      console.log(response, "users");
    } catch (error: any) {
      console.error("Error fetching users:", error.response?.data || error);
    }
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await axios.get(`${apiUrl}/api/transaction-report?year=2025`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.data.data?.transactions || [];
    setTransactions(data);
    setFilteredTxns(data);
  };

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
      console.log(payload);
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
      console.log(payload);
      setErrors({});
      setShowExpenseModal(false);
      fetchTransactions()
    } catch (err: any) {
      console.error("Error adding expense:", err.response?.data || err);
      ErrorToast("Failed to add expense");
    } finally {
      setIsAddingExpense(false);
    }
  };

  const fetchReport = async (
    type: "category" | "employee" | "date" | "flow"
  ) => {
    setLoadingReport(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      let url = "";
      if (type === "category" && selectedCategory) {
        url = `${apiUrl}/api/filter-transaction?category=${selectedCategory}`;
      } else if (type === "employee" && selectedEmployee) {
        url = `${apiUrl}/api/filter-transaction?spentBy=${selectedEmployee}`;
      } else if (type === "date" && dateRange.start && dateRange.end) {
        url = `${apiUrl}/api/filter-transaction?startDate=${dateRange.start}&endDate=${dateRange.end}`;
      } else if (type === "flow" && form.flow) {
        url = `${apiUrl}/api/filter-transaction?flow=${form.flow}`;
      }

      if (url) {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReportExpenses(res.data.data || []);
      }
    } catch (err: any) {
      console.error("Error fetching report:", err.response?.data || err);
      ErrorToast("Failed to fetch report");
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    getCategory();
    fetchUsers();
    fetchR();
    fetchFlow();
    fetchTransactions();
  }, []);

  const fetchR = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${apiUrl}/api/transaction-report?year=2025`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data.data?.transactions || [];
      setTransactions(data);
      console.log(data, "fetch report");
    } catch (error: any) {
      console.error(
        "Error fetching transactions:",
        error.response?.data || error
      );
    }
  };

  const fetchFlow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${apiUrl}/api/filter-transaction?flow=in`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(response.data.data, "fetch flow");
    } catch (error: any) {
      console.error(
        "Error fetching transactions:",
        error.response?.data || error
      );
    }
  };

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
        const txnDate = new Date(t.txnDate);
        return txnDate >= start && txnDate <= end;
      });
    }

    setFilteredTxns(data);
  }, [filterFlow, filterUser, filterCategory, filterDateRange, transactions]);

  return (
    <div className="desktop:mb-0 tablet:mb-0 mobile:mb-20">
      <div className="px-10 mt-5">
        <input
          type="text"
          placeholder="Search expense by name..."
          // value={search}
          // onChange={(e) => setSearch(e.target.value)}
          className="px-4 desktop:py-3 tablet:py-3 mobile:py-1.5 rounded-full bg-white/10 
          border border-white/20 text-white w-full"
        />
      </div>
      <div className="min-h-screen p-10 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="desktop:text-3xl tablet:text-3xl mobile:text-xl font-semibold">
            Transactions
          </h1>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-green-600 desktop:px-4 desktop:py-2 tablet:px-4 tablet:py-2 mobile:py-1 mobile:px-1 rounded-lg hover:bg-green-700 cursor-pointer"
          >
            + Add Transaction
          </button>
        </div>

        <div className="grid desktop:grid-cols-10 tablet:grid-cols-5 mobile:grid-cols-1 gap-4 mb-6">
          <select
            value={filterFlow}
            onChange={(e) => setFilterFlow(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
          >
            <option value="" className="bg-gray-900">All Flows</option>
            <option value="in" className="bg-gray-900">In</option>
            <option value="out" className="bg-gray-900">Out</option>
          </select>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
          >
            <option value="" className="bg-gray-900">All Users</option>
            {users.map((u) => (
              <option key={u._id} value={u._id} className="bg-gray-900">
                {u.name}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
          >
            <option value="" className="bg-gray-900">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id} className="bg-gray-900">
                {c.name}
              </option>
            ))}
          </select>
          <div className="desktop:flex tablet:flex mobile:grid gap-2">
            <input
              type="date"
              value={filterDateRange.start}
              onChange={(e) =>
                setFilterDateRange({
                  ...filterDateRange,
                  start: e.target.value,
                })
              }
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white w-full"
            />
            <input
              type="date"
              value={filterDateRange.end}
              onChange={(e) =>
                setFilterDateRange({ ...filterDateRange, end: e.target.value })
              }
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white w-full"
            />
          </div>
        </div>
        <div>
          {filteredTxns.length === 0 ? (
            <p className="text-gray-400 text-center">
              No transactions available.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTxns.map((txn) => (
                <div
                  key={txn._id}
                  className="bg-white/10 p-4 rounded-lg border border-white/20"
                >
                  <h3 className="text-lg font-semibold">{txn.name}</h3>
                  <p className="text-sm text-gray-400">
                    Spent By: {txn.spentBy?.name || txn.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    Category: {txn.category?.name || txn.name}
                  </p>
                  <p className="text-sm text-gray-400">Amount: {txn.amount}</p>
                  <p className="text-sm text-gray-400">Flow: {txn.flow}</p>
                  <p className="text-sm text-gray-400">
                    Date: {new Date(txn.txnDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div
              className="w-full max-w-md bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl 
            text-white relative border border-white/20"
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer"
                onClick={() => setShowExpenseModal(false)}
              >
                <FiX size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4 text-center">
                Add transaction
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
                  <option value="" className="bg-gray-900">
                    Select Category
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat._id}
                      value={cat._id}
                      className="bg-gray-900"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-400 text-sm">{errors.category}</p>
                )}

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
                {errors.amount && (
                  <p className="text-red-400 text-sm">{errors.amount}</p>
                )}
                <label className="block text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.date ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.date && (
                  <p className="text-red-400 text-sm">{errors.date}</p>
                )}
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
                {errors.description && (
                  <p className="text-red-400 text-sm">{errors.description}</p>
                )}
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
                  <option value="" className="bg-gray-900">
                    Select Employee
                  </option>
                  {users.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                      className="bg-gray-900"
                    >
                      {user.name}
                    </option>
                  ))}
                </select>
                {errors.employee && (
                  <p className="text-red-400 text-sm">{errors.employee}</p>
                )}
                <label className="block text-sm font-medium mt-4 mb-1">
                  Flow
                </label>
                <select
                  value={form.flow}
                  onChange={(e) =>
                    setForm({ ...form, flow: e.target.value as "in" | "out" })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
                >
                  <option className="bg-gray-900" value="in">
                    In
                  </option>
                  <option className="bg-gray-900" value="out">
                    Out
                  </option>
                </select>
                <button
                  onClick={addExpense}
                  disabled={isAddingExpense}
                  className="mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 
                  disabled:cursor-not-allowed cursor-pointer text-white px-4 py-2 
                  rounded-lg w-full"
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
