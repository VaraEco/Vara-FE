import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";

import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileRename from 'filepond-plugin-file-rename';
registerPlugin(FilePondPluginFileRename);
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

import { generalFunction } from '../../assets/Config/generalFunction';
import Button from '../Common/CommonComponents/Button';
import Table from '../Common/CommonComponents/Table';
import PopUp from '../Common/CommonComponents/PopUp';
import DeletePopUp from '../Common/CommonComponents/DeletePopUp';
import ErrorPopUp from '../Common/CommonComponents/ErrorPopUp.jsx';
import IconDelete from '../Common/CommonComponents/IconDelete.jsx';
import IconEdit from '../Common/CommonComponents/IconEdit.jsx';
import IconUpload from '../Common/CommonComponents/IconUpload.jsx';
import IconMessage from '../Common/CommonComponents/IconMessage.jsx';
import IconChart from '../Common/CommonComponents/IconChart.jsx';
import ChatBot from '../Common/CommonComponents/ChatBox.jsx';
import { mainConfig } from "../../assets/Config/appConfig";
import Papa from 'papaparse'
import CsvToTable from '../Common/CommonComponents/CsvToTable.jsx';

export default function DataAnalytics() {

    const [files, setFiles] = useState([]);
    const [uploaded, setUploaded] = useState(false);
    const storage_api = mainConfig.REACT_APP_BACKEND_DOC_UPLOAD_API
    console.log("Storage api is: ", storage_api)
    const [parsedData, setParsedData] = useState([])

    const handleUpdateFiles = (fileItems) => {
        const updatedFiles = fileItems.map(fileItem => fileItem.file);
        setFiles(updatedFiles);
    
        updatedFiles.forEach(file => {
          if (file.type === "text/csv") {
            readCSVFile(file);
          }
        });
      };

      const readCSVFile = (file) => {
        const reader = new FileReader();
    
        reader.onload = (event) => {
          const csvData = event.target.result;
    

          Papa.parse(csvData, {
            
            header: true, 
            complete: (results) => {
              console.log('Parsed CSV Data:', results.data);
              setParsedData(results.data); 
            },
            error: (error) => {
              console.error('Error parsing CSV:', error);
            }
          });
        };
    
        reader.readAsText(file); // Read the file as text
      };

    return (
        <div className="flex flex-col justify-center overflow-hidden p-6 h-screen">
            {!uploaded && (
            <div>
            <h1 className="text-xl text-center mb-20">Talk to your data instantly</h1>
            <div className="m-auto w-full flex justify-center">
                <div className="w-1/2">
                    <FilePond
                        files={files}
                        allowReorder={true}
                        onupdatefiles={handleUpdateFiles}
                        labelIdle='Drop CSV here or <span class="filepond--label-action">browse</span>'
                        server={storage_api}
                        onprocessfile={(error, file) => {
                            setUploaded(true);
                        }}
                        fileRenameFunction={async (file) => {
                            const chatId = await generalFunction.getChatId();
                            return `${file.name}_${chatId}`;
                        }}
                        className="w-full"
                    />
                </div>
            </div>
            <h2 className="text-lg text-center mt-20 mb-8">Instructions</h2>
            <div className="flex flex-row justify-center items-center gap-8">
                <div className="text-left text-md bg-gray-100 w-60 h-60 p-4 rounded-lg">
                    <IconUpload className="text-2xl mb-4"/>
                    <h3 className="mb-4 font-medium">Upload a spreadsheet</h3>
                    <p className="mb-4 text-gray-400">Upload any CSV or spreadsheet to get started.</p>
                </div>
                <div className="text-left text-md bg-gray-100 w-60 h-60 p-4 rounded-lg">
                    <IconMessage className="text-2xl mb-4"/>
                    <h3 className="mb-4 font-medium">Talk to your data</h3>
                    <p className="mb-4 text-gray-400">"Show me orders by region" "How many of my users use Gmail?"</p>
                </div>
                <div className="text-left text-md bg-gray-100 w-60 h-60 p-4 rounded-lg">
                    <IconChart className="text-2xl mb-4"/>
                    <h3 className="mb-4 font-medium">Visualize your data</h3>
                    <p className="mb-4 text-gray-400">Make bar charts, scatter plots, pie charts, histograms, and line charts in seconds.</p>
                </div>
            </div>
            </div>
            )}
            {uploaded && (
                <CsvToTable allData={parsedData} />
            )}
        </div>
    );
}