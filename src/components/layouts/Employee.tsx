"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { FiGrid, FiList, FiEdit2 } from "react-icons/fi";
import { ErrorToast, SuccessToast } from "../ui/Toast";

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
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    salary: "",
    bankAccount: "",
    allowance: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const apiUrl = "https://finance-backend-phi.vercel.app";

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

      setEmployees(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error: any) {
      console.error("Error fetching employees:", error.response?.data || error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (
      ["salary", "bankAccount", "allowance"].includes(name) &&
      !/^\d*$/.test(value)
    ) {
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name) newErrors.name = "Please enter name";
    if (!selectedEmployee && !form.email)
      newErrors.email = "Please enter email";
    if (!selectedEmployee && !form.password)
      newErrors.password = "Please enter password";
    if (!form.salary) newErrors.salary = "Please enter salary";
    if (!form.bankAccount) newErrors.bankAccount = "Please enter bank account";
    if (!form.allowance) newErrors.allowance = "Please enter allowance";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    setErrors({});
    setSelectedEmployee(null);
  };

  const handleAddEmployee = async () => {
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
      role: "employee",
      salary: Number(form.salary),
      meta: {
        bankAccount: form.bankAccount,
        allowance: Number(form.allowance),
      },
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${apiUrl}/api/auth/add-user`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEmployees((prev) => [...prev, response.data.user]);
      resetForm();
      setIsModalOpen(false);
      SuccessToast("Employee added successfully!");
    } catch (error: any) {
      console.error("Error adding employee:", error.response?.data || error);
      ErrorToast("Failed to add employee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!validateForm()) return;
    if (!selectedEmployee) return;

    const noChanges =
      form.name === selectedEmployee.name &&
      Number(form.salary) === selectedEmployee.salary &&
      form.bankAccount === (selectedEmployee.meta?.bankAccount || "") &&
      Number(form.allowance) === (selectedEmployee.meta?.allowance || 0);

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
      salary: Number(form.salary),
      meta: {
        bankAccount: form.bankAccount,
        allowance: Number(form.allowance),
      },
    };

    try {
      setLoading(true);
      await axios.put(
        `${apiUrl}/api/auth/update/${selectedEmployee._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === selectedEmployee._id ? { ...emp, ...payload } : emp
        )
      );

      resetForm();
      setIsModalOpen(false);
      SuccessToast("Employee updated successfully!");
    } catch (error: any) {
      console.error("Error updating employee:", error.response?.data || error);
      ErrorToast("Failed to update employee. Please try again.");
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
      salary: emp.salary.toString(),
      bankAccount: emp.meta?.bankAccount || "",
      allowance: emp.meta?.allowance?.toString() || "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="px-10 mt-5">
        <input
          type="text"
          placeholder="Search employee by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white w-full"
        />
      </div>
      <div
        className="min-h-screen desktop:p-10 tablet:p-10 mobile:p-2 
      bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="desktop:text-3xl tablet:text-3xl mobile:text-lg font-semibold">
            Employees
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
              + Add Employee
            </button>
          </div>
        </div>
        {fetching ? (
          <p className="text-center text-gray-400 mt-10">
            Loading employees...
          </p>
        ) : filteredEmployees.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No employees found.</p>
        ) : viewMode === "grid" ? (
          <div className="grid desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-1 gap-6">
            {filteredEmployees.map((emp) => (
              <div
                key={emp._id}
                className="bg-white/10 p-6 rounded-2xl shadow-lg border border-white/10 relative"
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
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl text-white relative">
              <button
                className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer text-xl"
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
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                      errors.name ? "border-red-500" : "border-white/20"
                    }`}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Employee Name"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm">{errors.name}</p>
                  )}
                </div>

                {!selectedEmployee && (
                  <>
                    <div className="">
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        className={` w-full px-4 py-3 rounded-xl bg-white/10 border ${
                          errors.email ? "border-red-500" : "border-white/20"
                        }`}
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Employee Email"
                      />
                      {errors.email && (
                        <p className=" text-red-400 text-sm">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Password
                      </label>
                      <input
                        className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                          errors.password ? "border-red-500" : "border-white/20"
                        }`}
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Employee Password"
                      />
                      {errors.password && (
                        <p className="text-red-400 text-sm">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Salary
                  </label>
                  <input
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                      errors.salary ? "border-red-500" : "border-white/20"
                    }`}
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    placeholder="Employee Salary"
                  />
                  {errors.salary && (
                    <p className="text-red-400 text-sm">{errors.salary}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bank Account
                  </label>
                  <input
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                      errors.bankAccount ? "border-red-500" : "border-white/20"
                    }`}
                    name="bankAccount"
                    value={form.bankAccount}
                    onChange={handleChange}
                    placeholder="Employee Bank Account"
                  />
                  {errors.bankAccount && (
                    <p className="text-red-400 text-sm">{errors.bankAccount}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Allowance
                  </label>
                  <input
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                      errors.allowance ? "border-red-500" : "border-white/20"
                    }`}
                    name="allowance"
                    value={form.allowance}
                    onChange={handleChange}
                    placeholder="Employee Allowance"
                  />
                  {errors.allowance && (
                    <p className="text-red-400 text-sm">{errors.allowance}</p>
                  )}
                </div>
              </div>
              <button
                onClick={
                  selectedEmployee ? handleUpdateEmployee : handleAddEmployee
                }
                disabled={loading}
                className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {loading
                  ? selectedEmployee
                    ? "Saving Changes ..."
                    : "Adding Employee ..."
                  : selectedEmployee
                  ? "Save Changes"
                  : "Add Employee"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
