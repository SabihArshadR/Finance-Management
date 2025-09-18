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
};

type Category = {
  _id: string;
  name: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
};

export default function ExpenseManager() {
  const apiUrl = "https://finance-backend-phi.vercel.app";

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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [reportExpenses, setReportExpenses] = useState<Expense[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);

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
        flow: "in",
        description: form.description,
        txnDate: new Date(form.date).toISOString(),
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
      });
      setErrors({});
      setShowExpenseModal(false);
    } catch (err: any) {
      console.error("Error adding expense:", err.response?.data || err);
      ErrorToast("Failed to add expense");
    } finally {
      setIsAddingExpense(false);
    }
  };

  const fetchReport = async (type: "category" | "employee" | "date") => {
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
  }, []);

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
          <h1 className="desktop:text-3xl tablet:text-3xl mobile:text-2xl font-semibold">Expenses</h1>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer"
          >
            + Add Expense
          </button>
        </div>
        <div className="flex flex-col mx-auto gap-6 mb-10 max-w-md justify-center">
          <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h2 className="font-semibold mb-2">Expenses by Category</h2>
            <select
              className="w-full p-2 rounded-lg bg-white/10 mb-3"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="" className="bg-gray-900 max-w-md">
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id} className="bg-gray-900">
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchReport("category")}
              className="w-full bg-blue-600 py-2 rounded-lg hover:bg-blue-700"
            >
              Show
            </button>
          </div>
          <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h2 className="font-semibold mb-2">Expenses by Employee</h2>
            <select
              className="w-full p-2 rounded-lg bg-white/10 mb-3"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="" className="bg-gray-900">
                Select Employee
              </option>
              {users.map((u) => (
                <option key={u._id} value={u._id} className="bg-gray-900">
                  {u.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchReport("employee")}
              className="w-full bg-blue-600 py-2 rounded-lg hover:bg-blue-700"
            >
              Show
            </button>
          </div>
          <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h2 className="font-semibold mb-2">Expenses by Date Range</h2>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="w-full p-2 rounded-lg bg-white/10 mb-2"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="w-full p-2 rounded-lg bg-white/10 mb-3"
            />
            <button
              onClick={() => fetchReport("date")}
              className="w-full bg-blue-600 py-2 rounded-lg hover:bg-blue-700"
            >
              Show
            </button>
          </div>
        </div>
        <div className="bg-white/5 p-6 rounded-xl border border-white/20 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">Report Results</h2>
          {loadingReport ? (
            <p className="text-gray-400">Loading...</p>
          ) : reportExpenses.length === 0 ? (
            <p className="text-gray-400">No data available.</p>
          ) : (
            <div className="space-y-3">
              {reportExpenses.map((exp) => (
                <div
                  key={exp._id}
                  className="bg-white/10 p-4 rounded-lg flex justify-between"
                >
                  <div>
                    <p className="font-medium">{exp.description}</p>
                    <p className="text-sm text-gray-400">
                      {exp.employeeName} • {exp.categoryName}
                    </p>
                  </div>
                  <div className="font-semibold">Rs {exp.amount}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl 
            text-white relative border border-white/20">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer"
                onClick={() => setShowExpenseModal(false)}
              >
                <FiX size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4 text-center">
                Add Expense
              </h2>

              <div className="space-y-3">
                {/* Category */}
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
                <button
                  onClick={addExpense}
                  disabled={isAddingExpense}
                  className="mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 
                  disabled:cursor-not-allowed cursor-pointer text-white px-4 py-2 
                  rounded-lg w-full"
                >
                  {isAddingExpense ? "Adding Expense..." : "Add Expense"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
