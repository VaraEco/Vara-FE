import React, { useState, useEffect } from 'react';
import Table from '../Common/CommonComponents/Table';
import { generalFunction } from '../../assets/Config/generalFunction';
import { useParams } from 'react-router-dom';
import IconDelete from '../Common/CommonComponents/IconDelete.jsx';
import IconEdit from '../Common/CommonComponents/IconEdit.jsx';
import  Button from '../Common/CommonComponents/Button'
import PopUp from '../Common/CommonComponents/PopUp';
import DeletePopUp from '../Common/CommonComponents/DeletePopUp';
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { apiClient } from '../../assets/Config/apiClient';

export default function DataPoint() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [newEntry, setNewEntry] = useState({ log_id: '', log_date: '', value: '', evidenceFile: null, evidence_url: '', ai_extracted_value: ''});
    const [AllValues, setAllValues] = useState([]);


    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteRowData, setDeleteRowData] = useState({});
    
    const [isImportOpen, setIsImportOpen] = useState(false);
    
    const [isEditOpen, setEditOpen] = useState(false);
    const [rowEditData, setEditRowData] = useState({ log_id: '', log_date: '', value: '', evidenceFile: null, evidence_url: '', evidence: '',  ai_extracted_value: ''});
    const [rowEditIndex, setEditRowIndex] = useState(-1);

    const { parameter, process, data_point } = useParams();
    
    const fields = [
        { id: 'value', label: 'Value', type: 'text' },
        { id: 'log_date', label: 'Log Date', type: 'date' },
        { id: 'evidence', label: 'Evidence', type: 'url' }]

    const [OCR_Feature, setOCR_Feature] = useState(true);  // Set the OCR feature state
    const [tableFields, setTableFields] = useState(fields);

    const ai_fields = [
        { id: 'value', label: 'Value', type: 'text' },
        { id: 'log_date', label: 'Log Date', type: 'date' },
        { id: 'evidence', label: 'Evidence', type: 'url' },
        { id: 'ai_extracted_value', label: 'AI Extracted Value', type: 'text'}
    ]

    const importFields = [
        { label: "Value", key: "value", fieldType: { type: "input" }},
        { label: "Log Date", key: "log_date", fieldType: { type: "input" }}]

    useEffect(() => {
        const getData = async () => {
          try {
                const data = await generalFunction.fetchParameterDataSourceData(data_point)
                if (data) {
                    const processLogs = async (data) => {
                        const processedData = await Promise.all(data.map(async log => {
                        const signedUrl = await getSignedUrl(log.evidence_url);
                        return {
                            log_id: log.log_id,
                            value: log.value,
                            log_date: formatDateDisplay(log.log_date),
                            evidence: signedUrl,
                            ai_extracted_value: log.ai_extracted_value
                        };
                        }));
                        setAllValues(processedData);
                    };
                    processLogs(data);
                }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
        getData();
    }, [])

    useEffect(() => {
        if (OCR_Feature) {
            setTableFields(ai_fields);
        } else {
            setTableFields(fields);
        }
    }, [OCR_Feature]);

    const formatDateDisplay = (dateString) => {        
        if (!dateString) return '';
        const date = new Date(dateString);
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() returns month index starting from 0
        const day = date.getUTCDate().toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${day}/${year}`;
        // return new Date(dateString).toLocaleDateString();
      };

    const getSignedUrl = async (evidence_url) => {
        if (evidence_url) {
            const signedUrl = await generalFunction.getSignedUrl(evidence_url);
            return signedUrl.signedUrl
        } else {
            return null
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const formattedValue = type === 'date' ? formatDateDisplay(value) : value;
        setNewEntry(prevData => ({
          ...prevData,
          [name]: formattedValue,
        }));
      };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setNewEntry(prevData => ({
            ...prevData,
            evidenceFile: file,
        }));

    };

    const aiExtractedFlow = async () => {
        if(newEntry.evidenceFile) {
            const file_name = `${Date.now()}_${newEntry.evidenceFile.name}`;
            const ai_value = await apiClient.uploadToS3(newEntry.evidenceFile, file_name )
            newEntry.ai_extracted_value = ai_value
        }
    }

    const handleSaveNewEntry = async () => {
        try {
            if (OCR_Feature) {
                await aiExtractedFlow();
            }
            const log_id = await generalFunction.createUserDataEntry('', process, parameter, data_point, newEntry);
            const newRowWithId = { ...newEntry, log_id}
            setAllValues((prevData) => [...prevData, newRowWithId])
            setIsPopupOpen(false);
        } catch (error) {
            console.log("Error saving new entry: ", error);
        }
    };

    const handleOpenImport = () => {
        setIsImportOpen(true);
      };

      const onImportClose = () => {
        setIsImportOpen(false);
      };

      const handleClosePopup = () => {
        setIsPopupOpen(false);
        setNewEntry({ log_date: '', value: '', evidenceFile: null, evidence_url: ''});
      };
    
      const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
      };

      const handleAddImport = async (rowData) => {
        try {
            const imported_entry = { 
                log_date: formatDate(rowData.log_date),
                value: parseInt(rowData.value, 10),
                evidenceFile: null,
                evidence_url: ''
            };
            await generalFunction.createUserDataEntry('', process, parameter, data_point, imported_entry);
            setAllValues((prevData) => [...prevData, imported_entry])
          handleClosePopup();
        } catch (error) {
          console.error('Error adding row:', error);
        }
      };

      const onImportSubmit = async (data) => {
        const defaultValues = {
            value: '',
            log_date: '',
            evidence: '',
        };
        const rows = data.validData;
        for (let obj of rows) {
          try {
            let filledObject = { ...defaultValues, ...obj };
            await handleAddImport(filledObject); 
          } catch (error) {
            console.error('Error importing rows:', error);
          }
        }
        setIsImportOpen(false);
      };


    // functions to edit
    const openEdit = (row, index) => {
        setEditRowData(row)
        setEditRowIndex(index)
        setEditOpen(true);
    }

    const handleEditInput = async (e) => {
        const { name, value } = e.target;
        setEditRowData((prevData) => ({
          ...prevData,
          [name]: value,
        }));    
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        setEditRowData(prevData => ({
            ...prevData,
            evidenceFile: file,
        }));
    };

    async function handleEditSubmit() {
        const unsigned_evidence_url = await generalFunction.editDataPoint(rowEditData);
        if (unsigned_evidence_url) {
            const evidence_url = await getSignedUrl(unsigned_evidence_url);
            const editedRowWithURL = { ...rowEditData, evidence: evidence_url}
            setAllValues((prevData) => {
                const newData = [...prevData];
                newData[rowEditIndex] = { ...editedRowWithURL };
                return newData;
                });
        } else {
            setAllValues((prevData) => {
                const newData = [...prevData];
                newData[rowEditIndex] = { ...rowEditData };
                return newData;
            });
        }
        setEditOpen(false);
      };

      const handleCloseEdit = () => {
        setEditOpen(false);
        setEditRowData({ log_id: '', log_date: '', value: '', evidenceFile: null, evidence_url: '', evidence: '', ai_extracted_value: ''})
        setEditRowIndex(-1)
      };
    
    // functions to delete
    const openDelete = (row, index) => {
        setDeleteRowData(row);
        setIsDeleteOpen(true);
    }

    const closeDelete = () => {
        setDeleteRowData({}); 
        setIsDeleteOpen(false);
      };

    const handleDelete = async () => {
        const log_id = deleteRowData.log_id;
        try {
            await generalFunction.deleteRecord({ table: 'parameter_log', match: { log_id } });
            setAllValues((prevData) => prevData.filter(deleteRowData => deleteRowData.log_id !== log_id));
        } catch (error) {
            console.error('Error deleting supplier:', error);
            setIsErrorOpen(true);
        }
        closeDelete();
    };

    const actions = [
        <Button
        label={<IconEdit/>}
        handleFunction = {openEdit}
        actionButton={true}
        />,

        <Button
        label={<IconDelete/>}
        handleFunction={openDelete}
        actionButton={true}
        />
    ];

    return (
        <div className="relative flex flex-col justify-center overflow-hidden mt-20">
            <div className="w-full p-6 m-auto bg-white rounded-md shadow-xl shadow-black-600/40 lg:max-w-4xl">
                <h1 className="text-2xl text-center mb-4">Data Source </h1>
                <Table
                  fields={tableFields}
                  tableData ={AllValues}
                  hasActions={true}
                  actions={actions}
                  importButton={true}
                  handleOpenImport={handleOpenImport}
                  importType="Data"
                  />
                 <div className="flex justify-center items-center p-5">
                    <Button
                        label="New Entry Form"
                        handleFunction={() => setIsPopupOpen(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    />
                </div>
                {isPopupOpen && (
                <PopUp
                    title="New Data Entry"
                    fields={[
                        { id: 'log_date', label: 'Log Date', type: 'date' },
                        { id: 'value', label: 'Value', type: 'text' },
                        { id: 'evidenceFile', label: 'Evidence', type: 'file' },
                    ]}
                    newRowData={newEntry}
                    handleInputChange={handleInputChange}
                    handleFileChange={handleFileChange} 
                    handleClosePopup={() => setIsPopupOpen(false)}
                    handleSave={handleSaveNewEntry}
                    button1Label="Close"
                    button2Label="Submit"
                    validationErrors={{}}
                />
            )}
            {isDeleteOpen && (
                <DeletePopUp
                    closeDelete={closeDelete}
                    handleFunction={handleDelete}
                />
            )}
            {isEditOpen && (
                <PopUp
                title='Edit Value'
                fields={[
                    { id: 'log_date', label: 'Date', type: 'date' },
                    { id: 'value', label: 'Value', type: 'text' },
                    { id: 'evidenceFile', label: 'Evidence', type: 'file' },
                    { id: 'ai_extracted_value', label: 'AI Extracted Value', type: 'text' },
                ]}
                newRowData={rowEditData}
                handleInputChange={handleEditInput}
                handleFileChange={handleEditFileChange}
                handleClosePopup={handleCloseEdit}
                handleSave={handleEditSubmit}
                button2Label='Save'
                />
            )}
            <ReactSpreadsheetImport
                isOpen={isImportOpen}
                onClose={onImportClose}
                onSubmit={onImportSubmit}
                fields={importFields}
                />
            </div>
        </div>
    );
};
