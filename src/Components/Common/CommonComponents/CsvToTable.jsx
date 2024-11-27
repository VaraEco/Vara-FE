import React, { useState } from "react";
import IconNextPage from "./IconNextPage";
import IconPrevPage from "./IconPrevPage";
import AnalyticsGraph from "../../DataCollection/AnalyticsGraph";

function CsvToTable({ allData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [columnSelect, setColumnSelect] = useState(null);
  const [rowSelect, setRowSelect] = useState(null);
  const [selectedRowsData, setSelectedRowsData] = useState([]);
  const [allRowsSelected, setAllRowsSelected] = useState(false); // Track the header checkbox state
  const rowsPerPage = 5;

  const removeEmptyRows = (data) => {
    const headers = Object.keys(data[0]); // Assuming all rows have the same keys
    return data.filter((row) =>
      headers.some(
        (key) => key !== "Unit" && row[key] !== null && row[key] !== undefined && row[key] !== "" && row[key] !== 0
      )
    );
  };

    const filteredData = removeEmptyRows(allData); // Apply filter here
  const headers = Object.keys(filteredData[0]);
  const rows = filteredData.slice(0);

  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = rows.slice(startIndex, endIndex);

  const handleColumnSel = (ind) => {
    setColumnSelect(ind);
  };

  const handleRowSel = (rowData, rowIndex, checked) => {
    console.log(selectedRowsData);
    
    if (checked) {
      setSelectedRowsData((prevData) => [...prevData, rowData]);
    } else {
      setSelectedRowsData((prevData) =>
        prevData.filter((data) => data !== rowData)
      );
    }
  };

  const handleHeaderCheckboxChange = (e) => {
    const checked = e.target.checked;
    setAllRowsSelected(checked);

    if (checked) {
      // Select all rows on this page
      setSelectedRowsData(filteredData);
    } else {
      // Deselect all rows on this page
      setSelectedRowsData([]);
    }
  };

  const handlePageChange = (action) => {
    if (action == "PREV" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (action == "NEXT" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="max-w-full overflow-auto">
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 350px)" }}>
      <table className="text-md text-left rtl:text-right text-gray-700 bg-white mb-4 w-full">
        <thead  className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr className="text-center">
            <th ><input type="checkbox" checked={allRowsSelected} // Controlled checkbox for header
                onChange={handleHeaderCheckboxChange} /></th >
            {headers.map((headerItem, index) => (
              <th
                scope="col"
                className={`hover:bg-gray-300 hover:text-white cursor-pointer p-4`}
                key={index}
                onClick={() => handleColumnSel(index)}
              >
                {headerItem}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row, rowIndex) => (
            <tr
              className={`border-b bg-white-800 text-center border-white-700`}
              key={rowIndex}
              onClick={() => handleRowSel(rowIndex)}
            >
              <td className="px-9"><input type="checkbox" checked={selectedRowsData.includes(row)} onChange={(e) => handleRowSel(row, rowIndex, e.target.checked)}
 /></td>
              {headers.map((cell, cellIndex) => (
                <td
                  className={`cursor-pointer text-sm px-9 py-1`}
                  key={cellIndex}
                >
                  {row[cell]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div
        style={{
          width: "30%",
          margin: "auto",
          marginTop:'8px',
          marginBottom:'8px'
        }}
        className="flex justify-between items-center"
      >
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:'50px', margin:'auto'}}>
        <div
          onClick={() => handlePageChange("PREV")}
          
        >
          <IconPrevPage disabled={currentPage === 1} />
        </div>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <div
          onClick={() => handlePageChange("NEXT")}
          
        >
          <IconNextPage disabled={currentPage === totalPages} />
        </div>
        </div>
      </div>

      <div style={{
            marginTop: "20px", // Ensures proper spacing between table and graph
            paddingBottom: "30px", // Add padding at the bottom to prevent overlap
          }}>
        {selectedRowsData.length > 0 && (
          <AnalyticsGraph chartData={selectedRowsData} headers={headers.slice(2)} allData={filteredData}/>
        )}
      </div>

    </div>
  );
}

export default CsvToTable;
