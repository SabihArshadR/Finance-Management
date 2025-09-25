"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiCreditCard,
  FiDollarSign,
  FiGrid,
  FiLogOut,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import { SuccessToast, ErrorToast } from "../ui/Toast";
import { usePathname, useRouter } from "next/navigation";
import { TbCategory } from "react-icons/tb";
import Hamburger from "../ui/Hamburger";
import MobileSidebar from "../ui/MobileSidebar";

type CategoryType = {
  _id: string;
  name: string;
  createdAt: string;
};

const Category = () => {
  const apiUrl = "https://finance-management-backend-eight.vercel.app";

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const router = useRouter();
  const [searchName, setSearchName] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const [categoryFlow, setCategoryFlow] = useState<"in" | "out">("in");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${apiUrl}/api/all-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.data || []);
    } catch (err: any) {
      console.error("Error fetching categories:", err.response?.data || err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory) return;
    setIsAddingCategory(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        `${apiUrl}/api/add-category`,
        { name: newCategory, flow: categoryFlow },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      SuccessToast("Category added successfully");
      setNewCategory("");
      setCategoryFlow("in");
      setIsCategoryModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      console.error("Error adding category:", err.response?.data || err);
      ErrorToast("Failed to add category");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const deleteCategory = async () => {
    if (!selectedCategory?._id) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(
        `${apiUrl}/api/delete-category/${selectedCategory._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      SuccessToast("Category deleted successfully");
      await fetchCategories();
    } catch (err: any) {
      console.error("Error deleting category:", err.response?.data || err);
      ErrorToast("Failed to delete category");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleQuickSearch = () => {
    if (!searchName.trim()) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchName.toLowerCase())
    );
  };

  const getFiltered = (list: CategoryType[]) => {
    const { name, startDate, endDate } = filters;

    return list.filter((cat) => {
      if (name && !cat.name.toLowerCase().includes(name.toLowerCase()))
        return false;
      if (startDate && new Date(cat.createdAt) < new Date(startDate))
        return false;
      if (endDate && new Date(cat.createdAt) > new Date(endDate)) return false;
      return true;
    });
  };

  const [filteredCategories, setFilteredCategories] = useState<CategoryType[]>(
    []
  );
  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  const applyFilters = () => {
    setFilteredCategories(getFiltered(categories));
    setIsFilterModalOpen(false);
  };

  const resetFilters = () => {
    setFilters({ name: "", startDate: "", endDate: "" });
    setFilteredCategories(categories);
    setIsFilterModalOpen(false);
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
            Categories
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-green-600 desktop:px-4 desktop:py-2 tablet:px-4 tablet:py-2 mobile:px-2 mobile:py-2 rounded-lg hover:bg-green-700 cursor-pointer flex"
            >
              + Add{" "}
              <span className="desktop:block tablet:block mobile:hidden">
                Category
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
          placeholder="Search category by name ..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && setFilteredCategories(handleQuickSearch())
          }
          className="px-4 desktop:py-3 tablet:py-3 mobile:py-1.5 rounded-full bg-white/10 border border-white/20 text-white w-full"
        />
        <button
          onClick={() => setFilteredCategories(handleQuickSearch())}
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

      <div className="desktop:p-10 tablet:p-10 mobile:p-2 text-white">
        {loading ? (
          <p className="text-center text-gray-400">Loading categories...</p>
        ) : filteredCategories.length === 0 ? (
          <p className="text-center text-gray-400">No categories found.</p>
        ) : (
          <div className="grid desktop:grid-cols-3 tablet:grid-cols-2 mobile:grid-cols-1 desktop:gap-6 tablet:gap-6 mobile:gap-2">
            {filteredCategories.map((cat) => (
              <div
                key={cat._id}
                className="bg-white/10 p-6 rounded-2xl shadow-lg border border-white/10 relative"
              >
                <button
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsDeleteModalOpen(true);
                  }}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600 cursor-pointer"
                >
                  <FiTrash2 size={18} />
                </button>
                <h3 className="text-lg font-semibold">{cat.name}</h3>
                <p className="text-gray-400 text-sm">
                  Created: {new Date(cat.createdAt).toLocaleDateString("en-GB")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFilterModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer text-xl"
              onClick={() => setIsFilterModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Filter Categories
            </h2>

            <div className="space-y-4">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="Search by name"
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

      {isCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer text-xl"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Add Category
            </h2>
            <label className="text-sm font-medium">Category Name</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category Name"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
            />
            {/* <label className="block text-sm font-medium mt-4 mb-1">Flow</label>
            <select
              value={categoryFlow}
              onChange={(e) => setCategoryFlow(e.target.value as "in" | "out")}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
            >
              <option className="bg-gray-900" value="in">
                In
              </option>
              <option className="bg-gray-900" value="out">
                Out
              </option>
            </select> */}
            <button
              onClick={addCategory}
              disabled={isAddingCategory}
              className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {isAddingCategory ? "Adding Category..." : "Add Category"}
            </button>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white text-center">
            <h2 className="text-xl font-semibold mb-4">
              Delete {selectedCategory.name}?
            </h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this category?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={deleteCategory}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedCategory(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
