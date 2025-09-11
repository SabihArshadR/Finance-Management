"use client";
import React from "react";
import LineCharts from "../ui/LineChart";
import PieCharts from "../ui/PieChart";

const Dashdboard = () => {
  return (
    <div>

    <div className="grid grid-cols-2 p-5 justify-between gap-10">
      <div className="mt-10 border bg-[#0A102B] rounded-2xl">
        <LineCharts />
      </div>
      <div className="mt-10 border bg-[#0A102B] rounded-2xl flex justify-center items-center w-full">
        <PieCharts />
      </div>
    </div>
    <div className="grid grid-cols-2 p-5 justify-between gap-10">
      <div className="mt-10 border bg-[#0A102B] rounded-2xl flex justify-center items-center w-full">
        <PieCharts />
      </div>
      <div className="mt-10 border bg-[#0A102B] rounded-2xl">
        <LineCharts />
      </div>
    </div>
    </div>
  );
};

export default Dashdboard;
