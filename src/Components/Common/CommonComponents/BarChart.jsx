import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function BarChart({ chartData }) {
    const data = {
        labels: chartData.x,
        datasets: [
            {
                label: chartData.y_label, 
                data: chartData.y, 
                backgroundColor: 'rgba(75,192,192,0.6)', 
                borderColor: 'rgba(75,192,192,1)', 
                borderWidth: 1, 
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
                text: `Bar Chart`,
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
            <Bar data={data} options={options} height={500} />
        </div>
    );
}
