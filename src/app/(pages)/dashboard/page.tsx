"use client"
import dynamic from 'next/dynamic';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import React from "react";

const Dashboard = dynamic(
  () => import('@/components/layouts/Dashboard'),
  { ssr: false }
);

const page = () => {
  return (
    <DashboardLayout>
      <Dashboard/>
    </DashboardLayout>
  );
};

export default page;
