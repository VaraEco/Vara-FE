import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function DoughnutChart({ chartData }) {
    const data = {
        labels: chartData.x,
        datasets: [
            {
                label: chartData.y_label,
                data: chartData.y,
                backgroundColor: [
                    'rgba(75,192,192,0.6)',
                    'rgba(255,99,132,0.6)',
                    'rgba(54,162,235,0.6)',
                    'rgba(255,206,86,0.6)',
                    'rgba(153,102,255,0.6)',
                    'rgba(255,159,64,0.6)',
                ],
                borderColor: [
                    'rgba(75,192,192,1)',
                    'rgba(255,99,132,1)',
                    'rgba(54,162,235,1)',
                    'rgba(255,206,86,1)',
                    'rgba(153,102,255,1)',
                    'rgba(255,159,64,1)',
                ],
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
                text: `Doughnut Chart`,
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
    };

    return (
        <div style={{ height: '500px', width: '800px', padding: '20px', margin: '0 auto' }}>
            <Doughnut data={data} options={options} />
        </div>
    );
}
