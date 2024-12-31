import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import dayjs from "dayjs";

const StockGraph = () => {
  const [series] = useState([
    {
      name: "Candle",
      data: [
        { x: new Date(2024, 11, 1, 9, 0), y: [100, 110, 95, 105] }, // Open, High, Low, Close
        { x: new Date(2024, 11, 1, 10, 0), y: [105, 115, 100, 110] },
        { x: new Date(2024, 11, 1, 11, 0), y: [110, 120, 108, 115] },
        { x: new Date(2024, 11, 1, 12, 0), y: [115, 125, 112, 120] },
        { x: new Date(2024, 11, 1, 13, 0), y: [120, 128, 118, 125] },
        { x: new Date(2024, 11, 1, 14, 0), y: [125, 130, 122, 127] },
        { x: new Date(2024, 11, 1, 15, 0), y: [127, 135, 125, 132] },
        { x: new Date(2024, 11, 1, 16, 0), y: [132, 140, 130, 138] },
      ],
    },
  ]);

  const options = {
    chart: {
      height: 350,
      type: "candlestick",
    },
    title: {
      text: "ABC Coin",
      align: "left",
    },
    xaxis: {
      type: "category",
      labels: {
        formatter: (val) => dayjs(val).format("MMM DD "), // Format to display readable date & time
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
    tooltip: {
      enabled: true,
    },
  };

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={options}
          series={series}
          type="candlestick"
          height={350}
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default StockGraph;
