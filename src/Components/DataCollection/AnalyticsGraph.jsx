import React, { useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'

function AnalyticsGraph({chartData, headers}) {

    const [chartType, setChartType] = useState('linegraph')

    if (!Array.isArray(chartData) || chartData.length === 0) {
        return <h1>No data available</h1>;
    }

    const getRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      };

    const labels = headers;
    // const values = chartData.map(row => headers.map(header => row[header]));
    
    // const xLabel = 'Log Date'
    // const yLabel = 'Value'

    const datasets = chartData.map((row, index) => {
        // The 'data' array contains the values of the row for each column (header)
        const dataValues = headers.map(header => row[header]);
    
        return {
          label: `Row ${index + 1}`, // Optional: You can customize how rows are labeled
          data: dataValues,
          fill: false,
          borderColor: getRandomColor(),
          backgroundColor: getRandomColor(),
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
        };
      });

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                size: 14,
              },
            },
          },
          title: {
            display: true,
            font: {
              size: 18,
              family: 'Arial, sans-serif',
            },
            color: '#333',
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleFont: {
              size: 16,
            },
            bodyFont: {
              size: 14,
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Columns',
              font: {
                size: 14,
              },
              color: '#333',
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Value',
              font: {
                size: 14,
              },
              color: '#333',
            },
            min: 0,
            ticks: {
              stepSize: 200,
              callback: function (value) {
                return value;
              },
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)',
            },
          },
        },
      };
    


  return (
    <div style={{height:'300px', marginBottom:'50px', marginTop:'15px'}}>
        <select onChange={(e)=> setChartType(e.target.value)} style={{border:'1px solid gray', padding:'5px 10px', float:'right', borderRadius:'10px'}}>
            <option value="linegraph">Select Graph</option>
            <option value="linegraph">Line Graph</option>
            <option value="bargraph">Bar Graph</option>
        </select>
        {chartType=='linegraph' && <Line data={{ labels, datasets }} options={options}/>}
        {chartType=='bargraph' && <Bar data={{ labels, datasets }} options={options}/>}
    </div>
  )
}

export default AnalyticsGraph