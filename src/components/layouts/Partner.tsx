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
import Hamburger from "../ui/Hamburger";
import MobileSidebar from "../ui/MobileSidebar";
import { TbCategory } from "react-icons/tb";

type Partner = {
  _id: string;
  name: string;
  email: string;
  percentage: number;
  salary: number;
  joinDate: string;
};

export default function PartnersPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchName, setSearchName] = useState("");
  const router = useRouter();

  const [filters, setFilters] = useState({
    name: "",
    minSalary: "",
    maxSalary: "",
    startDate: "",
    endDate: "",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    percentage: "",
    salary: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const apiUrl = "https://finance-management-backend-eight.vercel.app";

  const fetchPartners = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${apiUrl}/api/auth/list?role=partner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setPartners(data);
      setFilteredPartners(data);
    } catch (err: any) {
      console.error("Error fetching partners:", err.response?.data || err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleQuickSearch = () => {
    if (!searchName.trim()) {
      setFilteredPartners(partners);
    } else {
      setFilteredPartners(
        partners.filter((p) =>
          p.name.toLowerCase().includes(searchName.toLowerCase())
        )
      );
    }
  };

  const getFiltered = (list: Partner[]) => {
    const { name, minSalary, maxSalary, startDate, endDate } = filters;
    return list.filter((p) => {
      if (name && !p.name.toLowerCase().includes(name.toLowerCase()))
        return false;
      if (minSalary && p.salary < Number(minSalary)) return false;
      if (maxSalary && p.salary > Number(maxSalary)) return false;
      if (startDate && new Date(p.joinDate) < new Date(startDate)) return false;
      if (endDate && new Date(p.joinDate) > new Date(endDate)) return false;
      return true;
    });
  };

  const applyFilters = () => {
    setFilteredPartners(getFiltered(partners));
    setIsFilterModalOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      minSalary: "",
      maxSalary: "",
      startDate: "",
      endDate: "",
    });
    setFilteredPartners(partners);
    setIsFilterModalOpen(false);
  };

  const handleSavePartner = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!selectedPartner && !form.email) newErrors.email = "Email is required";
    if (!selectedPartner && !form.password)
      newErrors.password = "Password is required";
    if (!form.percentage) newErrors.percentage = "Investment % is required";
    if (!form.salary) newErrors.salary = "Salary is required";

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
        percentage: Number(form.percentage),
        salary: Number(form.salary),
        role: "partner",
      };

      if (selectedPartner) {
        await axios.put(`${apiUrl}/api/auth/${selectedPartner._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        SuccessToast("Partner updated successfully");
      } else {
        await axios.post(`${apiUrl}/api/auth/register`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        SuccessToast("Partner added successfully");
      }

      fetchPartners();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error saving partner:", err.response?.data || err);
      ErrorToast(err.response?.data?.message || "Failed to save partner");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (partner: Partner) => {
    setSelectedPartner(partner);
    setForm({
      name: partner.name,
      email: partner.email,
      password: "",
      percentage: partner.percentage.toString(),
      salary: partner.salary.toString(),
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
      <div className="bg-gray-900 py-3 fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center desktop:px-10 tablet:px-10 mobile:px-2">
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
            Partners
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
                setSelectedPartner(null);
                setForm({
                  name: "",
                  email: "",
                  password: "",
                  percentage: "",
                  salary: "",
                });
                setIsModalOpen(true);
              }}
              className="bg-green-600 desktop:px-4 desktop:py-2 tablet:px-4 tablet:py-2 mobile:px-2 mobile:py-2 rounded-lg hover:bg-green-700 text-white cursor-pointer flex"
            >
              + Add{" "}
              <span className="desktop:block tablet:block mobile:hidden">
                Partner
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
      <div className="desktop:px-10 tablet:px-10 mobile:px-2 mt-5 flex gap-3 text-white items-center relative pt-[60px]">
        <input
          type="text"
          placeholder="Search partner by name ..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
          className="desktop:px-4 desktop:py-3 tablet:px-4 tablet:py-3 mobile:px-4 mobile:py-2 rounded-full bg-white/10 border border-white/20 text-white w-full"
        />
        <button
          onClick={handleQuickSearch}
          className="absolute p-2 rounded-lg hover:text-blue-600 cursor-pointer desktop:right-25 tablet:right-25 mobile:right-15"
        >
          <FiSearch size={20} />
        </button>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="p-2 rounded-lg bg-white/10 hover:bg-blue-600 cursor-pointer"
        >
          <IoFilter size={20} />
        </button>
      </div>

      <div className="min-h-screen desktop:p-10 tablet:p-10 mobile:p-2 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        {fetching ? (
          <p className="text-center text-gray-400 mt-10">Loading partners...</p>
        ) : filteredPartners.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No partners found.</p>
        ) : viewMode === "grid" ? (
          <div className="grid desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-1 desktop:gap-6 tablet:gap-6 mobile:gap-2">
            {filteredPartners.map((p) => (
              <div
                key={p._id}
                className="bg-white/10 border-white/10 p-6 rounded-2xl shadow-lg border relative"
              >
                <button
                  onClick={() => openEditModal(p)}
                  className="absolute top-6 right-3 text-gray-300 hover:text-white cursor-pointer"
                >
                  <FiEdit2 size={18} />
                </button>
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <p className="text-gray-300">{p.email}</p>
                <p>Salary: {p.salary}</p>
                <p>Investment: {p.percentage}%</p>
                <p>
                  Joined: {new Date(p.joinDate).toLocaleDateString("en-GB")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPartners.map((p) => (
              <div
                key={p._id}
                className="flex justify-between items-center bg-white/10 p-4 pr-10 rounded-xl border border-white/10 relative"
              >
                <button
                  onClick={() => openEditModal(p)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer"
                >
                  <FiEdit2 size={18} />
                </button>
                <div>
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  <p className="text-gray-300">{p.email}</p>
                </div>
                <div className="text-right">
                  <p>Salary: {p.salary}</p>
                  <p>Investment: {p.percentage}%</p>
                  <p>
                    Joined: {new Date(p.joinDate).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFilterModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer text-xl"
              onClick={() => setIsFilterModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Advanced Partner Search
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              {selectedPartner ? "Edit Partner" : "Add Partner"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
              />
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name}</p>
              )}

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email}</p>
              )}

              {!selectedPartner && (
                <>
                  <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm">{errors.password}</p>
                  )}
                </>
              )}

              <input
                type="number"
                placeholder="Investment %"
                value={form.percentage}
                onChange={(e) =>
                  setForm({ ...form, percentage: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
              />
              {errors.percentage && (
                <p className="text-red-400 text-sm">{errors.percentage}</p>
              )}

              <input
                type="number"
                placeholder="Salary"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
              />
              {errors.salary && (
                <p className="text-red-400 text-sm">{errors.salary}</p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSavePartner}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50"
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
