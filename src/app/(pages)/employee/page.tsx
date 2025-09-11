import DashboardLayout from "@/components/layouts/DashboardLayout";
import Home from "@/components/layouts/Employee";
import React from "react";

const page = () => {
  return (
    <div>
      <DashboardLayout>
        <Home />
      </DashboardLayout>
    </div>
  );
};

export default page;
