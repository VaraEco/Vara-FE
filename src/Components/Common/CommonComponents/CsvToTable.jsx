import React, { useState } from "react";
import IconNextPage from "./IconNextPage";
import IconPrevPage from "./IconPrevPage";

function CsvToTable({ allData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [columnSelect, setColumnSelect] = useState(null);
  const [rowSelect, setRowSelect] = useState(null);
  const rowsPerPage = 3;
  const headers = Object.keys(allData[0]);
  const rows = allData.slice(0);

  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = rows.slice(startIndex, endIndex);

  const handleColumnSel = (ind) => {
    setColumnSelect(ind);
  };

  const handleRowSel = (ind) => {
    setRowSelect(ind);
  };

  const handlePageChange = (action) => {
    if (action == "PREV" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (action == "NEXT" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="max-w-[100vw] overflow-x-auto overflow-y-auto">
      <table className="text-md text-left rtl:text-right text-gray-700 bg-white">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr className="text-center">
            {headers.map((headerItem, index) => (
              <th
                scope="col"
                className={`hover:bg-gray-300 hover:text-white cursor-pointer px-12 py-1 ${
                  columnSelect === index ? "bg-gray-300 text-white" : ""
                }`}
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
              className={`border-b bg-white-800 text-center border-white-700 ${
                rowSelect === rowIndex ? "bg-red-400 text-white" : ""
              }`}
              key={rowIndex}
              onClick={() => handleRowSel(rowIndex)}
            >
              {headers.map((cell, cellIndex) => (
                <td
                  className={`cursor-pointer text-sm px-9 py-1 ${
                    columnSelect === cellIndex ? "bg-red-500 text-white" : ""
                  }`}
                  key={cellIndex}
                >
                  {row[cell]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

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
    </div>
  );
}

export default CsvToTable;
