import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './parameteroverview.css';
import { generalFunction } from '../../assets/Config/generalFunction';
import Button from '../Common/CommonComponents/Button';
import {json, Link} from 'react-router-dom';
import { userPermissions } from '../../assets/Config/accessControl';
import * as XLSX from 'xlsx';
import ToastPop from '../Common/CommonComponents/ToastPop';
import CsvToTable from '../Common/CommonComponents/CsvToTable';
import AllCollectionsDataToTable from '../Common/CommonComponents/AllCollectionsDataToTable';

export default function Parameteroverview() {
    const [tableData, setTableData] = useState([]);
    const [isParameterPopupOpen, setIsParameterPopupOpen] = useState(false);
    const [newParameterData, setNewParameterData] = useState({ parameter: '', unit: '', processFacilityMappings: [] });
    const [facilities, setFacilities] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState('');
    const [selectedProcess, setSelectedProcess] = useState('');
    const [loading, setLoading] = useState(false);
    const [buttonColor, setButtonColor] = useState('bg-blue-500');
    const [isProcessParameterPopupOpen, setIsProcessParameterPopupOpen] = useState(false);
    const [parameterProcessData, setParameterProcessData] = useState([]);
    const [popupFacilities, setPopupFacilities] = useState([]);
    const [popupProcesses, setPopupProcesses] = useState([]);
    const [selectedPopupFacility, setSelectedPopupFacility] = useState('');
    const [selectedPopupProcess, setSelectedPopupProcess] = useState('');
    const [hasPermission, setHasPermission] = useState(false);
    
    const [collectionPointsData, setCollectionPointsData] = useState([])
    const [viewCSVcomponnet, setViewCSVcomponnet] = useState(false)
    const [showToast, setShowToast] = useState(false);

    const lsData = localStorage.getItem('adminDetails');
    const adminDetails = lsData ? JSON.parse(lsData) : {};
    const userId = adminDetails.userId; // Access userId from the parsed object
    
    const [allfetchedData, setAllFetchedData] = useState([])

    useEffect(() => {
        fetchMeasurement();
        fetchFacilities();
        const checkPermission = async () => {
            const permission = await userPermissions.hasUserSettingPermissions();
            setHasPermission(permission);
        };

        checkPermission();
        
        const toastShown = localStorage.getItem('toastShown');
        if (userId && !toastShown) {
            setShowToast(true);
            localStorage.setItem('toastShown', 'true'); // Set flag to prevent future shows    
            
            // saving detials in local storage for login notification

            const existingNotifications = JSON.parse(localStorage.getItem('allNotification')) || [];

            // Create a new notification
            const newNotification = {
                // facilityName: newFacility.name,
                dateAdded: new Date().toLocaleString(), // Use toLocaleString for full date and time
                action: 'loggedIn'
            };
        
            // Add the new notification to the existing ones
            existingNotifications.push(newNotification);
        
            // Store updated notifications back to localStorage
            localStorage.setItem('allNotification', JSON.stringify(existingNotifications));
        }
    }, [userId]);

    async function fetchFacilities() {
        try {
            const data = await generalFunction.fetchFacilities();
            setFacilities(data);
        } catch (error) {
            console.error(error.message);
        }
    }

    async function fetchProcesses(facilityId) {
        try {
            const data = await generalFunction.fetchProcesses(facilityId);
            setProcesses(data);
        } catch (error) {
            console.error(error.message);
        }
    }


    const handleFacilityChange = async (e) => {
        const { value } = e.target;
        setSelectedFacility(value);
        await fetchProcesses(value);
      };

    const handleProcessChange = (e) => {
        const { value } = e.target;
        setSelectedProcess(value);
    };

    async function fetchMeasurement() {
        const companyid = await generalFunction.getCompanyId();
        const { data, error } = await supabase.rpc('fetch_aggregated_metrics', { p_company_id: companyid });
        if (error) {
            console.error(error);
        } else {
            setTableData(formatData(data));
        }
    }

    const formatData = (data) => {
        const result = {};
        if (!data || !Array.isArray(data)) {
            console.error("Invalid data format in formatData:", data);
            return result;
        }

        data.forEach(item => {
            const { facility_name, facility_id, process_name, process_id, para_name, para_id, total_value } = item;
            if (!result[facility_name]) {
                result[facility_name] = {
                    facility_id,
                    processes: {}
                };
            }
            if (!result[facility_name].processes[process_name]) {
                result[facility_name].processes[process_name] = {
                    process_id,
                    parameters: {}
                };
            }
            result[facility_name].processes[process_name].parameters[para_name] = {
                para_id,
                total_value
            };
        });
        return result;
    };

    async function fetchProcessParameterData(para_id) {
        const { data, error } = await supabase.from('parameter_process_mapping').select(`id, process_id, parameter_id
            ,process(process_name, facility_id,facility(facility_name))
            `).eq('parameter_id', para_id).eq('active', true);
        if (error) {
            console.error(error);
        } else {
            setParameterProcessData(data);
        }
        return data;
    }

    const handleOpenParameterPopup = () => {
        setIsParameterPopupOpen(true);
    };

    const handleCloseParameterPopup = () => {
        setIsParameterPopupOpen(false);
        setNewParameterData({ parameter: '', unit: '', processFacilityMappings: [] });
    };

    const openProcessParameterPopup = async (para_id) => {
        const data = await fetchProcessParameterData(para_id);
        if (data) {
            const facilitiesData = await generalFunction.fetchFacilities();
            setPopupFacilities(facilitiesData);
            setIsProcessParameterPopupOpen(true);
        }
    };

    const closeProcessParameterPopup = () => {
        setIsProcessParameterPopupOpen(false);
        setParameterProcessData([]);
        setPopupFacilities([]);
        setPopupProcesses([]);
        setSelectedPopupFacility('');
        setSelectedPopupProcess('');
    };

    const handlePopupFacilityChange = async (e) => {
        const { value } = e.target;
        setSelectedPopupFacility(value);
        const processesData = await generalFunction.fetchProcesses(value);
        setPopupProcesses(processesData);
    };

    const handlePopupProcessChange = (e) => {
        const { value } = e.target;
        setSelectedPopupProcess(value);
    };

    async function addProcessParameterMapping() {
        const { error } = await supabase
            .from('parameter_process_mapping')
            .insert([{ process_id: selectedPopupProcess, parameter_id: parameterProcessData[0]?.parameter_id, active: true }]);

        if (error) {
            console.error(error);
            return;
        }

        // Fetch updated data
        fetchProcessParameterData(parameterProcessData[0]?.parameter_id);
    }

    async function deleteProcessParameterMapping(mapping,mappingId) {
        
        console.log(mapping);

        const {error: parameter_log_error} = await supabase
        .from('parameter_log')
        .delete()
        .eq('process_id',mapping.process_id)
        .eq('para_id',mapping.parameter_id)

        if(parameter_log_error){
            console.log(parameter_log_error);
            return
        }

        const {error: data_collection_point_error} = await supabase
        .from('data_collection_points')
        .delete()
        .eq('process_facility_mapping_id', mapping.id)

        if(data_collection_point_error){
            console.log(data_collection_point_error);
            return
        }

        const { error: parameter_process_mapping_error } = await supabase
            .from('parameter_process_mapping')
            .delete()
            .eq('id', mappingId);

        if (parameter_process_mapping_error) {
            console.error(parameter_process_mapping_error);
            return;
        }

        // Fetch updated data
        const parameterId = parameterProcessData.find(mapping => mapping.id === mappingId)?.parameter_id;
        fetchProcessParameterData(parameterId);

        const {error: parameter_error} = await supabase
        .from('parameter')
        .delete()
        .eq('para_id', mapping.parameter_id)

        if (parameter_error) {
            console.error(parameter_error);
            return;
        }
    }

    const handleInputChange = (e, setData) => {
        const { name, value } = e.target;
        setData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const addProcessFacilityMapping = () => {
        const temp_facilityName = facilities.find(facility => facility.facility_id === Number(selectedFacility))?.facility_name;
        const temp_processName = processes.find(process => process.process_id === Number(selectedProcess))?.process_name;
        setNewParameterData(prevData => ({
            ...prevData,
            processFacilityMappings: [...prevData.processFacilityMappings, { facility_id: selectedFacility, process_id: selectedProcess, facility_name: temp_facilityName, process_name: temp_processName }]
        }));
        setSelectedFacility('');
        setSelectedProcess('');
    };

    const removeProcessFacilityMapping = (index) => {
        setNewParameterData(prevData => ({
            ...prevData,
            processFacilityMappings: prevData.processFacilityMappings.filter((_, i) => i !== index),
        }));
    };

    async function createParameter() {
        const userId = localStorage.getItem('varaUserId');
        setLoading(true);
        setButtonColor('bg-yellow-500');

        const { data, error } = await supabase
            .from('parameter')
            .insert([{ created_by: userId, para_name: newParameterData.parameter, para_metric: newParameterData.unit, para_description: newParameterData.parameter }])
            .select('para_id');

        if (error) {
            console.error(error);
            setButtonColor('bg-red-500');
            setLoading(false);
            setTimeout(() => {
                setButtonColor('bg-blue-500');
                handleCloseParameterPopup();
            }, 2000);
            return;
        }

        const parameterId = data[0].para_id;

        const parameterProcessMappings = newParameterData.processFacilityMappings.map(mapping => ({ parameter_id: parameterId, process_id: mapping.process_id, active: true }));
        if (parameterProcessMappings.length > 0) {
            const { error: mappingError } = await supabase
                .from('parameter_process_mapping')
                .insert(parameterProcessMappings);

            if (mappingError) {
                console.error(mappingError);
                setButtonColor('bg-red-500');
                setLoading(false);
                setTimeout(() => {
                    setButtonColor('bg-blue-500');
                }, 2000);
                return;
            }
            fetchMeasurement();
            setButtonColor('bg-green-500');
            setLoading(false);
            setTimeout(() => {
                setButtonColor('bg-blue-500');
                handleCloseParameterPopup();
            }, 2000);
        }
    }
    

    const renderTable = () => {
        console.log('table-dataa', tableData);
        
        for (const facilityKey in tableData) {
            if (tableData.hasOwnProperty(facilityKey)) {
              const facility = tableData[facilityKey];
              
              // Iterate over each process in the facility's processes
              for (const processKey in facility.processes) {
                if (facility.processes.hasOwnProperty(processKey)) {
                  const process = facility.processes[processKey];
                  
                  // Extract process_id
                  const process_id = process.process_id;
                  
                  // Iterate over parameters to extract para_id
                  for (const parameterKey in process.parameters) {
                    if (process.parameters.hasOwnProperty(parameterKey)) {
                      const parameter = process.parameters[parameterKey];
                      
                      // Check if parameter has para_id
                      if (parameter.para_id !== undefined) {
                        // Extract para_id
                        const para_id = parameter.para_id;
                        
                        // Store the result
                        collectionPointsData.push({ process_id, para_id, parameter_name: parameterKey });
                      }
                    }
                  }
                }
              }
            }
          }
          
        localStorage.setItem('para_name', JSON.stringify(collectionPointsData))
        console.log('collectionPointsData', collectionPointsData);
        fetchParameterLogs()
        // fetchMultipleParameterLogs(collectionPointsData)

        const facilities = Object.keys(tableData);
        if (facilities.length === 0) return <p>No data available</p>;

        const parameters = new Map();
        facilities.forEach(facility => {
            Object.values(tableData[facility].processes).forEach(processData => {
                Object.entries(processData.parameters).forEach(([parameter, value]) => {
                    parameters.set(parameter, value.para_id);
                });
            });
        });

        const exportToExcel = () => {
            const worksheetData = [];
    
            // Add table headers
            const headers = ['Parameter'];
            const subHeaders = ['']; // Empty to align with 'Parameter' column
    
            facilities.forEach(facility => {
                const processCount = Object.keys(tableData[facility].processes).length;
                headers.push(facility); // Facility name
                // Add empty columns to align the facility header with the process columns
                for (let i = 1; i < processCount; i++) {
                    headers.push(''); // Empty to span across processes
                }
    
                // Add process names below the facility header
                Object.keys(tableData[facility].processes).forEach(process => {
                    subHeaders.push(process);
                });
            });
    
            worksheetData.push(headers);  // Facility row
            worksheetData.push(subHeaders);  // Processes row
    
            // Add table rows (Parameter and corresponding values)
            Array.from(parameters.entries()).forEach(([parameter, para_id]) => {
                const row = [parameter];
                facilities.forEach(facility => {
                    Object.keys(tableData[facility].processes).forEach(process => {
                        const cellValue = tableData[facility].processes[process].parameters[parameter]?.total_value || '-';
                        row.push(cellValue);
                    });
                });
                worksheetData.push(row);
            });
    
            // Create a worksheet and workbook
            const ws = XLSX.utils.aoa_to_sheet(worksheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Table Data");
    
            // Download Excel file
            XLSX.writeFile(wb, 'table_data_neww.xlsx');
        };

        return (
            
            <div>
                <div className='flex justify-end mr-4 relative bottom-[60px] gap-3'>
                <Button
                        label='View Analytics'
                        handleFunction={()=> setViewCSVcomponnet(true)}
                        />
                <Button
                            label="Download Excel"
                            handleFunction={exportToExcel}
                            additionalClasses="bg-red-500"
                        />
                </div>
                <table className="metrics-table">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        {facilities.map(facility => (
                            <th key={facility} colSpan={Object.keys(tableData[facility].processes).length} className="text-center">
                                {facility}
                            </th>
                        ))}
                    </tr>
                    <tr>
                        <th></th>
                        {facilities.map(facility =>
                            Object.keys(tableData[facility].processes).map(process => (
                                <th key={`${facility}-${process}`} className="text-center">
                                    {process}
                                </th>
                            ))
                        )}
                    </tr>
                </thead>
                <tbody>
                {Array.from(parameters.entries()).map(([parameter, para_id]) => (
                    <tr key={parameter}>
                        <td onClick={() => openProcessParameterPopup(para_id)} className="cursor-pointer text-blue-500 hover:underline">
                            {parameter}
                        </td>
                        {facilities.map(facility =>
                            Object.keys(tableData[facility].processes).map(process => {
                                const { process_id } = tableData[facility].processes[process];
                                const cellValue = tableData[facility].processes[process].parameters[parameter]?.total_value || '-';
                                return (
                                    <td key={`${facility}-${process}-${parameter}`} className="text-center">
                                        {cellValue !== undefined ? (
                                            <Link to={`/data_collection/${para_id}/${process_id}`} className="text-blue-500 hover:underline">
                                                {cellValue}
                                            </Link>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                );
                            })
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        );
    };

    async function fetchParameterLogs() {
        if (!collectionPointsData || collectionPointsData.length === 0) {
          console.error('No collection points data available');
          return;
        }
      
        // Construct the OR query
        const orQuery = collectionPointsData
          .map(({ process_id, para_id }) => {
            if (process_id && para_id) {
              return `process_id.eq.${process_id},para_id.eq.${para_id}`;
            }
            return null;
          })
          .filter(Boolean) // Remove null or undefined values
          .join(',');
      
        if (!orQuery) {
          console.error('Invalid orQuery string constructed');
          return;
        }
      
        try {
          const { data, error } = await supabase
            .from('parameter_log')
            .select('*')
            .or(orQuery);
      
          if (error) {
            console.error('Error fetching data:', error.message);
            return;
          }
      
          console.log('Fetched data:', data);
          setAllFetchedData(data);
        } catch (err) {
          console.error('Unexpected error:', err.message);
        }
      }
      
      // Call the function
    //   fetchParameterLogs();

    // async function fetchParameterName(para_id){
    //     try {
    //         const {data, error} = await supabase
    //         .from('parameter')
    //         .select('*')
    //         .eq('para_id', para_id)
    //         .single()

    //         if(error){
    //             console.log('error fetching parameter details', error);
    //             return
    //         }
    //         console.log('fetchParameterName====>',data);
            
    //         return data
    //     } catch (error) {
    //         console.log('error fetching parameter details', error);
    //             return
    //     }
    // }
      

      const formatAllData = (allfetchedData)=> {

        const arr = []

        allfetchedData.forEach(item => {
            const { data_collection_id, log_unit, log_date, value, log_id, para_id } = item;
            const formattedDate = new Date(log_date).toISOString().split("T")[0];

            // const names = fetchParameterName(para_id)

            const lsParaName = JSON.parse(localStorage.getItem('para_name'))

            const output = {
                // Match `para_id` with `lsParaName` and add `parameter_name` or fallback to `Para Id`
                "": (() => {
                  const match = lsParaName.find((item) => item.para_id === para_id);
                  return match ? match.parameter_name : para_id
                })(),
                
                // Set unit based on `log_unit`
                'Unit': (log_unit === 'l' || log_unit === 'ml') 
                  ? 'l/ml' 
                  : (log_unit === 'wh' || log_unit === 'kwh') 
                    ? 'wh/kwh' 
                    : 'kgs/gms',
              };

              const dateWithLogId = formattedDate
              output[dateWithLogId] = value

              arr.push(output)


            })

        return arr

      }

      const allPointsData = formatAllData(allfetchedData)

      console.log('allPointsData===>', allPointsData);

      const formatRevisedData = (data) => {
        const result = [];
      
        data.forEach((item) => {
            const paraId = item[""]
          const unit = item.Unit;
      
          // Check if an object with the same Para Id already exists in the result array
          let existingEntry = result.find((entry) => entry[""] === paraId);
      
          if (!existingEntry) {
            // If no existing entry, create a new one
            existingEntry = { "": paraId, Unit: unit };
            result.push(existingEntry);
          }
      
          // Add the date-value pair to the existing entry
          const dateKey = Object.keys(item).find((key) => key !== "" && key !== "Unit");
          existingEntry[dateKey] = item[dateKey];
        });
      
        return result;
      };
      

      const updatedData = formatRevisedData(allPointsData)

      console.log('updated data===>', updatedData);

      

    return (
        
        <div className="relative flex flex-col justify-center overflow-hidden mt-20">
           {viewCSVcomponnet ? <AllCollectionsDataToTable allData={updatedData}/> :  <div className="w-full m-auto bg-white rounded-md shadow-xl shadow-black-600/40 lg:max-w-5.5xl">
            
            <div className="container mx-auto">
            {hasPermission ? (
                <>
                <h1 className="text-xl text-center mb-4 p-2">Data Collection</h1>
                {!viewCSVcomponnet && renderTable()}
                <div className="flex justify-center mt-4">
                    <Button
                        label="Add Parameter"
                        handleFunction={handleOpenParameterPopup}
                        additionalClasses="bg-red-500"
                    />
                </div>
                </>
            ) : (
                <div className="text-left p-10 mt-4 text-black-500">
                    Contact Admin
                </div>
            )}

                {isParameterPopupOpen && (
                        <div className="z-50 fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-6 w-1/2 min-h-min max-w-4xl max-h-screen rounded-lg overflow-y-auto">
                            <h2 className="text-lg font-bold mb-4">Add Parameter</h2>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="mb-4">
                                    <label htmlFor="parameter" className="block text-sm font-medium text-gray-700">Parameter</label>
                                    <input
                                        type="text"
                                        id="parameter"
                                        name="parameter"
                                        value={newParameterData.parameter}
                                        onChange={(e) => handleInputChange(e, setNewParameterData)}
                                        className="border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                                    <input
                                        type="text"
                                        id="unit"
                                        name="unit"
                                        value={newParameterData.unit}
                                        onChange={(e) => handleInputChange(e, setNewParameterData)}
                                        className="border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="facility" className="block text-sm font-medium text-gray-700">Select Facility</label>
                                    <select
                                        id="facility"
                                        name="facility"
                                        value={selectedFacility}
                                        onChange={handleFacilityChange}
                                        className="border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                                    >
                                        <option value="">Select a facility</option>
                                        {facilities.map(facility => (
                                            <option key={facility.facility_id} value={facility.facility_id}>
                                                {facility.facility_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {(
                                    <div className="mb-4">
                                        <label htmlFor="process" className="block text-sm font-medium text-gray-700">Select Process</label>
                                        <select
                                            id="process"
                                            name="process"
                                            value={selectedProcess}
                                            onChange={handleProcessChange}
                                            className="border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                                        >
                                            <option value="">Select a process</option>
                                            {processes.map(process => (
                                                <option key={process.process_id} value={process.process_id}>
                                                    {process.process_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <Button
                                    label="Save Process-Facility"
                                    handleFunction={addProcessFacilityMapping}
                                />
                                <div className="mb-4">
                                    {newParameterData.processFacilityMappings.map((mapping, index) => (
                                        <div key={index} className="mb-2">
                                            <span>{mapping.facility_name} - {mapping.process_name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeProcessFacilityMapping(index)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleCloseParameterPopup}
                                        className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createParameter}
                                        disabled={loading}
                                        className={`${buttonColor} px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-600`}
                                    >
                                        {loading ? 'Loading...' : 'Add'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {isProcessParameterPopupOpen && (
                        <div className="z-50 fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-6 w-1/2 min-h-min max-w-4xl max-h-screen rounded-lg overflow-y-auto">
                            <div className="text-center">
                            <h2 className="text-lg mb-4">Process Parameter Details</h2>
                            <table className="mt-4 w-full justify-center border-collapse border border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="border border-gray-300">Facility</th>
                                        <th className="border border-gray-300">Process</th>
                                        <th className="border border-gray-300">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parameterProcessData.map((mapping, index) => (
                                        <tr key={index}>
                                            <td className="border border-gray-300">{mapping.process.facility.facility_name}</td>
                                            <td className="border border-gray-300">{mapping.process.process_name}</td>
                                            <td className="border border-gray-300">
                                                <Button
                                                    label="Delete"
                                                    handleFunction={() => deleteProcessParameterMapping(mapping, mapping.id)}
                                                    additionalClasses="bg-red-500"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>

                            <div className="form-group">
                                <label htmlFor="popup-facility">Facility</label>
                                <select
                                    id="popup-facility"
                                    name="popup-facility"
                                    value={selectedPopupFacility}
                                    onChange={handlePopupFacilityChange}
                                >
                                    <option value="">Select a facility</option>
                                    {popupFacilities.map(facility => (
                                        <option key={facility.facility_id} value={facility.facility_id}>
                                            {facility.facility_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="popup-process">Process</label>
                                <select
                                    id="popup-process"
                                    name="popup-process"
                                    value={selectedPopupProcess}
                                    onChange={handlePopupProcessChange}
                                >
                                    <option value="">Select a process</option>
                                    {popupProcesses.map(process => (
                                        <option key={process.process_id} value={process.process_id}>
                                            {process.process_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                label="Save Process-Parameter"
                                handleFunction={addProcessParameterMapping}
                                additionalClasses="bg-blue-500 mt-4"
                            />
                            <div className="flex justify-end mt-4">
                                <Button
                                    label="Close"
                                    handleFunction={closeProcessParameterPopup}
                                    additionalClasses="bg-gray-300"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>}
            {showToast && <ToastPop message="You are now logged in !"/>}
        </div>
    );
}
