"use client";

import { useState } from "react";

type Employee = {
  id?: string;
  name: string;
  designation: string;
  salary: number;
  joiningDate: string;
  bankAccount: string;
  allowance: number;
  bonus: number;
};

export default function Home() {
  const [form, setForm] = useState<Employee>({
    name: "",
    designation: "",
    salary: 0,
    joiningDate: "",
    bankAccount: "",
    allowance: 0,
    bonus: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="mw-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-4 text-center">Add Employee</h1>

        <div className="space-y-6">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="name"
            placeholder="Employee Name"
            value={form.name}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium mb-1">Designation</label>
          <input
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="designation"
            placeholder="Employee Designation"
            value={form.designation}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium mb-1">Salary</label>
          <input
            type="number"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="salary"
            placeholder="Employee Salary"
            value={form.salary}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium mb-1">Joining Date</label>
          <input
            type="date"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="joiningDate"
            value={form.joiningDate}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium mb-1">
            Bank Account Number
          </label>
          <input
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="bankAccount"
            placeholder="Employee Account Number"
            value={form.bankAccount}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium mb-1">Allowance</label>
          <input
            type="number"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="allowance"
            placeholder="Employee Allowance"
            value={form.allowance}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium mb-1">Bonus</label>
          <input
            type="number"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="bonus"
            placeholder="Employee Bonus"
            value={form.bonus}
            onChange={handleChange}
          />
        </div>

        <button className="w-full mt-10 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Employee
        </button>
      </div>
    </main>
  );
}
