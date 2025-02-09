"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
// css

// img

const LiquitdityProtectionPop = ({ liquidity, setLiquidity }) => {
  const handleLiquidity = () => setLiquidity(!liquidity);
  const chartData = [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 237 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
  ];
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
  };
  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <div
          className={`modalDialog relative p-2 mx-auto w-full rounded z-10 bg-[var(--backgroundColor)]`}
        >
          <div className={`relative rounded`}>
            <button
              onClick={handleLiquidity}
              className="border-0 p-0 position-absolute"
              variant="transparent"
              style={{ right: 10, top: 0 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 16 15"
                fill="none"
              >
                <g clip-path="url(#clip0_0_6282)">
                  <path
                    d="M1.98638 14.906C1.61862 14.9274 1.25695 14.8052 0.97762 14.565C0.426731 14.0109 0.426731 13.1159 0.97762 12.5617L13.0403 0.498994C13.6133 -0.0371562 14.5123 -0.00735193 15.0485 0.565621C15.5333 1.08376 15.5616 1.88015 15.1147 2.43132L2.98092 14.565C2.70519 14.8017 2.34932 14.9237 1.98638 14.906Z"
                    fill="var(--textColor)"
                  />
                  <path
                    d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
                    fill="var(--textColor)"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_0_6282">
                    <rect
                      width="15"
                      height="15"
                      fill="var(--textColor)"
                      transform="translate(0.564453)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </button>
            <div className="top pb-3">
              <h5 className="m-0 fw-bold text-base">Liquidity Protection</h5>
            </div>
            <div className="content">
              <div className="top">
                <div className="flex items-center justify-between">
                  <h2 className="m-0 text-center font-bold text-xl">
                    1 BTC = $45,083
                  </h2>
                  <p className="m-0 text-xs font-medium">
                    Expirty Date: 09/20/2025
                  </p>
                </div>
              </div>
              <div className="centerBody py-3">
                <ChartContainer config={chartConfig}>
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                      dataKey="desktop"
                      type="natural"
                      stroke="#ff8735"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
              <div className="bottom">
                <button className="flex items-center justify-center commonBtn btn">
                  Buy
                </button>
                <div className="py-2">
                  <div className="flex items-center justify-between py-1">
                    <p className="m-0 font-medium text-xs">
                      Cost Per BTC Protected
                    </p>
                    <p className="m-0 text-xs themeClr font-semibold">.001</p>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <p className="m-0 font-medium text-xs">Liquidation Price</p>
                    <p className="m-0 text-xs themeClr font-semibold">$22000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const Modal = styled.div`
  .modalDialog {
    max-width: 500px;
    svg.recharts-surface text {
      fill: currentColor !important;
    }
  }
`;

export default LiquitdityProtectionPop;
