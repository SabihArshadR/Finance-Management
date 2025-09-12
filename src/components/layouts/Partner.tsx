"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { FiGrid, FiList, FiEdit2 } from "react-icons/fi";

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

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    percentage: "",
  });

  const apiUrl = "https://finance-backend-phi.vercel.app";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "percentage" && !/^\d*$/.test(value)) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPartner = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please login first.");
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
      await axios.post(`${apiUrl}/api/auth/add-user`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm({ name: "", email: "", password: "", percentage: "" });
      setIsModalOpen(false);
      fetchPartners();
      alert("Partner added successfully!");
    } catch (error: any) {
      console.error("Error adding partner:", error.response?.data || error);
      alert("Failed to add partner. Please try again.");
    }
  };

  const handleUpdatePartner = async () => {
    if (!editingPartner) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please login first.");
      return;
    }

    if (
      form.name === editingPartner.name &&
      form.email === editingPartner.email &&
      Number(form.percentage) === editingPartner.percentage
    ) {
      alert("No changes to update");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      percentage: Number(form.percentage),
    };

    try {
      await axios.put(
        `${apiUrl}/api/auth/update/${editingPartner._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsModalOpen(false);
      setEditingPartner(null);
      fetchPartners();
      alert("Partner updated successfully!");
    } catch (error: any) {
      console.error("Error updating partner:", error.response?.data || error);
      alert("Failed to update partner. Please try again.");
    }
  };

  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/auth/list?role=partner`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setPartners(data);
    } catch (error: any) {
      console.error("Error fetching partners:", error.response?.data || error);
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
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen desktop:p-10 tablet:p-10 mobile:p-2 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="desktop:text-3xl tablet:text-3xl mobile:text-lg font-semibold">Partners</h1>
        <div className="flex gap-4">
          {viewMode === "grid" ? (
            <button
              onClick={() => setViewMode("list")}
              className="p-2 rounded-lg bg-white/10 hover:bg-blue-600"
            >
              <FiList size={20} />
            </button>
          ) : (
            <button
              onClick={() => setViewMode("grid")}
              className="p-2 rounded-lg bg-white/10 hover:bg-blue-600"
            >
              <FiGrid size={20} />
            </button>
          )}
          <button
            onClick={() => {
              setEditingPartner(null);
              setForm({ name: "", email: "", password: "", percentage: "" });
              setIsModalOpen(true);
            }}
            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Add Partner
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-1 gap-6">
          {partners.map((partner) => (
            <div
              key={partner._id}
              className="relative bg-white/10 p-6 rounded-2xl shadow-lg border border-white/10"
            >
              <button
                onClick={() => openEditModal(partner)}
                className="absolute top-3 right-3 p-2 bg-blue-600 rounded-full hover:bg-blue-700 cursor-pointer"
              >
                <FiEdit2 size={16} />
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
          {partners.map((partner) => (
            <div
              key={partner._id}
              className="flex justify-between items-center bg-white/10 p-4 pr-10 rounded-xl border border-white/10 relative"
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
                className="absolute top-0 right-3 p-2 bg-blue-600 rounded-full hover:bg-blue-700 cursor-pointer"
              >
                <FiEdit2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white"
              onClick={() => {
                setIsModalOpen(false);
                setEditingPartner(null);
              }}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              {editingPartner ? "Edit Partner" : "Add Partner"}
            </h2>

            <div className="space-y-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                placeholder="Partner Name"
              />
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                placeholder="Partner Email"
              />
              {!editingPartner && (
                <>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                    placeholder="Partner Password"
                  />
                </>
              )}
              <label className="block text-sm font-medium mb-1">
                Investment (%)
              </label>
              <input
                name="percentage"
                type="text"
                value={form.percentage}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                placeholder="Partner Investment %"
              />
            </div>

            <button
              onClick={editingPartner ? handleUpdatePartner : handleAddPartner}
              className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingPartner ? "Update Partner" : "Add Partner"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
