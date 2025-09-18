"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";
import { SuccessToast, ErrorToast } from "../ui/Toast";

type CategoryType = {
  _id: string;
  name: string;
  createdAt: string;
};

const Category = () => {
  const apiUrl = "https://finance-backend-phi.vercel.app";
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [search, setSearch] = useState("");

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
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      SuccessToast("Category added successfully");
      setNewCategory("");
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
        { headers: { Authorization: `Bearer ${token}` } }
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

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="px-10 mt-5">
        <input
          type="text"
          placeholder="Search category by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 desktop:py-3 tablet:py-3 mobile:py-1.5 
          rounded-full bg-white/10 border border-white/20 focus:border-blue-500 
          outline-none text-white w-full"
        />
      </div>
    <div
      className="min-h-screen desktop:p-10 tablet:p-10 mobile:p-2 
      bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
      >
      <div className="flex justify-between items-center mb-6">
        <h1 className="desktop:text-3xl tablet:text-3xl mobile:text-lg font-semibold">
          Categories
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer"
          >
            + Add Category
          </button>
        </div>
      </div>
      {loading ? (
        <p className="text-center text-gray-400">Loading categories...</p>
      ) : filteredCategories.length === 0 ? (
        <p className="text-center text-gray-400">No categories found.</p>
      ) : (
        <div className="grid desktop:grid-cols-3 tablet:grid-cols-2 mobile:grid-cols-1 gap-6">
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
      {isCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-6 
          rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer text-xl"
              onClick={() => setIsCategoryModalOpen(false)}
              >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Add Category
            </h2>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category Name"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
              />
            <button
              onClick={addCategory}
              disabled={isAddingCategory}
              className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
              disabled:opacity-50 cursor-pointer"
            >
              {isAddingCategory ? "Adding Category..." : "Add Category"}
            </button>
          </div>
        </div>
      )}
      {isDeleteModalOpen && selectedCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl 
          shadow-xl text-white text-center">
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
                </div>
  );
};

export default Category;
