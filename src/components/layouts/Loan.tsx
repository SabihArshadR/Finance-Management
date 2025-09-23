"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { ErrorToast, SuccessToast } from "../ui/Toast";

type User = {
  _id: string;
  name: string;
  email: string;
};

type Loan = {
  _id: string;
  lender: string;
  totalAmount: number;
  duration: number;
  emiAmount: number;
  totalPayable: number;
  totalPaid: number;
  remaining: number;
  startDate: string;
  endDate: string;
};

export default function LoanPage() {
  // const apiUrl = "https://finance-backend-phi.vercel.app";
  const apiUrl = "http://localhost:3000";

  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/loan-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoans(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error: any) {
      console.error("Error fetching loans:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLoans();
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

      await axios.post(`${apiUrl}/api/add-load`, payload, {
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
      setIsLoanModalOpen(false);
      fetchLoans();
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

  const filteredLoans = loans.filter((loan) => {
  const lenderName =
    users.find((user) => user._id === loan.lender)?.name || loan.lender;

  return lenderName.toLowerCase().includes(search.toLowerCase());
});

  return (
    <div className="desktop:mb-0 tablet:mb-0 mobile:mb-20">
      <div className="px-10 mt-5">
        <input
          type="text"
          placeholder="Search loan by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 desktop:py-3 tablet:py-3 mobile:py-1.5 rounded-full 
          bg-white/10 border border-white/20 text-white w-full"
        />
      </div>
    <div
      className="min-h-screen desktop:p-10 tablet:p-10 mobile:p-2 
      bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
      >
      <div className="flex justify-between items-center mb-6">
        <h1 className="desktop:text-3xl tablet:text-3xl mobile:text-lg font-semibold">
          Loans
        </h1>
        <button
          onClick={() => setIsLoanModalOpen(true)}
          className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer"
        >
          + Add Loan
        </button>
      </div>
      {loading ? (
        <div className="text-center text-gray-400 mt-20">Loading loans...</div>
      ) : filteredLoans.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          No loans available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
          {filteredLoans.map((loan) => (
            <div
              key={loan._id}
              className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 
              rounded-2xl shadow-lg"
              >
              <h2 className="text-xl font-semibold mb-2">{loan.lender}</h2>
              <p className="text-sm text-gray-300 mb-1">
                Amount: <span className="text-white">${loan.totalAmount}</span>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                Duration:{" "}
                <span className="text-white">{loan.duration} months</span>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                EMI: <span className="text-white">${loan.emiAmount}</span>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                Total Payable:{" "}
                <span className="text-white">${loan.totalPayable}</span>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                Paid: <span className="text-white">${loan.totalPaid}</span>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                Remaining: <span className="text-white">${loan.remaining}</span>
              </p>
              <p className="text-sm text-gray-300">
                Period:{" "}
                <span className="text-white">
                  {new Date(loan.startDate).toLocaleDateString()} -{" "}
                  {new Date(loan.endDate).toLocaleDateString()}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
      {isLoanModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-6 
          rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer text-xl"
              onClick={() => setIsLoanModalOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-center">
              Add Loan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Loan Provider
                </label>
                <select
                  value={loan.lender}
                  onChange={(e) => setLoan({ ...loan, lender: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.lender ? "border-red-500" : "border-white/20"
                  } text-white`}
                >
                  <option value="" className="bg-gray-900">
                    Select Lender
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
                {errors.lender && (
                  <p className="text-red-400 text-sm">{errors.lender}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Loan Amount
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Loan Amount"
                  value={loan.amount}
                  onChange={(e) => handleNumberInput("amount", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.amount ? "border-red-500" : "border-white/20"
                  }`}
                  />
                {errors.amount && (
                  <p className="text-red-400 text-sm">{errors.amount}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Interest Rate (%)"
                  value={loan.interest}
                  onChange={(e) =>
                    handleNumberInput("interest", e.target.value)
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.interest ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.interest && (
                  <p className="text-red-400 text-sm">{errors.interest}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration (months)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Duration (months)"
                  value={loan.duration}
                  onChange={(e) =>
                    handleNumberInput("duration", e.target.value)
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.duration ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.duration && (
                  <p className="text-red-400 text-sm">{errors.duration}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Purpose
                </label>
                <input
                  type="text"
                  placeholder="Purpose of Loan"
                  value={loan.purpose}
                  onChange={(e) =>
                    setLoan({ ...loan, purpose: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.purpose ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.purpose && (
                  <p className="text-red-400 text-sm">{errors.purpose}</p>
                )}
              </div>
              <button
                onClick={addLoan}
                disabled={isSubmitting}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:opacity-50 
                cursor-pointer px-4 py-2 rounded-lg"
                >
                {isSubmitting ? "Adding Loan..." : "Add Loan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
                </div>
  );
}
