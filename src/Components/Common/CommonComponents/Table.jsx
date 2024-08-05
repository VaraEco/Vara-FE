import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import IconSearch from "./IconSearch";
import Button from "./Button";
import PdfViewer from './PdfViewer';

const Table = ({ fields, tableData = [], hasLink = false, pageLink, hasActions = false, actions = [], rowsPerPage = 10, enablePagination = false, searchableColumn, importButton = false, handleOpenImport, importType = '' }) => {
  fields = fields.filter(field => !field.no_show);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');

    const handleViewClick = (pdfUrl, e) => {
        e.preventDefault();
        setSelectedPdfUrl(pdfUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedPdfUrl('');
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

  const filteredData = tableData ? tableData.filter(row => {
    if (!searchableColumn) return true;
    return row[searchableColumn]?.toString().toLowerCase().includes(searchQuery.toLowerCase());
  }) : [];

  const paginatedData = enablePagination ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) : filteredData;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() returns month index starting from 0
    const day = date.getUTCDate().toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="flex flex-col items-center text-sm bg-white">
      <div className="w-[90%] margin-[auto]"> 
      <div className="w-[100%] margin-[auto] mb-4 flex items-center">
        {searchableColumn && (
          <div className="relative w-1/4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <IconSearch/>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={`Search by ${fields.find(field => field.id === searchableColumn)?.label}...`}
              className="px-8 py-1 border rounded-md shadow text-sm w-full placeholder:text-gray-500"
            />
          </div>
        )}
        {importButton && (
          <div className="relative w-[100%] flex justify-end">
            <Button
            label={`Import ${importType}`}
            handleFunction={handleOpenImport}
            />
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
                <th key="actions" className="font-light px-1 py-4 border-b">
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const realIndex = index + (currentPage - 1) * rowsPerPage;
              const clickable = hasLink && fields.some(f => f.link);
              const isLastRow = index === paginatedData.length - 1;
              return (
                <tr
                  key={index}
                  onClick={clickable ? () => handleRowClick(row[fields.find(f => f.link).id]) : undefined}
                  className={clickable ? "cursor-pointer" : ""}
                >
                  {fields.map((field) => (
                    <td key={field.id} className={`px-2 py-4 ${isLastRow ? '' : 'border-b'} ${clickable ? 'hover:text-[#0475E6]' : ''}`}>
                      {field.type === 'date' ? ( formatDate(row[field.id]))
                      : field.type === 'url' && row[field.id] ? (
                        <a
                          href="#"
                          onClick={(e) => handleViewClick(row[field.id], e)}
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
                    <td className={`px-1 py-4 text-right ${isLastRow ? '' : 'border-b'}`}>
                      {actions.map((ActionButton, actionIndex) => (
                        <span className="ml-2" key={actionIndex} onClick={(e) => e.stopPropagation()}>
                          {React.cloneElement(ActionButton, { handleFunction: () => ActionButton.props.handleFunction(row, index, realIndex) })}
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
         <PdfViewer pdfUrl={selectedPdfUrl} isOpen={isModalOpen} onClose={closeModal} />
      </div> 
    </div>
  );
};

export default Table;
