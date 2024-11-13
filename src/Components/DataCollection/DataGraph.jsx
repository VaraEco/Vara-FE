import React, { useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'

function DataGraph({chartData}) {

    const [chartType, setChartType] = useState('linegraph')

    if (!Array.isArray(chartData) || chartData.length === 0) {
        return <h1>No data available</h1>;
    }

    const labels = chartData.map(data=> data.log_date)
    const values = chartData.map(data=> data.value)
    
    const xLabel = 'Log Date'
    const yLabel = 'Value'

    const data = {
        labels: labels,
        datasets: [
            {
                label: yLabel, 
                data: values, 
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.4)',
                tension: 0.4, 
                pointRadius: 5, 
                pointHoverRadius: 7, 
            },
        ],
    };

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
                // text: `Line Graph`,
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
                    text: xLabel,
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
                    text: yLabel,
                    font: {
                        size: 14,
                    },
                    color: '#333',
                },
                min:0,
                // max:Math.max(...values),
                ticks: {
                    stepSize: 200,
                    callback: function(value){
                        return value
                    }
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
        {chartType=='linegraph' && <Line data={data} options={options}/>}
        {chartType=='bargraph' && <Bar data={data} options={options}/>}
    </div>
  )
}

export default DataGraph