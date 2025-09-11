"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [percentage, setPercentage] = useState<number>(0);

  const apiUrl = "https://finance-backend-phi.vercel.app";

  const handleAddPartner = async () => {
    const token = localStorage.getItem("token");
    console.log(token);

    if (!token) {
      alert("No token found. Please login first.");
      return;
    }

    const payload = {
      name,
      email,
      password,
      percentage,
      role: "partner",
    };

    console.log("Payload being sent:", payload);

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/add-user`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response);

      setName("");
      setEmail("");
      setPassword("");
      setPercentage(0);

      alert("Partner added successfully!");
    } catch (error) {
      console.error("Error adding partner:", error);
      alert("Failed to add partner. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-8 text-center">Add Partner</h1>

        <div className="space-y-6">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            placeholder="Enter Partner Name"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter Partner Email"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter Partner Password"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="block text-sm font-medium mb-1">Investment</label>
          <input
            type="number"
            placeholder="Enter Partner Investment"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={percentage}
            onChange={(e) => setPercentage(parseFloat(e.target.value))}
          />
          <button
            onClick={handleAddPartner}
            className="mt-5 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    </main>
  );
}
