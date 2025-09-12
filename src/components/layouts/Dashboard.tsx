"use client";
import React from "react";
import LineCharts from "../ui/LineChart";
import PieCharts from "../ui/PieChart";

const Dashdboard = () => {
  return (
    <div>
      <h1 className="desktop:text-3xl tablet:text-3xl mobile:text-lg font-semibold text-white ml-5 mt-5">
        Dashboard
      </h1>
      <div className="desktop:grid desktop:grid-cols-2 tablet:grid-cols-1 mobile:grid-cols-1 p-5 justify-between gap-10">
        <div className="mt-10 border bg-[#0A102B] rounded-2xl overflow-y-scroll">
          <LineCharts />
        </div>
        <div className="mt-10 border bg-[#0A102B] rounded-2xl flex justify-center items-center w-full">
          <PieCharts />
        </div>
      </div>
      <div className="grid desktop:grid-cols-2 tablet:grid-cols-1 mobile:grid-cols-1 p-5 justify-between gap-10">
        <div className="mt-10 border bg-[#0A102B] rounded-2xl flex justify-center items-center w-full">
          <PieCharts />
        </div>
        <div className="mt-10 border bg-[#0A102B] rounded-2xl overflow-y-scroll">
          <LineCharts />
        </div>
      </div>
    </div>
  );
};

export default Dashdboard;
