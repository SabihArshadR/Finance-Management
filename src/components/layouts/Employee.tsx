"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { FiGrid, FiList } from "react-icons/fi";
import { FiEdit2 } from "react-icons/fi";

type Employee = {
  _id: string;
  name: string;
  email: string;
  salary: number;
  joinDate: string;
  meta: {
    bankAccount: string;
    allowance: number;
  };
};

export default function Home() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    salary: "",
    bankAccount: "",
    allowance: "",
  });

  const apiUrl = "https://finance-backend-phi.vercel.app";

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found. Please login first.");
          return;
        }

        const response = await axios.get(
          `${apiUrl}/api/auth/list?role=employee`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setEmployees(data);
        console.log(data)
      } catch (error: any) {
        console.error(
          "Error fetching employees:",
          error.response?.data || error
        );
      }
    };

    fetchEmployees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (["salary", "bankAccount", "allowance"].includes(name)) {
      if (!/^\d*$/.test(value)) return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      salary: "",
      bankAccount: "",
      allowance: "",
    });
    setSelectedEmployee(null);
  };

  const handleAddEmployee = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please login first.");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: "employee",
      salary: Number(form.salary),
      meta: {
        bankAccount: form.bankAccount,
        allowance: Number(form.allowance),
      },
    };

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/add-user`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmployees((prev) => [...prev, response.data.user]);
      resetForm();
      setIsModalOpen(false);
      alert("Employee added successfully!");
    } catch (error: any) {
      console.error("Error adding employee:", error.response?.data || error);
      alert("Failed to add employee. Please try again.");
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please login first.");
      return;
    }

    const payload = {
      name: form.name,
      salary: Number(form.salary),
      meta: {
        bankAccount: form.bankAccount,
        allowance: Number(form.allowance),
      },
    };

    const noChanges =
      payload.name === selectedEmployee.name &&
      payload.salary === selectedEmployee.salary &&
      payload.meta.bankAccount === selectedEmployee.meta.bankAccount &&
      payload.meta.allowance === selectedEmployee.meta.allowance;

    if (noChanges) {
      alert("No changes to update.");
      return;
    }

    try {
      const response = await axios.put(
        `${apiUrl}/api/auth/update/${selectedEmployee._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response)
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === selectedEmployee._id ? { ...emp, ...payload } : emp
        )
      );

      resetForm();
      setIsModalOpen(false);
      alert("Employee updated successfully!");
    } catch (error: any) {
      console.error("Error updating employee:", error.response?.data || error);
      alert("Failed to update employee. Please try again.");
    }
  };

  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      password: "",
      salary: emp.salary.toString(),
      bankAccount: emp.meta?.bankAccount || "",
      allowance: emp.meta?.allowance?.toString() || "",
    });
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen desktop:p-10 tablet:p-10 mobile:p-2 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="desktop:text-3xl tablet:text-3xl mobile:text-lg font-semibold">Employees</h1>
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
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-q gap-6">
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="bg-white/10 p-6 rounded-2xl shadow-lg border border-white/10 relative"
            >
              <button
                onClick={() => openEditModal(emp)}
                className="absolute top-3 right-3 text-gray-300 hover:text-white bg-blu"
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
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="flex justify-between items-center bg-white/10 p-4 pr-10 rounded-xl border border-white/10 relative"
            >
              <button
                onClick={() => openEditModal(emp)}
                className="absolute top-3 right-3 text-gray-300 hover:text-white"
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

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white"
              onClick={() => {
                resetForm();
                setIsModalOpen(false);
              }}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              {selectedEmployee ? "Edit Employee" : "Add Employee"}
            </h2>

            <div className="space-y-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                name="name"
                type="text"
                placeholder="Employee Name"
                value={form.name}
                onChange={handleChange}
              />

              {!selectedEmployee && (
                <>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    name="email"
                    type="email"
                    placeholder="Employee Email"
                    value={form.email}
                    onChange={handleChange}
                  />
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    name="password"
                    placeholder="Employee Password"
                    value={form.password}
                    onChange={handleChange}
                  />
                </>
              )}

              <label className="block text-sm font-medium mb-1">Salary</label>
              <input
                type="text"
                className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                name="salary"
                value={form.salary}
                placeholder="Employee Salary"
                onChange={handleChange}
              />

              <label className="block text-sm font-medium mb-1">
                Bank Account
              </label>
              <input
                className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                name="bankAccount"
                placeholder="Employee Account Number"
                value={form.bankAccount}
                onChange={handleChange}
              />

              <label className="block text-sm font-medium mb-1">
                Allowance
              </label>
              <input
                type="text"
                className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                name="allowance"
                placeholder="Employee Allowance"
                value={form.allowance}
                onChange={handleChange}
              />
            </div>

            <button
              onClick={
                selectedEmployee ? handleUpdateEmployee : handleAddEmployee
              }
              className="w-full mt-10 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {selectedEmployee ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
