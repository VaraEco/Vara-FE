import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import IconSearch from "./IconSearch";
import Button from "./Button";
import PdfViewer from "./PdfViewer";
import * as XLSX from "xlsx";

const Table = ({
  fields,
  tableData = [],
  hasLink = false,
  handleReminderToggle,
  pageLink,
  hasActions = false,
  actions = [],
  rowsPerPage = 10,
  enablePagination = false,
  searchableColumn,
  importButton = false,
  handleOpenImport,
  importType = "",
  handleFilterData,
  handleFilterMethod,
  isToggleLoading
}) => {
  fields = fields.filter((field) => !field.no_show);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState("");

  const handleViewClick = (pdfUrl, e) => {
    e.preventDefault();
    setSelectedPdfUrl(pdfUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPdfUrl("");
  };
  const totalPages = tableData ? Math.ceil(tableData.length / rowsPerPage) : 0;

  const handleRowClick = (id) => {
    navigate(`${pageLink}${id}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const filteredData = tableData
    ? tableData.filter((row) => {
        if (!searchableColumn) return true;
        return row[searchableColumn]
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      })
    : [];

  const paginatedData = enablePagination
    ? filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      )
    : filteredData;

  const formatDate = (dateString) => {
    console.log("compl-fram", dateString);

    // if (!dateString) return '';
    // const date = new Date(dateString);
    // const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() returns month index starting from 0
    // const day = date.getUTCDate().toString().padStart(2, '0');
    // const year = date.getUTCFullYear();
    // console.log(`${month}/${day}/${year}`);

    // return `${month}/${day}/${year}`;

    if (!dateString) return "";

    // Create a new Date object directly from the ISO string
    const date = new Date(dateString);

    // Check for invalid date
    if (isNaN(date)) {
      console.error(`Invalid Date object: ${dateString}`);
      return ""; // Handle invalid date
    }

    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`; // Format as MM/DD/YYYY
  };

  const exportToExcel = () => {
    const wsData = [
      fields.map((field) => field.label), // Header row
      ...paginatedData.map((row) =>
        fields.map((field) =>
          field.type === "date"
            ? formatDate(row[field.id])
            : field.type === "url" && row[field.id]
            ? row[field.id]
            : row[field.id]
        )
      ),
    ];

    // Create a worksheet and a workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Write to file and trigger download
    XLSX.writeFile(wb, "table-data-download.xlsx");
  };

  return (
    <div className="flex flex-col items-center text-sm bg-white">
      <div className="w-[90%] margin-[auto]">
        <div className="w-[100%] margin-[auto] mb-4 flex items-center">
          {searchableColumn && (
            <div className="relative w-1/4">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <IconSearch />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={`Search by ${
                  fields.find((field) => field.id === searchableColumn)?.label
                }...`}
                className="px-8 py-1 border rounded-md shadow text-sm w-full placeholder:text-gray-500"
              />
            </div>
          )}
          {importButton && (
            <div className="relative w-[100%] flex justify-end gap-3">
              
              <select onChange={handleFilterMethod} style={{border:'1px solid gray', padding:'5px 10px', float:'right', borderRadius:'10px'}}>
                <option value="">Filter Method</option>
                <option value="Manual">Manual</option>
                <option value="Import">Import</option>
                <option value="Whatsapp">Whatsapp</option>
              </select>

              <Button
              label="Filter Data"
              handleFunction={handleFilterData}
              />
              <Button
                label={`Import ${importType}`}
                handleFunction={handleOpenImport}
              />

              <Button label={`Download Excel`} handleFunction={exportToExcel} />
            </div>
          )}
        </div>
        <table className="w-full border-separate border-spacing-0 rounded-md shadow text-left p-2">
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field.id} className="font-light px-2 py-4 border-b">
                  {field.label}
                </th>
              ))}
              {hasActions && (
                <th
                  key="actions"
                  className="font-light px-1 py-4 border-b"
                ></th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              console.log(row, "row================?");

              const realIndex = index + (currentPage - 1) * rowsPerPage;
              const clickable = hasLink && fields.some((f) => f.link);
              const isLastRow = index === paginatedData.length - 1;
              return (
                <tr
                  key={index}
                  onClick={
                    clickable
                      ? () => handleRowClick(row[fields.find((f) => f.link).id])
                      : undefined
                  }
                  className={clickable ? "cursor-pointer" : ""}
                >
                  {fields.map((field) => (
                    <td
                      key={field.id}
                      className={`px-2 py-4 ${isLastRow ? "" : "border-b"} ${
                        clickable ? "hover:text-[#0475E6]" : ""
                      }`}
                    >
                      {field.type === "date" ? (
                        formatDate(row[field.id])
                      ) : field.type === "checkbox" ? (
                        <label
    onClick={(e) => e.stopPropagation()}
    className="inline-flex items-center cursor-pointer"
  >
    <input
      onChange={(e) => handleReminderToggle(e, row)}
      type="checkbox"
      checked={row.reminder}
      className="sr-only peer"
    />
    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    {isToggleLoading === row.id && ( // Show spinner only for the loading row
      <span className="ml-2">
        <svg
          className="animate-spin h-6 w-6 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </span>
    )}
  </label>
                      ) : field.type === "url" && row[field.id] ? (
                        <a
                          href={row[field.id]}
                          // onClick={(e) => handleViewClick(row[field.id], e)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        row[field.id]
                      )}
                    </td>
                  ))}
                  {hasActions && (
                    <td
                      style={{ display: "flex" }}
                      className={`px-1 py-4 text-right ${
                        isLastRow ? "" : "border-b"
                      }`}
                    >
                      {actions.map((ActionButton, actionIndex) => (
                        <span
                          className="ml-2"
                          key={actionIndex}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {React.cloneElement(ActionButton, {
                            handleFunction: () =>
                              ActionButton.props.handleFunction(
                                row,
                                index,
                                realIndex
                              ),
                          })}
                        </span>
                      ))}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {enablePagination && (
          <div className="flex justify-end w-full mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 mx-1 border rounded-md shadow text-sm font-light hover:bg-blue-500 hover:border-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-2 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 mx-1 border rounded-md shadow text-sm font-light hover:bg-blue-500 hover:border-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
        <PdfViewer
          pdfUrl={selectedPdfUrl}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};

export default Table;
