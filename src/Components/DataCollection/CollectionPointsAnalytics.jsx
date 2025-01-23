import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';
import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2'
import  Button from '../Common/CommonComponents/Button'

function CollectionPointsAnalytics({chartData, headers, allData}) {

    const [chartType, setChartType] = useState('bargraph')
    const [displayType, setDisplayType] = useState('multi')
    const [selectedUnit, setSelectedUnit] = useState('');; 
    const [filteredData, setFilteredData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState("all")
    const [rowType, setRowType] = useState('gridRow')
    const [filteredHeaders,setFilteredHeaders] = useState([])

    const graphRef = useRef(null)

    const fixedColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

    if (!Array.isArray(chartData) || chartData.length === 0) {
        return <h1>No data available</h1>;
    }
    
    console.log('chartData------>', chartData, 'headersss==>' ,headers, 'alldataaaa===>', allData);
    
    useEffect(() => {
      if (displayType === 'multi') {
        setFilteredData(chartData); // Default to the complete dataset for single display
        setFilteredHeaders(headers); // Default headers for single display
      }
    }, [chartData, headers, displayType]);
    
    const colorRef = useRef({});

    const getRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      };

      const handlePeriodChange = (e) => {
        const period = e.target.value;
        setSelectedPeriod(period);
    
        const currentDate = new Date();
        let startDate;
    
        // Calculate the start date based on the selected period
        if (period === '7days') {
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - 7);
        } else if (period === '1month') {
            startDate = new Date(currentDate);
            startDate.setMonth(currentDate.getMonth() - 1);
        } else if (period === '6months') {
            startDate = new Date(currentDate);
            startDate.setMonth(currentDate.getMonth() - 6);
        } else {
            // For 'all', include all data
            if (displayType === 'multi' && selectedUnit) {
                setFilteredData(groupedData[selectedUnit]);
            } else {
                setFilteredData(allData);
            }
            setFilteredHeaders(headers);
            return;
        }
    
        startDate.setHours(0, 0, 0, 0);
    
        const filteredHeader = headers.filter(dateStr => {
            try {
                const [year, month, day] = dateStr.split('-');
                const headerDate = new Date(year, month - 1, day);
                headerDate.setHours(0, 0, 0, 0);
                return headerDate >= startDate;
            } catch (error) {
                console.error('Error parsing date:', dateStr, error);
                return false;
            }
        });
    
        setFilteredHeaders(filteredHeader);
    
        let filtered;
        if (displayType === 'multi' && selectedUnit) {
            filtered = groupedData[selectedUnit].map(row => {
                const filteredRow = { Unit: row.Unit };
                filteredHeader.forEach(date => {
                    filteredRow[date] = row[date];
                });
                return filteredRow;
            });
        } else {
            filtered = allData.map(row => {
                const filteredRow = { Unit: row.Unit };
                filteredHeader.forEach(date => {
                    filteredRow[date] = row[date];
                });
                return filteredRow;
            });
        }
    
        setFilteredData(filtered);
    };
    

    const labels = headers;
    const keys = headers.filter(header => header !== "");

    const groupedData = allData.reduce((acc, row) => {
      const unit = row['Unit']; // Assuming the key is 'Unit'
      if (!acc[unit]) {
        acc[unit] = [];
      }
      acc[unit].push(row);
      return acc;
    }, {});

    console.log(groupedData);

    function handleUnitChange(e) {
        const unit = e.target.value;
        setSelectedUnit(unit);
      
        if (unit === "") {
          // If "All Units" is selected, show all units by merging the data from all units
          const allUnitsData = Object.values(groupedData).flat(); // Merge all the unit data
          setFilteredData(allUnitsData); // Set all units data to filteredData
        } else if (displayType === "multi" && groupedData[unit]) {
          // If a specific unit is selected, show data for that unit
          setFilteredData(groupedData[unit]);
        }
      
        console.log(filteredData);
      }
      

const datasets = useMemo(() => {
  return (displayType === 'multi' ? filteredData : chartData).map((row, index) => {
    const dataValues = filteredHeaders.map((header) => {
      // If the date is missing, add 0 for the missing value
      return row[header] !== undefined ? row[header] : 0;
    });
    
    const label = row[""] || `Dataset ${index + 1}`;

    const scatterData = dataValues.map((value, idx) => ({
      x: idx + 1,
      y: value,
    }));

    return {
      label: label,
      data: chartType === 'scatter' ? scatterData : dataValues,
      fill: false,
      borderColor: fixedColors[index % fixedColors.length], // Use fixed colors
      backgroundColor: fixedColors[index % fixedColors.length],
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
    };
  });
}, [filteredData, chartData, filteredHeaders, chartType, displayType]); // Dependencies


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
            min: chartType==='scatter' ? 1: 0,
            title: {
              display: true,
              // text: 'Columns',
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
              // text: 'Value',
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

      const downloadGraphAsPDF = () => {
        const doc = new jsPDF()
    
        // Use html2canvas to capture the graph area
        html2canvas(graphRef.current, {
          scale: 2, 
          useCORS: true,
        }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png')
      
          const imgWidth = 180; 
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
          // Add image to the PDF document
          doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
          doc.save('graph.pdf')
        })
      }

  return (
    <div style={{marginBottom: '50px', marginTop: '15px' }}>
      <div style={{display:'flex', justifyContent:'center', gap:'20px'}}>
      <select onChange={(e)=> setDisplayType(e.target.value)} style={{border:'1px solid gray', padding:'5px 10px', float:'left', borderRadius:'10px'}}>
      <option value="multi">Display In One</option>
        <option value="single">Display Individually</option>
        
      </select>

      <select disabled={displayType==="multi" ? true : false} onChange={(e)=> setRowType(e.target.value)} style={{border:'1px solid gray', padding:'5px 10px', float:'left', borderRadius:'10px'}}>
        <option value="gridrow">Display Single Row</option>
        <option value="singlerow">Display 2 Rows</option>
      </select>

<select onChange={(e)=> setChartType(e.target.value)} style={{border:'1px solid gray', padding:'5px 10px', float:'right', borderRadius:'10px'}}>
            <option value="linegraph">Select Graph</option>
            <option value="linegraph">Line Graph</option>
            <option value="bargraph">Bar Graph</option>
            {/* <option value="pie">Pie Graph</option> */}
            <option value="scatter">Scatter Graph</option>
        </select>

      <select disabled={displayType==="single" ? true : false} onChange={handleUnitChange} style={{border:'1px solid gray', padding:'5px 10px', float:'left', borderRadius:'10px',}}>
      <option value="">All Units</option>

        {Object.keys(groupedData).map(item=> <option value={item}>{item}</option>)}
      </select>
       

        <select onChange={handlePeriodChange} style={{border:'1px solid gray', padding:'5px 10px', float:'right', borderRadius:'10px'}}>
        <option value="all">All</option>
            <option value="7days">7 Days</option>
            <option value="1month">1 Month</option>
            <option value="6months">6 Months</option>
        </select>

        <Button label='Download Graph' handleFunction={downloadGraphAsPDF}/>
      </div>
       
       <div ref={displayType === 'multi' ? graphRef : null} style={{height:'650px', display:displayType==='multi' ? 'block' : 'none'}}>
       {displayType === 'multi' && (
  chartType === 'linegraph' ? (
    <Line data={{ labels: filteredHeaders, datasets }} options={options} />
  ) : chartType === 'bargraph' ? (
    <Bar data={{ labels: filteredHeaders, datasets }} options={options} />
  ) : chartType === 'pie' ? (
    <div style={{display:'flex', justifyContent:'center', height:'450px', border: '1px solid #ddd', padding:'10px', width:'50%', margin:'auto', marginTop:'25px'}}><Pie data={{ labels:'', datasets }}/></div>
  ): chartType === 'scatter' ? (  // Render Scatter chart
    <Scatter data={{ labels: filteredHeaders, datasets }} options={options} />
) : null
)}
       </div>

<div ref={displayType === 'single' ? graphRef : null} style={{marginTop:'50px'}}>
{displayType === 'single' && (
        <div style={{ display: 'grid', gridTemplateColumns: rowType === 'singlerow' ? 'repeat(2, 1fr)' : '1fr', gap: '20px' }}>
          {datasets.map((dataset, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding:'10px', width: rowType == 'singlerow' ? '600px' : '1200px', height:'350px', margin:'auto' }}>
              <h3>{dataset.label}</h3>
              {/* Render individual chart for each dataset */}
              {chartType === 'linegraph' && <Line data={{ labels: filteredHeaders, datasets: [dataset] }} options={options} />}
              {chartType === 'bargraph' && <Bar data={{ labels: filteredHeaders, datasets: [dataset] }} options={options} />}
              <div style={{height:'300px', display:'flex', justifyContent:'center'}}>
              {chartType === 'pie' && <Pie data={{ labels:'', datasets: [dataset] }}/>}
              {chartType === 'scatter' && <Scatter data={{ labels: filteredHeaders, datasets: [dataset] }} options={options} />}
              </div>
            </div>
          ))}
        </div>
      )}
</div>

    </div>
  )
}

export default CollectionPointsAnalytics