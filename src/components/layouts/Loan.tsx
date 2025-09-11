"use client";

import { useState } from "react";

export default function Home() {
  const [loan, setLoan] = useState({
    lender: "",
    amount: "",
    interest: "",
    duration: "",
  });

  const [repayment, setRepayment] = useState({
    emi: "",
    paidTill: "",
    nextDue: "",
  });

  return (
    <main className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-lg text-white">
        <h2 className="text-xl font-semibold mb-4 text-center">Add Loan</h2>
        <div className="space-y-3">
          <label className="block text-sm font-medium mb-1">
            Loan Provider
          </label>
          <input
            type="text"
            placeholder="Lender"
            value={loan.lender}
            onChange={(e) => setLoan({ ...loan, lender: e.target.value })}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <label className="block text-sm font-medium mb-1">Loan Amount</label>
          <input
            type="text"
            placeholder="Loan Amount"
            value={loan.amount}
            onChange={(e) => setLoan({ ...loan, amount: e.target.value })}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <label className="block text-sm font-medium mb-1">Interest </label>
          <input
            type="text"
            placeholder="Interest Rate (%)"
            value={loan.interest}
            onChange={(e) => setLoan({ ...loan, interest: e.target.value })}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <label className="block text-sm font-medium mb-1">Duration</label>
          <input
            type="text"
            placeholder="Duration (months)"
            value={loan.duration}
            onChange={(e) => setLoan({ ...loan, duration: e.target.value })}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <h2 className="text-xl font-semibold mb-4 text-center mt-5">
          Repayment Tracking
        </h2>
        <div className="space-y-3">
          <label className="block text-sm font-medium mb-1">EMI Amount</label>
          <input
            type="text"
            placeholder="EMI Amount"
            value={repayment.emi}
            onChange={(e) =>
              setRepayment({ ...repayment, emi: e.target.value })
            }
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <label className="block text-sm font-medium mb-1">Last Date</label>
          <input
            type="text"
            placeholder="Paid Till (Month Year)"
            value={repayment.paidTill}
            onChange={(e) =>
              setRepayment({ ...repayment, paidTill: e.target.value })
            }
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <label className="block text-sm font-medium mb-1">
            Next Due Date
          </label>
          <input
            type="text"
            placeholder="Next EMI Due"
            value={repayment.nextDue}
            onChange={(e) =>
              setRepayment({ ...repayment, nextDue: e.target.value })
            }
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>
    </main>
  );
}
