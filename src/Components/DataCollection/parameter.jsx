import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useParams } from 'react-router-dom';
import { generalFunction } from '../../assets/Config/generalFunction';
import PopUp from '../Common/CommonComponents/PopUp';
import Button from '../Common/CommonComponents/Button';
import { apiClient } from '../../assets/Config/apiClient';

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

    const tableFields = [
        { id: 'name', label: 'Point Name' },
        { id: 'method', label: 'Method' },
    ];

    // Fetch data collection points on component mount and when parameter/process changes
    useEffect(() => {
        fetchDataCollectionPoints();
    }, [parameter, process]);

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

    const getSignedUrl = async (evidence_url, evidence_name) => {
        if (evidence_url) {
            // Getting Supabase document
            //const signedUrl = await generalFunction.getSignedUrl(evidence_url);
            // Getting document from S3
            const S3url = await generalFunction.getURLFromS3(evidence_name)
            return S3url
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
        setIsPopupOpen(true);

        const isLocal = window.location.hostname === 'localhost';
        const OCR_Feature =  isLocal ? true : false

        const { data, error } = await supabase
            .from('parameter_log')
            .select('log_id, value, log_date, evidence_url, evidence_name, ai_extracted_value')
            .eq('data_collection_id', row.id);

        if (error){
            console.error(error);
            return
        }

        const parameterLogs = await Promise.all(data.map(async log => {
            const signedUrl = await getSignedUrl(log.evidence_url, log.evidence_name);
            let OCRValue = '';
            if (OCR_Feature) {
                OCRValue = await getAIExtractedValue(log);
            }
            return {
                value: log.value,
                log_date: new Date(log.log_date).toLocaleDateString(),
                evidence: signedUrl,
                ai_extracted_value: OCRValue
            };
        }));

        const processedData = {
            ...row,
            parameter_log: parameterLogs
        };

        setParameterData(processedData);

        const baseFields = [
            { id: 'name', label: 'Name' },
            { id: 'method', label: 'Method' },
            { id: 'parameter_log', label: 'Parameter Log', type: 'table', tableFields: [
                {
                    id: 'value',
                    label: 'Value'
                },
                {   id: 'log_date',
                    label: 'Log Date'
                },
                {
                    id: 'evidence',
                    label: 'Evidence',
                    type: 'url'
                }
            ]}
        ];

        if(OCR_Feature) {
            baseFields[2].tableFields.push({
                id: 'ai_extracted_value',
                label: 'AI Extracted Value'
            });
        }
        setPopupFields(baseFields);
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

    return (
        <div className="relative flex flex-col justify-center overflow-hidden mt-20">
            <div className="w-full p-6 m-auto bg-white rounded-md shadow-xl shadow-black-600/40 lg:max-w-4xl">
                <h1 className="text-2xl text-center mb-4">Parameter Data</h1>
                <h2 className="text-2xl text-left mb-4">Facility: {facilityName}</h2>
                <h2 className="text-2xl text-left mb-4">Process: {processName}</h2>
                <div className="container mx-auto">
                    <div className="mt-4">
                        <h2 className="text-xl">Data Collection Points</h2>
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
                <div className="mt-4">
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
