"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiGrid,
  FiList,
  FiEdit2,
  FiSearch,
  FiLogOut,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
} from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import { ErrorToast, SuccessToast } from "../ui/Toast";
import { usePathname, useRouter } from "next/navigation";
import { TbCategory } from "react-icons/tb";
import Hamburger from "../ui/Hamburger";
import MobileSidebar from "../ui/MobileSidebar";

type Employee = {
  _id: string;
  name: string;
  email: string;
  salary: number;
  joinDate: string;
  meta?: {
    bankAccount?: string;
    allowance?: number;
  };
};

export default function Home() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [searchName, setSearchName] = useState("");
  const router = useRouter();

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    minSalary: "",
    maxSalary: "",
    startDate: "",
    endDate: "",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    salary: "",
    bankAccount: "",
    allowance: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const apiUrl = "https://finance-management-backend-eight.vercel.app";

  const fetchEmployees = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${apiUrl}/api/auth/list?role=employee`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error: any) {
      console.error("Error fetching employees:", error.response?.data || error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getFiltered = (list: Employee[]) => {
    const { name, email, minSalary, maxSalary, startDate, endDate } = filters;

    return list.filter((emp) => {
      if (name && !emp.name.toLowerCase().includes(name.toLowerCase()))
        return false;
      if (email && !emp.email.toLowerCase().includes(email.toLowerCase()))
        return false;
      if (minSalary && emp.salary < Number(minSalary)) return false;
      if (maxSalary && emp.salary > Number(maxSalary)) return false;
      if (startDate && new Date(emp.joinDate) < new Date(startDate))
        return false;
      if (endDate && new Date(emp.joinDate) > new Date(endDate)) return false;
      return true;
    });
  };

  const handleQuickSearch = () => {
    if (!searchName.trim()) {
      setFilteredEmployees(employees);
    } else {
      setFilteredEmployees(
        employees.filter((emp) =>
          emp.name.toLowerCase().includes(searchName.toLowerCase())
        )
      );
    }
  };

  const applyFilters = () => {
    setFilteredEmployees(getFiltered(employees));
    setIsSearchModalOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      email: "",
      minSalary: "",
      maxSalary: "",
      startDate: "",
      endDate: "",
    });
    setFilteredEmployees(employees);
    setIsSearchModalOpen(false);
  };

  const handleSaveEmployee = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!selectedEmployee && !form.password)
      newErrors.password = "Password is required";
    if (!form.salary) newErrors.salary = "Salary is required";
    if (!form.bankAccount) newErrors.bankAccount = "Account is required";
    if (!form.allowance) newErrors.allowance = "Allowance is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const payload = {
        name: form.name,
        email: form.email,
        ...(form.password && { password: form.password }),
        salary: Number(form.salary),
        meta: {
          bankAccount: form.bankAccount,
          allowance: Number(form.allowance) || 0,
        },
        role: "employee",
      };

      if (selectedEmployee) {
        const isUnchanged =
        selectedEmployee.name === payload.name &&
        selectedEmployee.email === payload.email &&
        selectedEmployee.salary === payload.salary &&
        (selectedEmployee.meta?.bankAccount || "") === payload.meta.bankAccount &&
        (selectedEmployee.meta?.allowance || 0) === payload.meta.allowance;

      if (isUnchanged && !form.password) {
        ErrorToast("Please make a change before saving");
        setLoading(false);
        return;
      }
        await axios.put(
          `${apiUrl}/api/auth/update/${selectedEmployee._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        SuccessToast("Employee updated successfully");
      } else {
        await axios.post(`${apiUrl}/api/auth/add-user`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        SuccessToast("Employee added successfully");
      }

      fetchEmployees();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving employee:", error.response?.data || error);
      ErrorToast(error.response?.data?.message || "Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      password: "",
      salary: emp.salary?.toString() ?? "",
      bankAccount: emp.meta?.bankAccount ?? "",
      allowance: emp.meta?.allowance?.toString() ?? "",
    });
    setErrors({});
    setIsModalOpen(true);
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
      <div className="bg-gray-900 py-3 fixed top-0 desktop:left-64 tablet:left-64 mobile:left-0 right-0 z-20">
        <div className="flex justify-between items-center desktop:px-10 tablet:px-10 mobile:px-2 ">
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
          <h1 className="desktop:text-2xl tablet:text-2xl mobile:text-xl font-semibold text-white">
            Employees
          </h1>
          <div className="flex items-center gap-3">
            {viewMode === "grid" ? (
              <button
                onClick={() => setViewMode("list")}
                className="p-2 rounded-lg bg-white/10 hover:bg-blue-600 text-white cursor-pointer"
              >
                <FiList size={18} />
              </button>
            ) : (
              <button
                onClick={() => setViewMode("grid")}
                className="p-2 rounded-lg bg-white/10 hover:bg-blue-600 text-white cursor-pointer"
              >
                <FiGrid size={18} />
              </button>
            )}
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setForm({
                  name: "",
                  email: "",
                  password: "",
                  salary: "",
                  bankAccount: "",
                  allowance: "",
                });
                setIsModalOpen(true);
              }}
              className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 text-white cursor-pointer flex"
            >
              + Add{" "}
              <span className="desktop:block tablet:block mobile:hidden">
                Employee
              </span>
            </button>
            <div
              onClick={() => {
                handleLogout();
              }}
              className="cursor-pointer
             text-red-400 hover:bg-red-500/10 hover:text-red-300 
             transition-colors"
            >
              <FiLogOut className="text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="desktop:px-10 tablet:px-10 mobile:px-2 mt-5 flex gap-3 text-white items-center relative pt-[60px] ">
        <input
          type="text"
          placeholder="Search employee by name ..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
          className="px-4 desktop:py-3 tablet:py-3 mobile:py-1.5 rounded-full bg-white/10 border border-white/20 text-white w-full"
        />
        <button
          onClick={handleQuickSearch}
          className="absolute p-2 rounded-lg hover:text-blue-600 cursor-pointer desktop:right-25 tablet:right-25 mobile:right-15"
        >
          <FiSearch size={20} />
        </button>
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="p-2 rounded-lg bg-white/10 hover:bg-blue-600 cursor-pointer"
        >
          <IoFilter size={20} />
        </button>
      </div>

      <div className="desktop:p-10 tablet:p-10 mobile:p-2 text-white">
        {fetching ? (
          <p className="text-center text-gray-400">Loading employees...</p>
        ) : filteredEmployees.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No employees found.</p>
        ) : viewMode === "grid" ? (
          <div className="grid desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-1 desktop:gap-6 tablet:gap-6 mobile:gap-2">
            {filteredEmployees.map((emp) => (
              <div
                key={emp._id}
                className="bg-white/10 border-white/10 p-6 rounded-2xl shadow-lg border relative"
              >
                <button
                  onClick={() => openEditModal(emp)}
                  className="absolute top-6 right-3 text-gray-300 hover:text-white cursor-pointer"
                >
                  <FiEdit2 size={18} />
                </button>
                <h2 className="text-xl font-semibold">{emp.name}</h2>
                <p className="text-gray-300">{emp.email}</p>
                <p>Salary: {emp.salary}</p>
                <p>Bank: {emp.meta?.bankAccount}</p>
                <p>Allowance: {emp.meta?.allowance}</p>
                <p>
                  Joined: {new Date(emp.joinDate).toLocaleDateString("en-GB")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp._id}
                className="flex justify-between items-center bg-white/10 p-4 pr-10 rounded-xl border border-white/10 relative"
              >
                <button
                  onClick={() => openEditModal(emp)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer"
                >
                  <FiEdit2 size={18} />
                </button>
                <div>
                  <h2 className="text-lg font-semibold">{emp.name}</h2>
                  <p className="text-gray-300">{emp.email}</p>
                </div>
                <div className="text-right">
                  <p>Salary: {emp.salary}</p>
                  <p>Bank: {emp.meta?.bankAccount}</p>
                  <p>Allowance: {emp.meta?.allowance}</p>
                  <p>
                    Joined: {new Date(emp.joinDate).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isSearchModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer text-xl"
              onClick={() => setIsSearchModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Advanced Employee Search
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search by name"
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
              />
              <input
                type="text"
                placeholder="Search by email"
                value={filters.email}
                onChange={(e) =>
                  setFilters({ ...filters, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
              />
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Min Salary"
                  value={filters.minSalary}
                  onChange={(e) =>
                    setFilters({ ...filters, minSalary: e.target.value })
                  }
                  className="w-1/2 px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                />
                <input
                  type="number"
                  placeholder="Max Salary"
                  value={filters.maxSalary}
                  onChange={(e) =>
                    setFilters({ ...filters, maxSalary: e.target.value })
                  }
                  className="w-1/2 px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                />
              </div>
              <div className="flex desktop:gap-4 mobile:gap-10 desktop:mr-0 mobile:mr-5">
                <div className="relative w-1/2">
                  {!filters.startDate && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none mobile:block desktop:hidden">
                      Enter start date
                    </span>
                  )}
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div className="relative w-1/2">
                  {!filters.endDate && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none mobile:block desktop:hidden">
                      Enter end date
                    </span>
                  )}
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
                  />
                </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="w-full mt-10 max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              {selectedEmployee ? "Edit Employee" : "Add Employee"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.name ? "border-red-500" : "border-white/20"
                  }`}
              />
              {errors.name && (
                <p className="text-red-400 text-sm desktop:block tablet:block mobile:hidden">{errors.name}</p>
              )}

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.email ? "border-red-500" : "border-white/20"
                  }`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm desktop:block tablet:block mobile:hidden">{errors.email}</p>
              )}

              {!selectedEmployee && (
                <>
                  <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.password ? "border-red-500" : "border-white/20"
                  }`}
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm desktop:block tablet:block mobile:hidden">{errors.password}</p>
                  )}
                </>
              )}

              <input
                type="number"
                placeholder="Salary"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.salary ? "border-red-500" : "border-white/20"
                  }`}
              />
              {errors.salary && (
                <p className="text-red-400 text-sm desktop:block tablet:block mobile:hidden">{errors.salary}</p>
              )}

              <input
                type="text"
                placeholder="Bank Account"
                value={form.bankAccount}
                onChange={(e) =>
                  setForm({ ...form, bankAccount: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.bankAccount ? "border-red-500" : "border-white/20"
                  }`}
              />
              {errors.bankAccount && (
                <p className="text-red-400 text-sm desktop:block tablet:block mobile:hidden">{errors.bankAccount}</p>
              )}
              <input
                type="number"
                placeholder="Allowance"
                value={form.allowance}
                onChange={(e) =>
                  setForm({ ...form, allowance: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.allowance ? "border-red-500" : "border-white/20"
                  }`}
              />
              {errors.allowance && (
                <p className="text-red-400 text-sm desktop:block tablet:block mobile:hidden">{errors.allowance}</p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveEmployee}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50 w-full"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
