import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';
import React, { useEffect, useRef, useState } from 'react'
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2'
import  Button from '../Common/CommonComponents/Button'

function AnalyticsGraph({chartData, headers, allData}) {

    const [chartType, setChartType] = useState('linegraph')
    const [displayType, setDisplayType] = useState('multi')
    const [selectedUnit, setSelectedUnit] = useState(''); 
    const [filteredData, setFilteredData] = useState([]);

    const graphRef = useRef(null)

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

    function handleUnitChange(e){
      const unit = e.target.value;
      setSelectedUnit(unit);
      if (displayType === 'multi' && groupedData[unit]) {
        setFilteredData(groupedData[unit]);  // Set filtered data based on the selected unit
      }
      console.log(filteredData);
      
    }

    const datasets = (displayType === 'multi' ? filteredData : chartData).map((row, index) => {

      const dataValues = headers.map(header => row[header]);
    
        const label = row[""];

        const scatterData = dataValues.map((value, idx) => ({
          x: idx+1,
          y: value
      }));

        return {
          label: label,
          data: chartType === 'scatter' ? scatterData : dataValues,
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
          scale: 2,  // Increase the scale for better resolution
          useCORS: true,  // Allow cross-origin requests for images (if needed)
        }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png')
      
          // Get the aspect ratio of the canvas to maintain it in the PDF
          const imgWidth = 180;  // Width in PDF units (A4 width is 210mm)
          const imgHeight = (canvas.height * imgWidth) / canvas.width;  // Maintain aspect ratio
      
          // Add image to the PDF document
          doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      
          // If you have multiple graphs, you might want to add a new page for each
          // doc.addPage(); // Uncomment if you want a new page for each graph
      
          // Save the PDF with the graph image
          doc.save('graph.pdf')
        })
      }

  return (
    <div style={{marginBottom: '50px', marginTop: '15px' }}>
      <div style={{display:'flex', justifyContent:'center', gap:'20px'}}>
      <select onChange={(e)=> setDisplayType(e.target.value)} style={{border:'1px solid gray', padding:'5px 10px', float:'left', borderRadius:'10px'}}>
        <option value={"multi"}>Display Graph</option>
        <option value="single">Display Individually</option>
        <option value="multi">Display In One</option>
      </select>
      <select onChange={handleUnitChange} style={{border:'1px solid gray', padding:'5px 10px', float:'left', borderRadius:'10px'}}>
        {Object.keys(groupedData).map(item=> <option value={item}>{item}</option>)}
      </select>
        <select onChange={(e)=> setChartType(e.target.value)} style={{border:'1px solid gray', padding:'5px 10px', float:'right', borderRadius:'10px'}}>
            <option value="linegraph">Select Graph</option>
            <option value="linegraph">Line Graph</option>
            <option value="bargraph">Bar Graph</option>
            <option value="pie">Pie Graph</option>
            <option value="scatter">Scatter Graph</option>
        </select>

        <Button label='Download Graph' handleFunction={downloadGraphAsPDF}/>
      </div>
       
       <div ref={displayType === 'multi' ? graphRef : null} style={{height:'350px', display:displayType==='multi' ? 'block' : 'none'}}>
       {displayType === 'multi' && (
  chartType === 'linegraph' ? (
    <Line data={{ labels, datasets }} options={options} />
  ) : chartType === 'bargraph' ? (
    <Bar data={{ labels, datasets }} options={options} />
  ) : chartType === 'pie' ? (
    <div style={{display:'flex', justifyContent:'center', height:'450px', border: '1px solid #ddd', padding:'10px', width:'50%', margin:'auto', marginTop:'25px'}}><Pie data={{ labels:'', datasets }}/></div>
  ): chartType === 'scatter' ? (  // Render Scatter chart
    <Scatter data={{ labels, datasets }} options={options} />
) : null
)}
       </div>

<div ref={displayType === 'single' ? graphRef : null} style={{marginTop:'50px'}}>
{displayType === 'single' && (
        <div style={{ display: 'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: '20px' }}>
          {datasets.map((dataset, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding:'10px', width:'500px', height:'350px', margin:'auto' }}>
              <h3>{dataset.label}</h3>
              {/* Render individual chart for each dataset */}
              {chartType === 'linegraph' && <Line data={{ labels, datasets: [dataset] }} options={options} />}
              {chartType === 'bargraph' && <Bar data={{ labels, datasets: [dataset] }} options={options} />}
              <div style={{height:'300px', display:'flex', justifyContent:'center'}}>
              {chartType === 'pie' && <Pie data={{ labels:'', datasets: [dataset] }}/>}
              {chartType === 'scatter' && <Scatter data={{ labels, datasets: [dataset] }} options={options} />}
              </div>
            </div>
          ))}
        </div>
      )}
</div>

    </div>
  )
}

export default AnalyticsGraph