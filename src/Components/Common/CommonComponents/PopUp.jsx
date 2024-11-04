import React from "react";
import Button from "./Button";
import IconError from "./IconError";
import PdfViewer from "./PdfViewer";
import { useState } from "react";

const PopUp = ({
  title,
  fields,
  newRowData,
  handleInputChange,
  handleFileChange,
  handleClosePopup,
  handleSave,
  readOnly = false,
  button1Label = "Cancel",
  button2Label = "Save",
  validationErrors,
  setFileName,
  newEntry,
  setNewEntry,
  handleRemoveFile,
  fileName
}) => {
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

  const formatDateForInput = (dateString) => {
    
    if (dateString.includes("/")) {
      const [month, day, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } else if (dateString.includes("-")) {
      return dateString;
    }
    //return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="z-50 fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 w-1/2 min-h-min max-w-4xl max-h-screen rounded-lg overflow-y-auto">
        <h2 className="text-lg font-mdm mb-4 flex justify-center items-center">
          {title}
        </h2>
        <form onSubmit={(e) => e.preventDefault()}>
          {fields.map((field) => (
            <div className="mb-4 text-sm font-thin" key={field.id}>
              {field.id == "evidenceFile" ? (
                <label
                  style={{
                    backgroundColor: "#e6e7eb",
                    cursor: "pointer",
                    width: "18%",
                    textAlign: "center",
                    padding: "7px",
                    borderRadius: "10px",
                  }}
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
              ) : (
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
              )}
              {validationErrors && validationErrors[field.id] && (
                <span className="text-red-500 font-thin text-xs flex items-center">
                  <IconError className="mr-1" />
                  {validationErrors[field.id]}
                </span>
              )}
              {field.type === "table" ? (
                <table className="border-separate border-spacing-0 border rounded-md shadow">
                  <thead>
                    <tr>
                      {field.tableFields.map((tableField) => (
                        <th
                          key={tableField.id}
                          className="font-medium px-4 py-2"
                        >
                          {tableField.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {newRowData[field.id] &&
                      newRowData[field.id].map((log, index) => (
                        <tr key={index}>
                          {field.tableFields.map((tableField) => (
                            <td
                              key={tableField.id}
                              className="border px-4 py-2"
                            >
                              {tableField.type === "url" ? (
                                <a
                                  href="#"
                                  onClick={(e) =>
                                    handleViewClick(
                                      log[tableField.id.toLowerCase()],
                                      e
                                    )
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </a>
                              ) : (
                                log[tableField.id.toLowerCase()]
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : field.type === "select" ? (
                <select
                  id={field.id}
                  name={field.id}
                  value={newRowData[field.id] || field.default || ""}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                  readOnly={readOnly}
                >
                  {!field.default && (
                    <option value="">Select {field.label.toLowerCase()}</option>
                  )}
                  {field.options.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      data-key={option.key || option.value || ""}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "file" ? (
                <div>
                  <input
                  type="file"
                  id={field.id}
                  name={field.id}
                  onChange={handleFileChange}
                  className="border border-gray-300 rounded-md shadow-sm mt-1 block w-full cursor-pointer bg-blue-500 text-white px-4 py-2 hover:bg-blue-600"
                />
                {fileName && <p>{fileName} <span onClick={handleRemoveFile} style={{color:'red', marginLeft:'10px'}}> &times; </span></p>}
                </div>
              ) : field.id === "status" ? (
                <select onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" name="status" id="">
                                    <option value="">Change Status</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              ) : (
                <input
                  type={field.type === "date" ? "date" : field.type || "text"}
                  id={field.id}
                  name={field.id}
                  value={
                    field.type === "date"
                      ? formatDateForInput(newRowData[field.id])
                      : newRowData[field.id] || field.default || ""
                  }
                  onChange={field.readOnly ? null : handleInputChange}
                  className={`border border-gray-300 rounded-md shadow-sm mt-1 block w-full ${
                    field.readOnly
                      ? "bg-gray-100 cursor-not-allowed focus:outline-none disabled"
                      : ""
                  }`}
                  readOnly={readOnly}
                />
              )}
            </div>
          ))}
          <div className="flex justify-center items-center space-x-4">
            <Button label={button1Label} handleFunction={handleClosePopup} />
            {!readOnly && (
              <Button label={button2Label} handleFunction={handleSave} />
            )}
          </div>
        </form>
      </div>
      <PdfViewer
        pdfUrl={selectedPdfUrl}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default PopUp;
