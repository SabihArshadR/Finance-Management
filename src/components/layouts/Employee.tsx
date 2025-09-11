"use client";
import axios from "axios";
import { useState } from "react";

type Employee = {
  name: string;
  email: string;
  password: string;
  salary: string;
  bankAccount: string;
  allowance: string;
};

export default function Home() {
  const [form, setForm] = useState<Employee>({
    name: "",
    email: "",
    password: "",
    salary: "",
    bankAccount: "",
    allowance: "",
  });

  const apiUrl = "https://finance-backend-phi.vercel.app";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleAddEmployee = async () => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);

    if (!token) {
      alert("No token found. Please login first.");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: "employee",
      salary: Number(form.salary),
      meta: {
        bankAccount: form.bankAccount,
        allowance: Number(form.allowance),
      },
    };

    console.log("Employee payload being sent:", payload);

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/add-user`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response:", response.data);

      setForm({
        name: "",
        email: "",
        password: "",
        salary: "",
        bankAccount: "",
        allowance: "",
      });

      alert("Employee added successfully!");
    } catch (error: any) {
      console.error("Error adding employee:", error.response?.data || error);
      alert("Failed to add employee. Please try again.");
    }
  };

  async function allusers() {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${apiUrl}/api/auth/get-users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(res)
  }

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
            type="text"
            placeholder="Employee Name"
            value={form.name}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="email"
            type="email"
            placeholder="Employee Email"
            value={form.email}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="password"
            placeholder="Employee Password"
            value={form.password}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium mb-1">Salary</label>
          <input
            type="text"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="salary"
            value={form.salary}
            placeholder="Employee Salary"
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
            type="text"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            name="allowance"
            placeholder="Employee Allowance"
            value={form.allowance}
            onChange={handleChange}
          />
        </div>

        <button 
        onClick={handleAddEmployee}
        className="w-full mt-10 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Employee
        </button>
      </div>
      <button onClick={allusers}>get user</button>
    </main>
  );
}
