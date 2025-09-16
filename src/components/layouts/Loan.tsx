"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../ui/Toast";

type User = {
  _id: string;
  name: string;
  email: string;
};

export default function Home() {
  const apiUrl = "https://finance-backend-phi.vercel.app";

  const [users, setUsers] = useState<User[]>([]);

  const [loan, setLoan] = useState({
    lender: "",
    amount: "",
    interest: "",
    duration: "",
    purpose: "",
  });

  const [errors, setErrors] = useState({
    lender: "",
    amount: "",
    duration: "",
    interest: "",
    purpose: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
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
    fetchUsers();
  }, []);

  const validate = () => {
    const newErrors: any = {};
    if (!loan.lender) newErrors.lender = "Please select a lender";
    if (!loan.amount) newErrors.amount = "Please enter loan amount";
    if (!loan.duration) newErrors.duration = "Please enter duration in months";
    if (!loan.interest) newErrors.interest = "Please enter interest rate";
    if (!loan.purpose) newErrors.purpose = "Please enter purpose of loan";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addLoan = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const payload = {
        lender: loan.lender,
        amount: Number(loan.amount),
        interestRate: Number(loan.interest),
        durationMonths: Number(loan.duration),
        purpose: loan.purpose,
      };

      await axios.post(`${apiUrl}/api/add-loads`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      SuccessToast("Loan added successfully!");

      setLoan({
        lender: "",
        amount: "",
        interest: "",
        duration: "",
        purpose: "",
      });
      setErrors({
        lender: "",
        amount: "",
        duration: "",
        interest: "",
        purpose: "",
      });
    } catch (err: any) {
      console.error("Error adding loan:", err.response?.data || err);
      ErrorToast("Failed to add loan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumberInput = (field: keyof typeof loan, value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setLoan({ ...loan, [field]: value });
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-lg text-white">
        <h2 className="text-xl font-semibold mb-4 text-center">Add Loan</h2>
        <div className="space-y-4">
          <label className="block text-sm font-medium mb-1">
            Loan Provider
          </label>
          <select
            value={loan.lender}
            onChange={(e) => setLoan({ ...loan, lender: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
              errors.lender ? "border-red-500" : "border-white/20"
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
          >
            <option value="" className="bg-gray-900">
              Select Lender
            </option>
            {users.map((user) => (
              <option key={user._id} value={user._id} className="bg-gray-900">
                {user.name}
              </option>
            ))}
          </select>
          {errors.lender && (
            <p className="text-red-400 text-sm">{errors.lender}</p>
          )}
          <label className="block text-sm font-medium mb-1">Loan Amount</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Loan Amount"
            value={loan.amount}
            onChange={(e) => handleNumberInput("amount", e.target.value)}
            className={`mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border ${
              errors.amount ? "border-red-500" : "border-white/20"
            } placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
          />
          {errors.amount && (
            <p className="text-red-400 text-sm">{errors.amount}</p>
          )}
          <label className="block text-sm font-medium mb-1">
            Interest Rate (%)
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Interest Rate (%)"
            value={loan.interest}
            onChange={(e) => handleNumberInput("interest", e.target.value)}
            className={`mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border ${
              errors.interest ? "border-red-500" : "border-white/20"
            } placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
          />
          {errors.interest && (
            <p className="text-red-400 text-sm">{errors.interest}</p>
          )}
          <label className="block text-sm font-medium mb-1">
            Duration (months)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Duration (months)"
            value={loan.duration}
            onChange={(e) => handleNumberInput("duration", e.target.value)}
            className={`mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border ${
              errors.duration ? "border-red-500" : "border-white/20"
            } placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
          />
          {errors.duration && (
            <p className="text-red-400 text-sm">{errors.duration}</p>
          )}
          <label className="block text-sm font-medium mb-1">Purpose</label>
          <input
            type="text"
            placeholder="Purpose of Loan"
            value={loan.purpose}
            onChange={(e) => setLoan({ ...loan, purpose: e.target.value })}
            className={`mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border ${
              errors.purpose ? "border-red-500" : "border-white/20"
            } placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
          />
          {errors.purpose && (
            <p className="text-red-400 text-sm">{errors.purpose}</p>
          )}
          <button
            onClick={addLoan}
            disabled={isSubmitting}
            className="mt-5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white px-4 py-2 rounded-lg w-full"
          >
            {isSubmitting ? "Adding Loan..." : "Add Loan"}
          </button>
        </div>
      </div>
    </main>
  );
}
