"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function Signup() {
  const router = useRouter();
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md bg-black p-8 rounded">
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>
        <form className="space-y-4">
          <div>
            <label className="font-medium">Name</label>
            <input
              type="text"
              className="mt-2 w-full px-4 py-2 border rounded bg-gray-900"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              className="mt-2 w-full px-4 py-2 border rounded bg-gray-900"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="font-medium">Password</label>
            <input
              type="password"
              className="mt-2 w-full px-4 py-2 border rounded bg-gray-900"
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className="font-medium">Address</label>
            <input
              type="text"
              className="mt-2 w-full px-4 py-2 border rounded bg-gray-900"
              placeholder="Enter your address"
            />
          </div>
          <div>
            <label className="font-medium">Date-of-Birth</label>
            <input
              type="date"
              className="mt-2 w-full px-4 py-2 border rounded bg-gray-900"
              placeholder="Enter your address"
            />
          </div>
          <button
            type="submit"
            className="mt-5 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
