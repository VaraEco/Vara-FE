import React, { useState, useEffect } from 'react';
import { generalFunction } from '../../assets/Config/generalFunction';
import Button from '../Common/CommonComponents/Button';
import Table from '../Common/CommonComponents/Table';
import PopUp from '../Common/CommonComponents/PopUp';
import DeletePopUp from '../Common/CommonComponents/DeletePopUp';
import ErrorPopUp from '../Common/CommonComponents/ErrorPopUp.jsx';
import IconDelete from '../Common/CommonComponents/IconDelete.jsx';
import IconEdit from '../Common/CommonComponents/IconEdit.jsx';
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import { ReactSpreadsheetImport } from "react-spreadsheet-import";

export default function SupplierManagement() {
  const errorMessage = "We apologize, but this supplier cannot be deleted at this time. There are associated products, certificates, and/or emails linked to this supplier that must be addressed first. Please remove or reassign these associated items before attempting to delete the supplier again.";
  const [tableData, setTableData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({ supplier_name: '', location: '', key_product: '',  sustainability_score: '', key_contact: '', key_email: '', country: '', state: '', city: '' });
  const [isEditOpen, setEditOpen] = useState(false);
  const [rowData, setRowData] = useState({ id: '', supplier_name: '', location: '', key_product: '',  sustainability_score: '', key_contact: '', key_email: '', country: '', state: '', city: '' });
  const [rowIndex, setRowIndex] = useState(-1);
  const [validationErrors, setValidationErrors] = useState({});
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteRowData, setDeleteRowData] = useState({});
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [countryId, setCountryId] = useState(0);
  const [stateId, setStateId] = useState(0);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importedRowData, setImportedRowData] = useState({});

  const fields = [
    { id: 'supplier_name', label: 'Supplier Name', type: 'text', link: true },
    { id: 'key_product', label: 'Key Product', type: 'text', default: ' ', not_required: true },
    { id: 'sustainability_score', label: 'Sustainability Score', type: 'select', default: 'No Info', not_required: true,
      options: [
        { value: 'No Info', label: 'No Info' },
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' }
      ]
    },
    { id: 'key_contact', label: 'Key Contact', type: 'text' },
    { id: 'key_email', label: 'Key Email', type: 'text' },
    { id: 'country', label: 'Country', type: 'select', not_required: true, no_show: true, options: countryList.map(country => ({ key: country.id, value: country.name, label: country.name })) },
    { id: 'state', label: 'State', type: 'select', not_required: true, no_show: true, options: stateList.map(state => ({ key: state.id, value: state.name, label: state.name })) },
    { id: 'city', label: 'City', type: 'select', not_required: true, no_show: true, options: cityList.map(city => ({ key: city.id, value: city.name, label: city.name })) },
    { id: 'location', label: 'Location', type: 'text', not_required: true, readOnly: true }
  ];

  const importFields = [
    {
      label: "Supplier Name",
      key: "supplier_name",
      fieldType: {
        type: "input",
      },
      validations: [
        {
          rule: "required",
          errorMessage: "Supplier Name is required",
          level: "error",
        },
      ],
    },
    {
      label: "Key Product",
      key: "key_product",
      fieldType: {
        type: "input",
      },
      validations: [
        {
          rule: "required",
          errorMessage: "Key Product is required.",
          level: "error",
        },
      ],
    },
    {
      label: "Sustainability Score",
      key: "sustainability_score",
      fieldType: {
        type: "input",
      },
      validations: [
        {
          rule: "required",
          errorMessage: "Sustainability score is required.",
          level: "error",
        },
      ],
    },
    {
      label: "Key Contact",
      key: "key_contact",
      fieldType: {
        type: "input",
      },
      validations: [
        {
          rule: "required",
          errorMessage: "Key Contact is required.",
          level: "error",
        },
      ],
    },
    {
      label: "Key Email",
      key: "key_email",
      fieldType: {
        type: "input",
      },
      validations: [
        {
          rule: "required",
          errorMessage: "Key Email is required.",
          level: "error",
        },
      ],
    },
  ];

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await generalFunction.fetchSuppliers();
        setTableData(data);
        const countries = await GetCountries();
        setCountryList(countries);
      } catch(error) {
        console.log('Error fetching supplier data:', error);
      }
    };
    getData();
  }, [])

  const getStates = async (countryId) => {
    try {
      setCountryId(parseInt(countryId));
      const states = await GetState(parseInt(countryId));
      setStateList(states);
      return states;
    } catch (error) {
      console.log('Error fetching states:', error);
    }
  };

  const getCities = async (countryId, stateId) => {
    try {
      setCountryId(parseInt(countryId));
      setStateId(parseInt(stateId));
      const cities = await GetCity(parseInt(countryId), parseInt(stateId));
      setCityList(cities);
      return cities;
    } catch (error) {
      console.log('Error fetching cities:', error);
    }
  };

  const handleOpenPopup = () => {
    setValidationErrors({});
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setNewRowData({ supplier_name: '', location: '', key_product: '',  sustainability_score: '', key_contact: '', key_email: '', country: '', state: '', city: '' });
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setNewRowData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'country') {
      const key = e.target.options[e.target.selectedIndex].getAttribute('data-key');
      await getStates(key);
      setNewRowData((prevData) => ({
        ...prevData,
        state: '',
        city: ''
      }));
    } else if (name === 'state') {
      const key = e.target.options[e.target.selectedIndex].getAttribute('data-key');
      await getCities(countryId, key);
      setNewRowData((prevData) => ({
        ...prevData,
        city: ''
      }));
    }

    const selectedCountry = countryList.find(country => country.name === (name === 'country' ? value : newRowData.country));
    const selectedState = stateList.find(state => state.name === (name === 'state' ? value : newRowData.state));
    const selectedCity = cityList.find(city => city.name === (name === 'city' ? value : newRowData.city));

    const location = `${selectedCountry ? selectedCountry.name : ''}${selectedState ? `, ${selectedState.name}` : ''}${selectedCity ? `, ${selectedCity.name}` : ''}`;
    setNewRowData(prevData => ({
      ...prevData,
      location,
    }));
  };

  const handleAddRow = async () => {
    const errors = generalFunction.validateData(newRowData, fields);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    const id = await generalFunction.createSupplier(newRowData);
    const newRowWithId = { ...newRowData, id };
    setTableData((prevData) => [...prevData, newRowWithId]);
    handleClosePopup();
  };

  const openEdit = async (row, index, realIndex) => {
    let states = [];
    let cities = [];
    
    if (row.country) {
      const country = countryList.find(country => country.name === row.country);
      if (country) {
        states = await getStates(country.id);
        if (row.state) {
          const state = states.find(state => state.name === row.state);
          if (state) {
            cities = await getCities(country.id, state.id);
          }
        }
      }
    }
    setValidationErrors({});
    setRowData(row);
    setRowIndex(realIndex);
    setEditOpen(true);
  };

  const handleEditInput = async (e) => {
    const { name, value } = e.target;
    setRowData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'country') {
      const key = e.target.options[e.target.selectedIndex].getAttribute('data-key');
      await getStates(key);
      setRowData((prevData) => ({
        ...prevData,
        state: '',
        city: ''
      }));
    } else if (name === 'state') {
      const key = e.target.options[e.target.selectedIndex].getAttribute('data-key');
      await getCities(countryId, key);
      setRowData((prevData) => ({
        ...prevData,
        city: ''
      }));
    }

    const selectedCountry = countryList.find(country => country.name === (name === 'country' ? value : rowData.country));
    const selectedState = stateList.find(state => state.name === (name === 'state' ? value : rowData.state));
    const selectedCity = cityList.find(city => city.name === (name === 'city' ? value : rowData.city));

    const location = `${selectedCountry ? selectedCountry.name : ''}${selectedState ? `, ${selectedState.name}` : ''}${selectedCity ? `, ${selectedCity.name}` : ''}`;
    setRowData(prevData => ({
      ...prevData,
      location,
    }));
  };

  async function handleEditSubmit() {
    const errors = generalFunction.validateData(rowData, fields);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    generalFunction.editSupplier(rowData);
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...rowData };
      return newData;
    });
    setEditOpen(false);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setRowData({ supplier_name: '', location: '', key_product: '',  sustainability_score: '', key_contact: '', key_email: '', country: '', state: '', city: '' });
    setRowIndex(-1);
  };

  const openDelete = (row) => {
    setDeleteRowData(row);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setDeleteRowData({});
    setIsDeleteOpen(false);
  };

  const handleDelete = async () => {
    const id = deleteRowData.id;
    try {
      await generalFunction.deleteRecord({ table: 'supplier_management', match: { id } });
      setTableData((prevData) => prevData.filter(deleteRowData => deleteRowData.id !== id));
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setIsErrorOpen(true);
    }
    closeDelete();
  };

  const closeError = () => {
    setIsErrorOpen(false);
  };

  const handleOpenImport = () => {
    setIsImportOpen(true);
  };

  const onImportClose = () => {
    setIsImportOpen(false);
  };

  const handleAddImport = async (rowData) => {
    const errors = generalFunction.validateData(rowData, fields);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    try {
      const id = await generalFunction.createSupplier(rowData);
      const newRowWithId = { ...rowData, id };
      setTableData((prevData) => [...prevData, newRowWithId]);
      handleClosePopup();
    } catch (error) {
      console.error('Error adding row:', error);
    }
  };

  const onImportSubmit = async (data) => {
    console.log(data);
    const defaultValues = {
      supplier_name: ' ',
      location: ' ',
      key_product: ' ',
      sustainability_score: ' ',
      key_contact: ' ',
      key_email: ' ',
      country: ' ',
      state: ' ',
      city: ' '
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

  const actions = [
    <Button
    label={<IconEdit/>}
    handleFunction={openEdit}
    actionButton={true}
    />,

    <Button
    label={<IconDelete/>}
    handleFunction={openDelete}
    actionButton={true}
    />
  ];

  return (
    <div className="flex flex-col justify-center overflow-hidden mt-20 p-6">
      <h1 className="text-xl text-center mb-10">Supplier Management</h1>
      <Table
        fields={fields}
        tableData={tableData}
        hasLink={true}
        pageLink={``}
        hasActions={true}
        actions={actions}
        rowsPerPage={5}
        enablePagination={tableData.length > 5}
        searchableColumn="supplier_name"
        importButton={true}
        handleOpenImport={handleOpenImport}
        importType="Supplier"
      />
      <div className="mb-6 mt-10 flex items-center justify-center">
        <Button
          label="Add Supplier"
          handleFunction={handleOpenPopup}
        />
      </div>
      {isPopupOpen && (
        <PopUp
          title='Add Supplier'
          fields={fields}
          newRowData={newRowData}
          handleInputChange={handleInputChange}
          handleClosePopup={handleClosePopup}
          handleSave={handleAddRow}
          validationErrors={validationErrors}
        />
      )}
      {isEditOpen && (
        <PopUp
          title='Edit Supplier'
          fields={fields}
          newRowData={rowData}
          handleInputChange={handleEditInput}
          handleClosePopup={handleCloseEdit}
          handleSave={handleEditSubmit}
          button2Label='Edit'
          validationErrors={validationErrors}
        />
        )}
        {isDeleteOpen && (
          <DeletePopUp
            closeDelete={closeDelete}
            handleFunction={handleDelete}
          />
        )}
        {isErrorOpen && (
          <ErrorPopUp
            closePopUp={closeError}
            errorMessage={errorMessage}
          />
        )}
        <ReactSpreadsheetImport
          isOpen={isImportOpen}
          onClose={onImportClose}
          onSubmit={onImportSubmit}
          fields={importFields}
        />
    </div>
  );
}
