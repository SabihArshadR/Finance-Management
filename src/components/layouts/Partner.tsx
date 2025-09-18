"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { FiGrid, FiList, FiEdit2 } from "react-icons/fi";
import { ErrorToast, SuccessToast } from "../ui/Toast";

type Partner = {
  _id: string;
  name: string;
  email: string;
  percentage: number;
  salary: number;
  joinDate: string;
};

export default function Home() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    percentage: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const apiUrl = "https://finance-backend-phi.vercel.app";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "percentage" && !/^\d*$/.test(value)) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = "Please enter name";
    if (!editingPartner && !form.email) newErrors.email = "Please enter email";
    if (!editingPartner && !form.password)
      newErrors.password = "Please enter password";
    if (!form.percentage) newErrors.percentage = "Please enter investment %";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", percentage: "" });
    setErrors({});
    setEditingPartner(null);
  };

  const handleAddPartner = async () => {
    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      ErrorToast("No token found. Please login first.");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      percentage: Number(form.percentage),
      role: "partner",
    };

    try {
      setLoading(true);
      await axios.post(`${apiUrl}/api/auth/add-users`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      resetForm();
      setIsModalOpen(false);
      fetchPartners();
      SuccessToast("Partner added successfully!");
    } catch (error: any) {
      console.error("Error adding partner:", error.response?.data || error);
      ErrorToast("Failed to add partner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePartner = async () => {
    if (!validateForm()) return;
    if (!editingPartner) return;

    const noChanges =
      form.name === editingPartner.name &&
      form.email === editingPartner.email &&
      Number(form.percentage) === editingPartner.percentage;

    if (noChanges) {
      ErrorToast("Please make some changes before updating.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      ErrorToast("No token found. Please login first.");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      percentage: Number(form.percentage),
    };

    try {
      setLoading(true);
      await axios.put(
        `${apiUrl}/api/auth/update/${editingPartner._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      resetForm();
      setIsModalOpen(false);
      fetchPartners();
      SuccessToast("Partner updated successfully!");
    } catch (error: any) {
      console.error("Error updating partner:", error.response?.data || error);
      ErrorToast("Failed to update partner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      setPageLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/auth/list?role=partner`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setPartners(data);
    } catch (error: any) {
      console.error("Error fetching partners:", error.response?.data || error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setForm({
      name: partner.name,
      email: partner.email,
      password: "",
      percentage: String(partner.percentage),
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="desktop:mb-0 tablet:mb-0 mobile:mb-20">
      <div className="px-10 mt-5">
        <input
          type="text"
          placeholder="Search partner by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 desktop:py-3 tablet:py-3 mobile:py-1.5 rounded-full
           bg-white/10 border border-white/20 text-white w-full"
        />
      </div>
    <div className="min-h-screen desktop:p-10 tablet:p-10 mobile:p-2 bg-gradient-to-br
     from-gray-900 via-black to-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="desktop:text-3xl tablet:text-3xl mobile:text-lg font-semibold">
          Partners
        </h1>
        <div className="flex gap-4">
          {viewMode === "grid" ? (
            <button
            onClick={() => setViewMode("list")}
              className="p-2 rounded-lg bg-white/10 hover:bg-blue-600 cursor-pointer"
            >
              <FiList size={20} />
            </button>
          ) : (
            <button
            onClick={() => setViewMode("grid")}
            className="p-2 rounded-lg bg-white/10 hover:bg-blue-600 cursor-pointer"
            >
              <FiGrid size={20} />
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer"
          >
            + Add Partner
          </button>
        </div>
      </div>
      {pageLoading ? (
        <p className="text-center text-gray-300">Loading partners...</p>
      ) : filteredPartners.length === 0 ? (
        <p className="text-center text-gray-400">No data found</p>
      ) : viewMode === "grid" ? (
        <div className="grid desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-1 gap-6">
          {filteredPartners.map((partner) => (
            <div
              key={partner._id}
              className="relative bg-white/10 p-6 rounded-2xl shadow-lg border border-white/10"
              >
              <button
                onClick={() => openEditModal(partner)}
                className="absolute top-6 right-3 text-gray-300 hover:text-white cursor-pointer"
              >
                <FiEdit2 size={18} />
              </button>

              <h2 className="text-xl font-semibold">{partner.name}</h2>
              <p className="text-gray-300">{partner.email}</p>
              <p>Salary: {partner.salary}</p>
              <p>Investment: {partner.percentage}%</p>
              <p>
                Joined: {new Date(partner.joinDate).toLocaleDateString("en-GB")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPartners.map((partner) => (
            <div
            key={partner._id}
              className="flex justify-between items-center bg-white/10 p-4 pr-10 
              rounded-xl border border-white/10 relative"
            >
              <div>
                <h2 className="text-lg font-semibold">{partner.name}</h2>
                <p className="text-gray-300">{partner.email}</p>
                <p>Salary: {partner.salary}</p>
              </div>
              <div className="text-right">
                <p>Investment: {partner.percentage}%</p>
                <p>
                  Joined:{" "}
                  {new Date(partner.joinDate).toLocaleDateString("en-GB")}
                </p>
              </div>
              <button
                onClick={() => openEditModal(partner)}
                className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer"
              >
                <FiEdit2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white text-xl cursor-pointer"
              onClick={() => {
                resetForm();
                setIsModalOpen(false);
              }}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              {editingPartner ? "Edit Partner" : "Add Partner"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.name ? "border-red-500" : "border-white/20"
                  }`}
                  placeholder="Partner Name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.email ? "border-red-500" : "border-white/20"
                  }`}
                  placeholder="Partner Email"
                  disabled={!!editingPartner}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              {!editingPartner && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                      errors.password ? "border-red-500" : "border-white/20"
                    }`}
                    placeholder="Partner Password"
                    />
                  {errors.password && (
                    <p className="text-red-400 text-sm">{errors.password}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Investment (%)
                </label>
                <input
                  name="percentage"
                  type="text"
                  value={form.percentage}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.percentage ? "border-red-500" : "border-white/20"
                  }`}
                  placeholder="Partner Investment %"
                />
                {errors.percentage && (
                  <p className="text-red-400 text-sm">{errors.percentage}</p>
                )}
              </div>
            </div>

            <button
              onClick={editingPartner ? handleUpdatePartner : handleAddPartner}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
              {loading
                ? editingPartner
                  ? "Saving Changes ..."
                  : "Adding Partner ..."
                : editingPartner
                ? "Save Changes"
                : "Add Partner"}
            </button>
          </div>
        </div>
      )}
    </div>
                </div>
  );
}
