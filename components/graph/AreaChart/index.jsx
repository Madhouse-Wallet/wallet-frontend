import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactApexChart to disable SSR
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

// Mock data for series
const series = {
  monthDataSeries1: {
    prices: [
      8107.85, 8128.0, 8122.9, 8165.5, 8340.7, 8423.7, 8423.5, 8514.3, 8481.85,
      8487.7, 8506.9, 8626.2, 8668.95, 8602.3, 8607.55, 8512.9, 8496.25,
      8600.65, 8881.1, 9340.85,
    ],
    dates: [
      '2017-11-13',
      '2017-11-14',
      '2017-11-15',
      '2017-11-16',
      '2017-11-17',
      '2017-11-20',
      '2017-11-21',
      '2017-11-22',
      '2017-11-23',
      '2017-11-24',
      '2017-11-27',
      '2017-11-28',
      '2017-11-29',
      '2017-11-30',
      '2017-12-01',
      '2017-12-04',
      '2017-12-05',
      '2017-12-06',
      '2017-12-07',
      '2017-12-08',
    ],
  },
};

const AreaChart = () => {
  const [chartOptions, setChartOptions] = useState({
    series: [
      {
        name: 'STOCK ABC',
        data: series.monthDataSeries1.prices,
      },
    ],
    options: {
      chart: {
        type: 'area',
        height: 350,
        zoom: {
          enabled: false,
        },
      },
      colors: ['#00ff00'], // Set the area line color to green
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
        colors: ['#00ff00'], // Line color to green
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0,
          colorStops: [
            {
              offset: 0,
              color: '#76fc93', // Shaded region start color
              opacity: 0.4,
            },
            {
              offset: 100,
              color: '#76fc93', // Shaded region end color
              opacity: 0,
            },
          ],
        },
      },
      labels: series.monthDataSeries1.dates,
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: 'var(--textColor)', // Set x-axis labels to white
          },
          formatter: function (value) {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
          },
        },
      },
      yaxis: {
        opposite: false,
        labels: {
          style: {
            colors: 'var(--textColor)', // Set y-axis labels to white
          },
        },
      },
      legend: {
        horizontalAlign: 'left',
        labels: {
          colors: '#ffffff', // Set legend labels to white
        },
      },
      grid: {
        borderColor: '#404040', // Set grid lines to lighter gray
        strokeArray: 4, // Optional: add a dashed effect to grid lines
      },
    },
  });

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={chartOptions.options}
          series={chartOptions.series}
          type="area"
          height={350}
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default AreaChart;
