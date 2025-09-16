"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { ErrorToast, SuccessToast } from "../ui/Toast";

type Expense = {
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
  const [newCategory, setNewCategory] = useState("");
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
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const getCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/all-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error.response?.data || error);
    }
  };

  const addCategory = async () => {
    if (!newCategory) return;
    setIsAddingCategory(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.post(
        `${apiUrl}/api/add-category`,
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await getCategory();
      setNewCategory("");
      SuccessToast("Category added successfully!");
    } catch (error: any) {
      console.error("Error adding category:", error.response?.data || error);
      ErrorToast("Failed to add category");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(`${apiUrl}/api/delete-category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      SuccessToast("Category deleted successfully")
      await getCategory();
    } catch (err: any) {
      console.error("Error deleting category:", err.response?.data || err);
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
      console.log(payload)

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
    } catch (err: any) {
      console.error("Error adding expense:", err.response?.data || err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to add expense";

      ErrorToast(errorMsg);
    } finally {
      setIsAddingExpense(false);
    }
  };

  // fetch users
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

  useEffect(() => {
    getCategory();
    fetchUsers();
  }, []);

  return (
    <main className="min-h-screen flex p-4 items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-lg text-white">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Expense Manager
        </h1>

        {/* Category Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-center">Categories</h2>
          <div className="mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add custom category"
              className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={addCategory}
              disabled={isAddingCategory}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white px-4 py-2 rounded-lg w-full mt-5"
            >
              {isAddingCategory ? "Adding Category..." : "Add Category"}
            </button>
          </div>
          <ul className="mt-3">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="flex justify-between items-center px-2 py-1 text-sm"
              >
                {cat.name}
                <FiTrash2
                  className="text-red-500 cursor-pointer"
                  onClick={() => deleteCategory(cat._id)}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* Expense Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-center">
            Add Expense
          </h2>
          <div className="rounded shadow space-y-3">
            {/* Category */}
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                  categoryName:
                    categories.find((c) => c._id === e.target.value)?.name ||
                    "",
                })
              }
              className={`mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border ${
                errors.category ? "border-red-500" : "border-white/20"
              }`}
            >
              <option value="" className="bg-gray-900">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id} className="bg-gray-900">
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-sm">{errors.category}</p>
            )}

            {/* Amount */}
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="text"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={`mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border ${
                errors.amount ? "border-red-500" : "border-white/20"
              }`}
            />
            {errors.amount && (
              <p className="text-red-400 text-sm">{errors.amount}</p>
            )}

            {/* Date */}
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={`mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border ${
                errors.date ? "border-red-500" : "border-white/20"
              }`}
            />
            {errors.date && (
              <p className="text-red-400 text-sm">{errors.date}</p>
            )}

            {/* Description */}
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={`mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border ${
                errors.description ? "border-red-500" : "border-white/20"
              }`}
            />
            {errors.description && (
              <p className="text-red-400 text-sm">{errors.description}</p>
            )}

            {/* Employee */}
            <label className="block text-sm font-medium mb-1">Employee</label>
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
              className={`mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border ${
                errors.employee ? "border-red-500" : "border-white/20"
              }`}
            >
              <option value="" className="bg-gray-900">Select Employee</option>
              {users.map((user) => (
                <option key={user._id} value={user._id} className="bg-gray-900">
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
              className="mt-5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white px-4 py-2 rounded-lg w-full"
            >
              {isAddingExpense ? "Adding Expense..." : "Add Expense"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
