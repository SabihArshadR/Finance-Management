"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiCreditCard,
  FiDollarSign,
  FiGrid,
  FiLogOut,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import { SuccessToast, ErrorToast } from "../ui/Toast";
import { usePathname, useRouter } from "next/navigation";
import Hamburger from "../ui/Hamburger";
import MobileSidebar from "../ui/MobileSidebar";
import { TbCategory } from "react-icons/tb";

type User = {
  _id: string;
  name: string;
  email: string;
};

type Loan = {
  _id: string;
  lender: string;
  totalAmount?: number;
  amount?: number;
  duration: number;
  emiAmount?: number;
  totalPayable?: number;
  totalPaid?: number;
  remaining?: number;
  startDate: string;
  endDate: string;
};

export default function LoanPage() {
  const apiUrl = "https://finance-management-backend-eight.vercel.app";

  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loanForm, setLoanForm] = useState({
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
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${apiUrl}/api/auth/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err: any) {
      console.error("Error fetching users:", err.response?.data || err);
    }
  };

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${apiUrl}/api/loan-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setLoans(data);
      setFilteredLoans(data);
    } catch (err: any) {
      console.error("Error fetching loans:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLoans();
  }, []);

  const getLoanAmount = (l: Loan) =>
    (l as any).totalAmount ?? (l as any).amount ?? 0;

  const handleQuickSearch = () => {
    if (!searchName.trim()) {
      setFilteredLoans(loans);
      return;
    }
    const q = searchName.toLowerCase();
    const result = loans.filter((l) => {
      const lenderName =
        users.find((u) => u._id === l.lender)?.name || l.lender || "";
      return lenderName.toLowerCase().includes(q);
    });
    setFilteredLoans(result);
  };

  const getFiltered = (list: Loan[]) => {
    const { name, startDate, endDate, minAmount, maxAmount } = filters;
    return list.filter((l) => {
      const lenderName =
        users.find((u) => u._id === l.lender)?.name || l.lender || "";

      if (name && !lenderName.toLowerCase().includes(name.toLowerCase()))
        return false;

      if (startDate) {
        const loanStart = new Date(l.startDate);
        if (isNaN(loanStart.getTime()) || loanStart < new Date(startDate))
          return false;
      }

      if (endDate) {
        const loanEnd = new Date(l.endDate);
        if (isNaN(loanEnd.getTime()) || loanEnd > new Date(endDate))
          return false;
      }

      const amt = getLoanAmount(l);
      if (minAmount && amt < Number(minAmount)) return false;
      if (maxAmount && amt > Number(maxAmount)) return false;

      return true;
    });
  };

  const applyFilters = () => {
    setFilteredLoans(getFiltered(loans));
    setIsFilterModalOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });
    setFilteredLoans(loans);
    setIsFilterModalOpen(false);
  };

  const validate = () => {
    const newErrors: any = {};
    if (!loanForm.lender) newErrors.lender = "Please select a lender";
    if (!loanForm.amount) newErrors.amount = "Please enter loan amount";
    if (!loanForm.duration) newErrors.duration = "Please enter duration";
    if (!loanForm.interest) newErrors.interest = "Please enter interest rate";
    if (!loanForm.purpose) newErrors.purpose = "Please enter purpose";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addLoan = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        ErrorToast("No token found. Please login.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        lender: loanForm.lender,
        amount: Number(loanForm.amount),
        interestRate: Number(loanForm.interest),
        durationMonths: Number(loanForm.duration),
        purpose: loanForm.purpose,
      };
      await axios.post(`${apiUrl}/api/add-load`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      SuccessToast("Loan added successfully!");
      setLoanForm({
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
      await fetchLoans();
    } catch (err: any) {
      console.error("Error adding loan:", err.response?.data || err);
      ErrorToast(err.response?.data?.message || "Failed to add loan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumberInput = (field: keyof typeof loanForm, value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setLoanForm({ ...loanForm, [field]: value });
    }
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
    <div className="desktop:mb-0 tablet:mb-0 mobile:mb-20">
      <div className="text-white bg-gray-900 desktop:px-10 tablet:px-10 mobile:px-2 py-3 fixed top-0 desktop:left-64 tablet:left-64 mobile:left-0 right-0 z-50">
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
          <h1 className="desktop:text-2xl tablet:text-3xl mobile:text-lg font-semibold">
            Loans
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setIsLoanModalOpen(true)}
              className="bg-green-600 desktop:px-4 desktop:py-2 tablet:px-4 tablet:py-2 mobile:px-2 mobile:py-2 rounded-lg hover:bg-green-700 cursor-pointer flex"
            >
              + Add{" "}
              <span className="desktop:block tablet:block mobile:hidden">
                Loan
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
          placeholder="Search loan by lender name ..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
          className="px-4 desktop:py-3 tablet:py-3 mobile:py-1.5 rounded-full bg-white/10 border border-white/20 text-white w-full"
        />
        <button
          onClick={handleQuickSearch}
          className="absolute p-2 rounded-lg hover:text-blue-600 cursor-pointer desktop:right-25 tablet:right-25 mobile:right-15"
          title="Search"
        >
          <FiSearch size={20} />
        </button>

        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="p-2 rounded-lg bg-white/10 hover:bg-blue-600 cursor-pointer"
          title="Advanced filters"
        >
          <IoFilter size={20} />
        </button>
      </div>
      <div className="desktop:p-10 tablet:p-10 mobile:p-2  text-white">
        {loading ? (
          <div className="text-center text-gray-400">
            Loading loans...
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">No loans found.</div>
        ) : (
          <div className="grid desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-1 desktop:gap-6 tablet:gap-6 mobile:gap-2">
            {filteredLoans.map((ln) => {
              const lenderName =
                users.find((u) => u._id === ln.lender)?.name ||
                ln.lender ||
                "Unknown";
              const amount = getLoanAmount(ln);
              return (
                <div
                  key={ln._id}
                  className="bg-white/10 p-6 rounded-2xl shadow-lg border border-white/20"
                >
                  <h3 className="text-lg font-semibold mb-2">{lenderName}</h3>
                  <p className="text-sm text-gray-300 mb-1">
                    Amount: <span className="text-white">${amount}</span>
                  </p>
                  <p className="text-sm text-gray-300 mb-1">
                    Duration:{" "}
                    <span className="text-white">{ln.duration} months</span>
                  </p>
                  <p className="text-sm text-gray-300 mb-1">
                    EMI:{" "}
                    <span className="text-white">${ln.emiAmount ?? "-"}</span>
                  </p>
                  <p className="text-sm text-gray-300 mb-1">
                    Total Payable:{" "}
                    <span className="text-white">
                      ${ln.totalPayable ?? "-"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-300 mb-1">
                    Paid:{" "}
                    <span className="text-white">${ln.totalPaid ?? "-"}</span>
                  </p>
                  <p className="text-sm text-gray-300 mb-1">
                    Remaining:{" "}
                    <span className="text-white">${ln.remaining ?? "-"}</span>
                  </p>
                  <p className="text-sm text-gray-300">
                    Period:{" "}
                    <span className="text-white">
                      {new Date(ln.startDate).toLocaleDateString()} -{" "}
                      {new Date(ln.endDate).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isLoanModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="w-full mt-10 max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer"
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
                  value={loanForm.lender}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, lender: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.lender ? "border-red-500" : "border-white/20"
                  } text-white`}
                >
                  <option value="" className="bg-gray-900">
                    Select Lender
                  </option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id} className="bg-gray-900">
                      {u.name}
                    </option>
                  ))}
                </select>
                {errors.lender && (
                  <p className="text-red-400 text-sm mt-1 desktop:block tablet:block mobile:hidden">{errors.lender}</p>
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
                  value={loanForm.amount}
                  onChange={(e) => handleNumberInput("amount", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.amount ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1 desktop:block tablet:block mobile:hidden">{errors.amount}</p>
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
                  value={loanForm.interest}
                  onChange={(e) =>
                    handleNumberInput("interest", e.target.value)
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.interest ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.interest && (
                  <p className="text-red-400 text-sm mt-1 desktop:block tablet:block mobile:hidden">{errors.interest}</p>
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
                  value={loanForm.duration}
                  onChange={(e) =>
                    handleNumberInput("duration", e.target.value)
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.duration ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.duration && (
                  <p className="text-red-400 text-sm mt-1 desktop:block tablet:block mobile:hidden">{errors.duration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 ">
                  Purpose
                </label>
                <input
                  type="text"
                  placeholder="Purpose of Loan"
                  value={loanForm.purpose}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, purpose: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.purpose ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.purpose && (
                  <p className="text-red-400 text-sm mt-1 desktop:block tablet:block mobile:hidden">{errors.purpose}</p>
                )}
              </div>

              <button
                onClick={addLoan}
                disabled={isSubmitting}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg cursor-pointer"
              >
                {isSubmitting ? "Adding Loan..." : "Add Loan"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isFilterModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="w-full max-w-md bg-white/10 p-6 rounded-2xl border border-white/20 text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer"
              onClick={() => setIsFilterModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Filter Loans
            </h2>

            <div className="space-y-4">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="Search by lender name"
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
              />
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex desktop:gap-4 mobile:gap-10 desktop:mr-0 mobile:mr-5">
                <div className="relative w-1/2">
                  {!filters.startDate && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none mobile:block desktop:hidden">
                      Enter start date
                    </span>
                  )}
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div className="relative w-1/2">
                  {!filters.endDate && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none mobile:block desktop:hidden">
                      Enter end date
                    </span>
                  )}

                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>
              </div>
              <label className="text-sm font-medium">Amount</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Min Amount"
                  value={filters.minAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, minAmount: e.target.value })
                  }
                  className="w-1/2 px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                />
                <input
                  type="number"
                  placeholder="Max Amount"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, maxAmount: e.target.value })
                  }
                  className="w-1/2 px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
