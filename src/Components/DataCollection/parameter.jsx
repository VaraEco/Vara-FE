import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useParams } from 'react-router-dom';
import { generalFunction } from '../../assets/Config/generalFunction';
import PopUp from '../Common/CommonComponents/PopUp';
import Button from '../Common/CommonComponents/Button';
import { apiClient } from '../../assets/Config/apiClient';
import { useNavigate } from 'react-router-dom';
import IconDelete from '../Common/CommonComponents/IconDelete';
import { Line } from 'react-chartjs-2';

export default function Parameter() {
    const [collectionData, setCollectionData] = useState([]);
    const { parameter, process } = useParams();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [parameterData, setParameterData] = useState([]);
    const [popupFields, setPopupFields] = useState([]);
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [newDataCollectionPoint, setNewDataCollectionPoint] = useState({ name: '', method: '' });
    const [facilityName, setFacilityName] = useState('');
    const [processName, setProcessName] = useState('');
    const [parameterName, setParameterName] = useState('');
    const [parameterUnit, setParameterUnit] = useState('');
    const [graphData, setGraphData] = useState([])
    const [collectionPointNames, setCollectionPointNames] = useState({});

    const navigate = useNavigate();

    const tableFields = [
        { id: 'name', label: 'Point Name' },
        { id: 'method', label: 'Method' },
        {id: 'action', label: 'Action'}
    ];

    console.log('parameter', parameter, 'process', process);
    

    // Fetch data collection points on component mount and when parameter/process changes
    useEffect(() => {
        fetchDataCollectionPoints();
    }, [parameter, process]);

    useEffect(() => {
        if (collectionData.length > 0) {
            fetchLogsByDataCollectionId();
        }
    }, [collectionData]);
    

    const fetchDataCollectionPoints = async () => {
        try {
            // Get mapping ID
            const { data: mappingData, error: mappingError } = await supabase
                .from('parameter_process_mapping')
                .select(`id, process(process_name, facility(facility_name))`)
                .eq('parameter_id', parameter)
                .eq('process_id', process)
                .single();

            if (mappingError) {
                console.error(mappingError);
                return;
            }

            const mappingId = mappingData.id;
            setFacilityName(mappingData.process.facility.facility_name);
            setProcessName(mappingData.process.process_name);

            // Get Parameter Name from Paramter Id
            const parameterId = parseInt(parameter, 10);
            const { data: parameter_name, error: parameter_error } = await supabase
                .from('parameter')
                .select('*')
                .eq('para_id', parameterId);

            if (parameter_error) {
                console.error('Error fetching parameter:', parameter_error);
            }

            setParameterName(parameter_name[0].para_name)
            setParameterUnit(parameter_name[0].para_metric)

            // Get data collection points
            const { data: collectionPoints, error: collectionError } = await supabase
                .from('data_collection_points')
                .select(`*`)
                .eq('process_facility_mapping_id', mappingId);

            if (collectionError) {
                console.error(collectionError);
                return;
            }

            setCollectionData(collectionPoints);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLogsByDataCollectionId = async () => {
        try {
            // Fetch logs from `parameter_log` table
            const { data: parameterLogs, error: logError } = await supabase
                .from('parameter_log')
                .select('data_collection_id, log_id, value, log_date, evidence_url')
                .in(
                    'data_collection_id',
                    collectionData.map(item => item.id) // Ensure we only fetch logs for existing collection points
                );
    
            if (logError) {
                console.error('Error fetching parameter logs:', logError);
                return;
            }
    
            // Transform logs into grouped format
            const groupedLogs = parameterLogs.reduce((acc, log) => {
                const { data_collection_id, ...rest } = log;
    
                if (!acc[data_collection_id]) {
                    acc[data_collection_id] = [];
                }
    
                acc[data_collection_id].push(rest);
                return acc;
            }, {});
    
            // Convert grouped object into array of objects with data_collection_id as key
            const formattedLogs = Object.keys(groupedLogs).map(key => ({
                data_collection_id: key,
                logs: groupedLogs[key],
            }));
    
            formattedLogs.forEach(item => {
                item.logs.sort((a, b) => new Date(a.log_date) - new Date(b.log_date)); // Sort logs within each collection by log_date
            });

            console.log('formated date::::::', formattedLogs);
            

            setGraphData(formattedLogs);
        } catch (error) {
            console.error('Error processing logs:', error);
        }
    };

    useEffect(() => {
        localStorage.setItem('facilityName', facilityName);
        localStorage.setItem('parameterName', parameterName);
        localStorage.setItem('processName', processName);
    }, [facilityName, parameterName, processName]);

    const getSignedUrl = async (evidence_url, evidence_name) => {
        if (evidence_url) {
            // Getting Supabase document
            const signedUrl = await generalFunction.getSignedUrl(evidence_url);
            // Getting document from S3
            //const S3url = await generalFunction.getURLFromS3(evidence_name)
            return signedUrl.signedUrl
        } else {
            return "N/A"
        }

    }

    const getAIExtractedValue = async (log) => {
        if (log.ai_extracted_value) {
            return log.ai_extracted_value
        }
        else if(log.evidence_name) {
            const ai_value = await apiClient.getOCRValue(log.evidence_name);

            // update the database with this value
            const { data, error } = await supabase
                .from('parameter_log')
                .update({ai_extracted_value: ai_value})
                .eq('log_id', log.log_id);

            if (error) {
                throw error;
            }

            return ai_value;
        }
        return '';
    }


    const handleCellClick = async (row) => {
        navigate(`${row.id}`);

        localStorage.setItem('method', row.name)
        
        // setIsPopupOpen(true);
        // console.log(row)
        // const isLocal = window.location.hostname === 'localhost';
        // //const OCR_Feature =  isLocal ? true : false
        // const OCR_Feature = false
        // console.log(row.id)
        // const data = await generalFunction.fetchParameterDataSourceData(row.id)
        // console.log(data)
        // const { data, error } = await supabase
        //     .from('parameter_log')
        //     .select('log_id, value, log_date, evidence_url, evidence_name, ai_extracted_value')
        //     .eq('data_collection_id', row.id);

        // console.log(data)
        // if (error){
        //     console.error(error);
        //     return
        // }

        // const parameterLogs = await Promise.all(data.map(async log => {
        //     const signedUrl = await getSignedUrl(log.evidence_url, log.evidence_name);
        //     let OCRValue = '';
        //     if (OCR_Feature) {
        //         OCRValue = await getAIExtractedValue(log);
        //     }
        //     return {
        //         value: log.value,
        //         log_date: new Date(log.log_date).toLocaleDateString(),
        //         evidence: signedUrl,
        //         ai_extracted_value: OCRValue
        //     };
        // }));

        // const processedData = {
        //     ...row,
        //     parameter_log: parameterLogs
        // };

        // setParameterData(processedData);

        // const baseFields = [
        //     { id: 'name', label: 'Name' },
        //     { id: 'method', label: 'Method' },
        //     { id: 'parameter_log', label: 'Parameter Log', type: 'table', tableFields: [
        //         {
        //             id: 'value',
        //             label: 'Value'
        //         },
        //         {   id: 'log_date',
        //             label: 'Log Date'
        //         },
        //         {
        //             id: 'evidence',
        //             label: 'Evidence',
        //             type: 'url'
        //         }
        //     ]}
        // ];

        // if(OCR_Feature) {
        //     baseFields[2].tableFields.push({
        //         id: 'ai_extracted_value',
        //         label: 'AI Extracted Value'
        //     });
        // }
        // setPopupFields(baseFields);
    };

    const handleAddDataCollectionPoint = async () => {
        const { name, method } = newDataCollectionPoint;

        try {
            // Get mapping ID
            const { data: mappingData, error: mappingError } = await supabase
                .from('parameter_process_mapping')
                .select('id')
                .eq('parameter_id', parameter)
                .eq('process_id', process)
                .single();

            if (mappingError) {
                console.error(mappingError);
                return;
            }

            const mappingId = mappingData.id;

            const { error } = await supabase
                .from('data_collection_points')
                .insert({ name, method, process_facility_mapping_id: mappingId });

            if (error) {
                console.error(error);
            } else {
                setIsAddPopupOpen(false);
                setNewDataCollectionPoint({ name: '', method: '' });
                fetchDataCollectionPoints(); // Refresh the data collection points after adding a new one
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setParameterData([]);
    };

    const handleCloseAddPopup = () => {
        setIsAddPopupOpen(false);
        setNewDataCollectionPoint({ name: '', method: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDataCollectionPoint(prevState => ({ ...prevState, [name]: value }));
    };

    const handleDeleteCollectionPoint = async (row) => {
        console.log(row);

        const {error: parameter_log_error} = await supabase
        .from('parameter_log')
        .delete()
        .eq('data_collection_id', row.id)

        if(parameter_log_error){
            console.log(parameter_log_error);
            return
        }

        const {error: data_collection_point_error} = await supabase
        .from('data_collection_points')
        .delete()
        .eq('id', row.id)

        if(data_collection_point_error){
            console.log(data_collection_point_error);
            return
        }

        fetchDataCollectionPoints()
    }

    useEffect(() => {
        const fetchCollectionPointName = async (data_collection_id) => {
          // Check if name is already fetched
          if (collectionPointNames[data_collection_id]) return;
    
          try {
            const { data, error } = await supabase
              .from('data_collection_points')
              .select('name')
              .eq('id', data_collection_id)
              .single();
    
            if (error) {
              console.error('Error fetching collection point name:', error);
              return;
            }
    
            // Update state with the fetched name
            setCollectionPointNames((prevState) => ({
              ...prevState,
              [data_collection_id]: data.name,
            }));
          } catch (error) {
            console.error('Error fetching data collection point:', error);
          }
        };
    
        // Fetch names for each graph data
        graphData.forEach((item) => {
          fetchCollectionPointName(item.data_collection_id);
        });
      }, [graphData, collectionPointNames]);

    
    return (
        <div className="relative flex flex-col justify-center overflow-hidden mt-20">
            <div className="w-full p-6 m-auto bg-white rounded-md shadow-xl shadow-black-600/40 lg:max-w-5xl">
                <h1 className="text-xl text-center mb-4">Parameter Data</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                        <div className=" p-4 rounded-lg">
                                <h2 className="text-l font-semibold text-gray-700">Parameter</h2>
                                <p className="text-lg text-gray-500">{parameterName}</p>
                        </div>
                        <div className=" p-4 rounded-lg">
                                <h2 className="text-l font-semibold text-gray-700">Unit</h2>
                                <p className="text-lg text-gray-500">{parameterUnit}</p>
                        </div>
                        <div className=" p-4 rounded-lg">
                            <h2 className="text-l font-semibold text-gray-700">Facility</h2>
                            <p className="text-lg text-gray-500">{facilityName}</p>
                        </div>
                        <div className=" p-4 rounded-lg">
                            <h2 className="text-l font-semibold text-gray-700">Process</h2>
                            <p className="text-lg text-gray-500">{processName}</p>
                        </div>
                    </div>
            </div>

                <div className="container mx-auto">

                <div style={{ width: '100%', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px', padding: '10px', borderRadius: '10px' }}>
        <h3 className="text-center text-lg font-semibold mb-4">All Collection Points</h3>
        <Line
            data={{
                labels: graphData.length > 0 ? graphData[0].logs.map((log) => new Date(log.log_date).toLocaleDateString()) : [],
                datasets: graphData.map((item) => ({
                    label: collectionPointNames[item.data_collection_id] || `Collection Point ${item.data_collection_id}`,
                    data: item.logs.map((log) => log.value),
                    fill: false,
                    borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                    tension: 0.4,
                })),
            }}
            options={{
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                },
                scales: {
                    x: { display:false },
                    y: { title: { display: false, text: parameterUnit || 'Value' } },
                },
            }}
        />
    </div>
                    {/* <div className="mt-4">
                        <h2 className="text-l text-center">Data Collection Points</h2>
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    {tableFields.map((field) => (
                                        <th key={field.id} className="py-2">{field.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {collectionData.map((row) => (
                                    <tr key={row.id} className="cursor-pointer hover:bg-gray-100" onClick={() => handleCellClick(row)}>
                                        {tableFields.map((field) => (
                                            <td key={field.id} className="py-2">{row[field.id]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div> */}
                    <div className="mt-8 px-4">
                    <h2 className="text-l text-center mb-4 text-gray-800">Data Collection Points</h2>
                    <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
                        <thead className="bg-gray-200">
                        <tr>
                            {tableFields.map((field) => (
                            <th
                                key={field.id}
                                className="py-3 px-4 text-left text-gray-700 font-medium uppercase tracking-wider"
                            >
                                {field.label}
                            </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {collectionData.map((row) => (
                            <tr
                            key={row.id}
                            className="cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleCellClick(row)}
                            >
                            {tableFields.map((field) => (
                                <td
                                key={field.id}
                                className="py-3 px-4 text-gray-600 border-b border-gray-200"
                                >
                                {field.id==='action' ? (<button
                                onClick={(e)=> {e.stopPropagation()
                                    handleDeleteCollectionPoint(row)
                                }}
                                style={{marginLeft:'15px'}}
                                ><IconDelete/></button>) : (row[field.id])}
                                </td>
                            ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>

                    {isPopupOpen && (
                        <PopUp
                            title="Parameter Data"
                            fields={popupFields}
                            newRowData={parameterData}
                            handleClosePopup={handleClosePopup}
                            readOnly={true}
                        />
                    )}
                    {isAddPopupOpen && (
                        <PopUp
                            title="Add Data Collection Point"
                            fields={[
                                { id: 'name', label: 'Name', type: 'text' },
                                { id: 'method', label: 'Method', type: 'text' }
                            ]}
                            newRowData={newDataCollectionPoint}
                            handleInputChange={handleInputChange}
                            handleClosePopup={handleCloseAddPopup}
                            handleSave={handleAddDataCollectionPoint}
                        />
                    )}
                </div>
                <div className="flex justify-center mt-4">
                    <Button
                        label="Add Data Collection Point"
                        handleFunction={() => setIsAddPopupOpen(true)}
                        className="bg-green-500 text-white rounded hover:bg-green-600"
                    />
                </div>
            </div>
        </div>
    );
}
