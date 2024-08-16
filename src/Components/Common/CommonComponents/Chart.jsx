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
                tension: 0.1, 
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                text: `Line Graph - ${chartData.type}`,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: chartData.x_label,
                },
            },
            y: {
                title: {
                    display: true,
                    text: chartData.y_label,
                },
                beginAtZero: false,
            },
        },
    };

    return <Line data={data} options={options} />;
}
