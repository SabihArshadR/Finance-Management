"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import image from "@/assets/welcome-back-3.png";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const [balanceData, setBalanceData] = useState<{
    availableBalance: number;
    totalCapital: number;
  } | null>(null);

  const [usersCount, setUsersCount] = useState(0);
  const [partnersCount, setPartnersCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [barRange, setBarRange] = useState("ALL");
  const [lineRange, setLineRange] = useState("ALL");

  const router = useRouter();
  const apiUrl = "https://finance-management-backend-eight.vercel.app";

  const fetchPartnerReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${apiUrl}/api/partner-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPartnersCount(response.data.data.partners.length);
    } catch (error: any) {
      console.error("Error fetching partners:", error.response?.data || error);
    }
  };

  const fetchEmployeeReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${apiUrl}/api/employee-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployeesCount(response.data.data.length);
    } catch (error: any) {
      console.error("Error fetching employees:", error.response?.data || error);
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
    } catch (error: any) {
      console.error(
        "Error fetching balance sheet:",
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
      const users = response.data.data.filter(
        (user: any) => user.role !== "admin"
      );
      setUsersCount(users.length);
    } catch (error: any) {
      console.error("Error fetching users:", error.response?.data || error);
    }
  };

  const fetchLoan = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${apiUrl}/api/loan-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data.data, "loan report");
    } catch (error: any) {
      console.error("Error fetching loan:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchPartnerReport();
    fetchEmployeeReport();
    fetchBalanceSheet();
    fetchUsers();
    fetchLoan();
  }, []);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth();

  const getChartData = (isCapital: boolean, range: string) => {
    if (!balanceData) return [];

    return months.map((month, index) => {
      if (range === "ALL") {
        return {
          name: month,
          balance:
            index === currentMonth
              ? isCapital
                ? balanceData.totalCapital
                : balanceData.availableBalance
              : Math.floor(Math.random() * 3000),
        };
      } else {
        return {
          name: month,
          balance: Math.floor(Math.random() * 3000),
        };
      }
    });
  };

  const barData = getChartData(true, barRange);
  const lineData = getChartData(false, lineRange);

  const total = usersCount + partnersCount + employeesCount;
  const pieData = [
    { name: "Users", value: usersCount },
    { name: "Employees", value: employeesCount },
    { name: "Partners", value: partnersCount },
  ];
  const COLORS = ["#3B82F6", "#EC4899", "#22C55E"];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div>
      <div className="bg-gray-900 px-10 py-4 flex justify-between desktop:flex tablet:flex mobile:hidden">
        <h1 className="desktop:text-2xl tablet:text-3xl mobile:text-xl font-semibold text-white ">
          Dashboard
        </h1>
        <div
          onClick={handleLogout}
          className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors items-center flex"
        >
          <FiLogOut className="text-xl items-center" />
        </div>
      </div>

      <div className="desktop:px-10 tablet:px-10 mobile:px-2 w-full desktop:mt-10 tablet:mt-10 mobile:mt-5 desktop:mb-10 tablet:mb-0 mobile:mb-20">
        <div className="desktop:flex tablet:grid tablet:grid-cols-1 mobile:grid mobile:grid-cols-1 gap-5 mt-5">
          <div className="bg-white/10 border-white/10 rounded-lg p-6 flex justify-between items-center text-white shadow-lg w-full">
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
            <Image
              src={image}
              alt="illustration"
              width={250}
              height={150}
              className="desktop:w-[250px] desktop:h-[150px] tablet:w-[250px] tablet:h-[150px] mobile:w-[80px] mobile:h-[80px] object-cover"
            />
          </div>

          <div className="bg-white/10 border-white/10 rounded-lg p-6 text-white shadow-lg desktop:max-w-[500px] w-full">
            <h2 className="text-lg font-semibold mb-10 text-center">
              Members Distribution
            </h2>
            <div className="relative w-full h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={1}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold">{total}</h2>
                <p className="text-gray-400 text-sm">Total Members</p>
              </div>
            </div>
          </div>
        </div>
        <div className="desktop:flex tablet:grid tablet:grid-cols-1 mobile:grid mobile:grid-cols-1 desktop:gap-5">
          <div className="bg-white/10 border-white/10 rounded-lg p-6 mt-6 text-white shadow-lg w-full">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Monthly Revenue
            </h2>

            <div className="flex justify-center space-x-3 mb-4">
              {["1D", "2D", "5D", "1W", "1M", "1Y", "ALL"].map((r) => (
                <button
                  key={r}
                  onClick={() => setBarRange(r)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    barRange === r
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-blue-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid stroke="#374151" vertical={false} horizontal />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} />
                <Bar
                  dataKey="balance"
                  fill="url(#colorUv)"
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-gray-400 text-sm mt-3">Available Balance</p>
            <h3 className="text-2xl font-bold mt-2">
              {balanceData
                ? `$${Math.round(balanceData.totalCapital)} K`
                : "--"}
            </h3>
          </div>

          <div className="bg-white/10 border-white/10 rounded-lg p-6 mt-6 text-white shadow-lg w-full">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Loan Revenue
            </h2>

            <div className="flex justify-center space-x-3 mb-4">
              {["1D", "2D", "5D", "1W", "1M", "1Y", "ALL"].map((r) => (
                <button
                  key={r}
                  onClick={() => setLineRange(r)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    lineRange === r
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-blue-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid stroke="#374151" vertical={false} horizontal />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#06B6D4" }}
                  activeDot={{ r: 7, fill: "#22C55E" }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-gray-400 text-sm mt-3">Available Capital</p>
            <h3 className="text-2xl font-bold mt-2">
              {balanceData
                ? `$${Math.round(balanceData.availableBalance)} K`
                : "--"}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
