import DashboardLayout from "@/components/layouts/DashboardLayout";
import ExpensesPage from "@/components/layouts/Expense";
import React from "react";

const page = () => {
  return (
    <DashboardLayout>
      <ExpensesPage />
    </DashboardLayout>
  );
};

export default page;
