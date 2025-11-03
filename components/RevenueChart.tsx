import React, { useEffect, useRef } from 'react';

// Make Chart.js available in the window scope for TypeScript
declare global {
    interface Window {
        Chart: any;
    }
}

interface RevenueChartProps {
    data: {
        labels: string[];
        values: number[];
    };
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current || !window.Chart) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Destroy previous chart instance if it exists to prevent memory leaks
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const isDarkMode = document.documentElement.classList.contains('dark');
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDarkMode ? '#cbd5e1' : '#475569';

        chartRef.current = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Revenue',
                        data: data.values,
                        fill: true,
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        borderColor: '#4F46E5',
                        tension: 0.4,
                        pointBackgroundColor: '#4F46E5',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#4F46E5',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        titleColor: isDarkMode ? '#f1f5f9' : '#334155',
                        bodyColor: isDarkMode ? '#f1f5f9' : '#334155',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        borderWidth: 1,
                        callbacks: {
                            label: function (context: any) {
                                return ` Revenue: ₹${context.parsed.y.toFixed(2)}`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: textColor,
                        },
                    },
                    y: {
                        grid: {
                            color: gridColor,
                        },
                        ticks: {
                            color: textColor,
                            callback: function (value: string | number) {
                                return '₹' + value;
                            },
                        },
                    },
                },
            },
        });

        // Cleanup function to destroy the chart on component unmount
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data]); // This effect runs when the data prop changes.

    return <canvas ref={canvasRef}></canvas>;
};

export default RevenueChart;