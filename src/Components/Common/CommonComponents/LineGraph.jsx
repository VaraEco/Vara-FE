import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export default function LineGraph({ chartData }) {
    const data = {
        labels: chartData.x,
        datasets: [
            {
                label: chartData.y_label, 
                data: chartData.y, 
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
                text: `Line Graph`,
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
                    text: chartData.x_label,
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
                    text: chartData.y_label,
                    font: {
                        size: 14,
                    },
                    color: '#333',
                },
                beginAtZero: true,
                grid: {
                    color: 'rgba(200, 200, 200, 0.2)',
                },
            },
        },
    };

    return (
        <div style={{ height: '500px', width: '500px', padding: '20px' }}> 
            <Line data={data} options={options} height={500} />
        </div>
    );
}
