"use client";
import { useState } from "react";

type Expense = {
  category: string;
  amount: number;
  date: string; 
  description: string;
  employee: string;
};

export default function ExpenseManager() {
  const defaultCategories = [
    "Rent",
    "Utilities",
    "Office Supplies",
    "Marketing",
    "Travel",
    "Miscellaneous",
  ];

  const [categories, setCategories] = useState(defaultCategories);
  const [newCategory, setNewCategory] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState<Expense>({
    category: "Rent",
    amount: 0,
    date: "",
    description: "",
    employee: "",
  });
  const [filterCategory, setFilterCategory] = useState("All");
  const [reportType, setReportType] = useState("monthly");

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const addExpense = () => {
    if (!form.amount || !form.date) return;
    setExpenses([...expenses, form]);
    setForm({
      category: "Rent",
      amount: 0,
      date: "",
      description: "",
      employee: "",
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-lg text-white">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Expense Manager
        </h1>

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
              className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-5"
            >
              Add
            </button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-center">
            Add Expense
          </h2>
          <div className="rounded shadow space-y-3">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {categories.map((cat, i) => (
                <option key={i} className="bg-gray-900">
                  {cat}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="text"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
              className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <label className="block text-sm font-medium mb-1">Employee</label>
            <input
              type="text"
              placeholder="Employee name"
              value={form.employee}
              onChange={(e) =>
                setForm({ ...form, employee: e.target.value })
              }
              className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <button
              onClick={addExpense}
              className="mt-5 bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Save Expense
            </button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-center">
            Expenses List
          </h2>
          <div className="mb-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="All" className="bg-gray-900">
                All Categories
              </option>
              {categories.map((cat, i) => (
                <option key={i} value={cat} className="bg-gray-900">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <ul className="space-y-2">
            {expenses
              .filter(
                (exp) =>
                  filterCategory === "All" || exp.category === filterCategory
              )
              .map((exp, i) => (
                <li
                  key={i}
                  className="p-3 bg-white/10 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{exp.category}</p>
                    <p className="text-sm text-gray-300">{exp.description}</p>
                    <p className="text-sm text-gray-400">{exp.employee}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${exp.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{exp.date}</p>
                  </div>
                </li>
              ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3 text-center">Reports</h2>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="monthly" className="bg-gray-900">
              Monthly
            </option>
            <option value="yearly" className="bg-gray-900">
              Yearly
            </option>
          </select>
        </section>
      </div>
    </main>
  );
}
