"use client";
import React, { useEffect, useState } from "react";
import LineCharts from "../ui/LineChart";
import PieCharts from "../ui/PieChart";
import axios from "axios";
import Image from "next/image";
import image from "@/assets/welcome-back-3.png";

const Dashdboard = () => {
  const [balanceData, setBalanceData] = useState<{
    availableBalance: number;
    totalCapital: number;
  } | null>(null);

  const apiUrl = "https://finance-backend-phi.vercel.app";

  const fetchPartnerReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${apiUrl}/api/partner-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
    } catch (error: any) {
      console.error("Error adding category:", error.response?.data || error);
    }
  };

  const fetchEmployeeReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${apiUrl}/api/employee-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
    } catch (error: any) {
      console.error("Error adding category:", error.response?.data || error);
    }
  };

  const fetchBalanceSheet = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${apiUrl}/api/balance-sheet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data;
      setBalanceData({
        availableBalance: data.availableBalance,
        totalCapital: data.totalCapital,
      });

      console.log("Balance Sheet:", data);
    } catch (error: any) {
      console.error(
        "EError fetching balance sheet:",
        error.response?.data || error
      );
    }
  };

  useEffect(() => {
    fetchPartnerReport();
    fetchEmployeeReport();
    fetchBalanceSheet();
  }, []);

  return (
    <div>
      <h1 className="desktop:text-3xl tablet:text-3xl mobile:text-lg font-semibold text-white ml-5 mt-5">
        Dashboard
      </h1>
      <div>
        <div className="bg-[#0A102B] rounded-lg p-6 flex justify-between items-center text-white shadow-lg mt-5 mx-5 max-w-[1000px]">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-gray-300 text-sm">Welcome back</p>
              <h2 className="text-xl font-bold">Admin!</h2>
              <div className="flex space-x-6 mt-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    {balanceData
                      ? `$${(balanceData.availableBalance / 1000).toFixed(1)}K`
                      : "--"}
                  </h3>
                  <p className="text-gray-400 text-xs">Available Balance</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    {balanceData
                      ? `$${(balanceData.totalCapital / 1000).toFixed(1)}K`
                      : "--"}
                  </h3>
                  <p className="text-gray-400 text-xs">Total Capital</p>
                </div>
              </div>
            </div>
          </div>
          <div className="">
            <Image src={image} alt="illustration" width={250} height={150} />
          </div>
        </div>
      </div>
      {/* <div className="desktop:grid desktop:grid-cols-2 tablet:grid-cols-1 mobile:grid-cols-1 p-5 justify-between gap-10">
        <div className="mt-10 border bg-[#0A102B] rounded-2xl desktop:overflow-hidden tablet:overflow-auto mobile:overflow-auto">
          <LineCharts />
        </div>
        <div className="mt-10 border bg-[#0A102B] rounded-2xl flex justify-center items-center w-full">
          <PieCharts />
        </div>
      </div>
      <div className="grid desktop:grid-cols-2 tablet:grid-cols-1 mobile:grid-cols-1 p-5 justify-between gap-10">
        <div className="mt-10 border bg-[#0A102B] rounded-2xl flex justify-center items-center w-full">
          <PieCharts />
        </div>
        <div className="mt-10 border bg-[#0A102B] rounded-2xl desktop:overflow-hidden tablet:overflow-auto mobile:overflow-auto">
          <LineCharts />
        </div>
      </div> */}
    </div>
  );
};

export default Dashdboard;
