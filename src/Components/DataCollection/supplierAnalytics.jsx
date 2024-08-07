// importing react features to use states, effects, and links
import React, { useState, useEffect } from 'react';
import { generalFunction } from '../../assets/Config/generalFunction';
import Button from '../Common/CommonComponents/Button';
import Table from '../Common/CommonComponents/Table';
import PopUp from '../Common/CommonComponents/PopUp';
import EmailForm from '../Common/CommonComponents/EmailForm';
import Inbox from '../Common/CommonComponents/Inbox';
import DeletePopUp from '../Common/CommonComponents/DeletePopUp';
import IconDelete from '../Common/CommonComponents/IconDelete.jsx';
import IconEdit from '../Common/CommonComponents/IconEdit.jsx';

export default function SupplierAnalytics() {
    const [supplierData, setSupplierData] = useState({});
    const [productData, setProductData] = useState([]);
    const [isProdBtnOpen, setProdBtnOpen] = useState(false);
    const [newProd, setNewProd] = useState({ product_name: '', serial_number: '', last_exported: '', volume: '', supplier_id: '' });
    const [isEditProdOpen, setEditProdOpen] = useState(false);
    const [prodRowData, setProdRowData] = useState({ id: '', product_name: '', serial_number: '', last_exported: '', volume: '' });
    const [prodRowIndex, setProdRowIndex] = useState(-1);
    const [certificateData, setCertificateData] = useState([]);
    const [isCertBtnOpen, setCertBtnOpen] = useState(false);
    const [newCert, setNewCert] = useState({ certificate_name: '', status: '', expiration: '',  last_audited: '', link: '', notes: '', supplier_id: '' });
    const [isEditCertOpen, setEditCertOpen] = useState(false);
    const [certRowData, setCertRowData] = useState({ id: '', certificate_name: '', status: '', expiration: '', last_audited: '', link: '', notes: '' });
    const [certRowIndex, setCertRowIndex] = useState(-1);
    const [validationErrors, setValidationErrors] = useState({});
    const [emailData, setEmailData] = useState([]);
    const [isEmailBtnOpen, setEmailBtnOpen] = useState(false);
    const [isRequestBtnOpen, setRequestBtnOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteRowData, setDeleteRowData] = useState({});
    const [tableName, setTableName] = useState('');
    const [isEditEmailOpen, setEditEmailOpen] = useState(false);
    const [emailRowData, setEmailRowData] = useState({ id: '', receiver: '', sender: '', date_sent: ''});
    const [emailRowIndex, setEmailRowIndex] = useState(-1);

    const url = window.location.href;
    const parts = url.split('/');
    let supplier = parts[parts.length - 1];
    supplier = supplier.replace(/%20/g, ' ');

    const supFields = [
        { id: 'supplier_name', label: 'Supplier Name', type: 'text' },
        { id: 'key_product', label: 'Key Product', type: 'text' },
        { id: 'sustainability_score', label: 'Sustainability Score', type: 'text' },
        { id: 'key_contact', label: 'Key Contact', type: 'text' },
        { id: 'key_email', label: 'Key Email', type: 'text' },
        { id: 'location', label: 'Location', type: 'text' }
    ];

    const certFields = [
        { id: 'certificate_name', label: 'Certificate Name', type: 'text' },
        { id: 'status', label: 'Status', type: 'text' },
        { id: 'expiration', label: 'Expiration', type: 'date' },
        { id: 'last_audited', label: 'Last Audited', type: 'date' },
        { id: 'link', label: 'Link', type: 'text' },
        { id: 'notes', label: 'Notes', type: 'text' }
    ];

    const prodFields = [
        { id: 'product_name', label: 'Product Name', type: 'text' },
        { id: 'serial_number', label: 'Serial Number', type: 'number' },
        { id: 'last_exported', label: 'Last Exported', type: 'date' },
        { id: 'volume', label: 'Volume', type: 'number' }
    ];

    const emailFields = [
        { id: 'receiver', label: 'Receiver', type: 'text' },
        { id: 'sender', label: 'Sender', type: 'text' },
        { id: 'date_sent', label: 'Date Sent', type: 'date' },
    ]

    async function fetchSupplierData() {
        try {
            const data = await generalFunction.fetchSupplierAnalytics(supplier);
            if (data && data.length > 0) {
                setSupplierData(data[0]);
            }
        } catch (error) {
            console.log('Error fetching supplier analytics:', error);
        }
    }

    async function fetchProductData() {
        try {
            const data = await generalFunction.fetchSupplierProducts(supplierData);
            if (data && data.length > 0) {
                setProductData(data);
            }
        } catch (error) {
            console.log('Error fetching supplier products:', error);
        }
    }

    async function fetchCertificateData() {
        try {
            const data = await generalFunction.fetchSupplierCertificates(supplierData);
            if (data && data.length > 0) {
                setCertificateData(data);
            }
        } catch (error) {
            console.log('Error fetching supplier certificates:', error);
        }
    }

    async function fetchEmailData() {
        try {
            const data = await generalFunction.fetchSupplierEmails(supplierData);
            if (data && data.length > 0){
                setEmailData(data);
                return data;
            }
        } catch (error) {
            console.log('Error fetching supplier emails:', error);
        }
    }

    useEffect(() => {
        fetchSupplierData()
    }, [])

    useEffect(() => {
        if (supplierData.id != null) {
            fetchProductData()
            fetchCertificateData()
            fetchEmailData()
        }
    }, [supplierData.id])

    const openAddCert = () => {
        setValidationErrors({});
        setCertBtnOpen(true);
    };

    const handleInputCert = (e) => {
        const { name, value } = e.target;
        setNewCert((prevData) => ({
        ...prevData,
        [name]: value,
        }));
    };

    const handleCloseCertBtn = () => {
        setCertBtnOpen(false);
        setNewCert({ certificate_name: '', status: '', expiration: '',  last_audited: '', link: '', notes: '', supplier_id: '' });
    };

    const handleAddCert = async () => {
        const errors = generalFunction.validateData(newCert, certFields);
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          return;
        }
        const id = await generalFunction.createSupplierCertificate(newCert, supplierData);
        const newRowWithId = { ...newCert, id };
        setCertificateData((prevData) => [...prevData, newRowWithId]);
        handleCloseCertBtn();
    };

    const openEditCert = (row, index, realIndex) => {
        setValidationErrors({});
        setCertRowData(row);
        setCertRowIndex(realIndex);
        setEditCertOpen(true);
    }

    const handleEditCertInput = (e) => {
        const { name, value } = e.target;
        setCertRowData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    async function handleEditCertSubmit() {
        const errors = generalFunction.validateData(certRowData, certFields);
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          return;
        }
        generalFunction.editSupplierCertificate(certRowData);
        setCertificateData((prevData) => {
            const newData = [...prevData];
            newData[certRowIndex] = { ...certRowData };
            return newData;
        });
        setEditCertOpen(false);
    }

    const handleCloseEditCert = () => {
        setEditCertOpen(false);
        setCertRowData({ certificate_name: '', status: '', expiration: '',  last_audited: '', link: '', notes: '' });
        setCertRowIndex(-1);
    };

    const openAddProd = () => {
        setValidationErrors({});
        setProdBtnOpen(true);
    };

    const handleInputProd = (e) => {
        const { name, value } = e.target;
        setNewProd((prevData) => ({
        ...prevData,
        [name]: value,
        }));
    };

    const handleCloseProdBtn = () => {
        setProdBtnOpen(false);
        setNewProd({ product_name: '', serial_number: '', last_exported: '', volume: '', supplier_id: '' });
    };

    const handleAddProd = async () => {
        const errors = generalFunction.validateData(newProd, prodFields);
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          return;
        }
        const id = await generalFunction.createSupplierProduct(newProd, supplierData);
        const newRowWithId = { ...newProd, id };
        setProductData((prevData) => [...prevData, newRowWithId]);
        handleCloseProdBtn();
    };

    const openEditProd = (row, index, realIndex) => {
        setValidationErrors({});
        setProdRowData(row);
        setProdRowIndex(realIndex);
        setEditProdOpen(true);
    }

    const handleEditProdInput = (e) => {
        const { name, value } = e.target;
        setProdRowData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    async function handleEditProdSubmit() {
        const errors = generalFunction.validateData(prodRowData, prodFields);
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          return;
        }
        generalFunction.editSupplierProduct(prodRowData);
        setProductData((prevData) => {
            const newData = [...prevData];
            newData[prodRowIndex] = { ...prodRowData };
            return newData;
        });
        setEditProdOpen(false);
    }

    const handleCloseEditProd = () => {
        setEditProdOpen(false);
        setProdRowData({ product_name: '', serial_number: '', last_exported: '', volume: '' });
        setProdRowIndex(-1);
    };

    const openEmailBtn = () => {
        setEmailBtnOpen(true);
    };

    const closeEmailBtn = () => {
        setEmailBtnOpen(false);
    };

    const openRequestBtn = () => {
        setRequestBtnOpen(true);
    };

    const closeRequestBtn = () => {
        setRequestBtnOpen(false);
    };

    const emailSent = () => {
        fetchEmailData();
    };

    const openDelete = (row) => {
        if ('product_name' in row) {
            setTableName('supplier_products');
        } else if ('certificate_name' in row) {
            setTableName('supplier_certificates');
        } else {
            setTableName('supplier_emails');
        }
        setDeleteRowData(row);
        setIsDeleteOpen(true);
    };
    
    const closeDelete = () => {
        setTableName('');
        setDeleteRowData({});
        setIsDeleteOpen(false);
    };
    
    const handleDelete = async () => {
        const id = deleteRowData.id;
        try {
          await generalFunction.deleteRecord({ table: tableName, match: { id } });
          if (tableName == 'supplier_products') {
            setProductData((prevData) => prevData.filter(deleteRowData => deleteRowData.id !== id));
          } else if (tableName == 'supplier_certificates') {
            setCertificateData((prevData) => prevData.filter(deleteRowData => deleteRowData.id !== id));
          } else {
            setEmailData((prevData) => prevData.filter(deleteRowData => deleteRowData.id !== id));
          }
        } catch (error) {
          console.error('Error deleting:', error);
        }
        closeDelete();
    };

    const openEditEmail = (row, index, realIndex) => {
        setValidationErrors({});
        setEmailRowData(row);
        setEmailRowIndex(realIndex);
        setEditEmailOpen(true);
    }

    const handleEditEmail = (e) => {
        const { name, value } = e.target;
        setEmailRowData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    async function handleEditEmailSubmit() {
        const errors = generalFunction.validateData(emailRowData, emailFields);
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          return;
        }
        generalFunction.editSupplierEmail(emailRowData);
        setEmailData((prevData) => {
            const newData = [...prevData];
            newData[emailRowIndex] = { ...emailRowData };
            return newData;
        });
        setEditEmailOpen(false);
    }

    const handleCloseEditEmail = () => {
        setEditEmailOpen(false);
        setEmailRowData({ receiver: '', sender: '', date_sent: '' });
        setEmailRowIndex(-1);
    };

    const certActions = [
        <Button
        label={<IconEdit/>}
        handleFunction={openEditCert}
        actionButton={true}
        />,

        <Button
        label={<IconDelete/>}
        handleFunction={openDelete}
        actionButton={true}
        />
    ];

    const prodActions = [
        <Button
        label={<IconEdit/>}
        handleFunction={openEditProd}
        actionButton={true}
        />,

        <Button
        label={<IconDelete/>}
        handleFunction={openDelete}
        actionButton={true}
        />
    ];

    const emailActions = [
        <Button
        label={<IconEdit/>}
        handleFunction={openEditEmail}
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
        <div className="flex justify-center">
            <div className="w-[90%] margin-[auto] flex flex-row justify-between mb-8">
                <h1 className="text-3xl font-medium">{supplierData.supplier_name}</h1>
                <Button
                    label="Request Info"
                    handleFunction={openRequestBtn}
                />
            </div>
        </div>
        {isRequestBtnOpen && (
            <Inbox
                title="Inbox"
                fields={emailFields}
                tableData={emailData}
                hasActions={true}
                actions={emailActions}
                handleCancel={closeRequestBtn}
                actionButtonLabel="Send Email"
                actionButtonFunction={openEmailBtn}
            />
        )}
        {isEmailBtnOpen && (
            <EmailForm
                handleCancel={closeEmailBtn}
                supplierEmail={true}
                supplierData={supplierData}
                onSent={emailSent}
            />
        )}
        {isEditEmailOpen && (
          <PopUp
            title='Edit Email'
            fields={emailFields}
            newRowData={emailRowData}
            handleInputChange={handleEditEmail}
            handleClosePopup={handleCloseEditEmail}
            handleSave={handleEditEmailSubmit}
            button2Label='Edit'
            validationErrors={validationErrors}
          />
        )}
        <Table
            fields={supFields}
            tableData={[supplierData]}
        />
        <h1 className="text-xl text-left m-10 ml-16 mb-4">Products</h1>
        <Table
            fields={prodFields}
            tableData={productData}
            hasActions={true}
            actions={prodActions}
            rowsPerPage={5}
            enablePagination={productData.length > 5}
            searchableColumn="product_name"
        />
        <div className="mb-6 mt-10 flex items-center justify-center">
            <Button
                label="Add Product"
                handleFunction={openAddProd}
            />
        </div>
        {isProdBtnOpen && (
          <PopUp
            title='Add Product'
            fields={prodFields}
            newRowData={newProd}
            handleInputChange={handleInputProd}
            handleClosePopup={handleCloseProdBtn}
            handleSave={handleAddProd}
            validationErrors={validationErrors}
          />
        )}
        {isEditProdOpen && (
          <PopUp
            title='Edit Product'
            fields={prodFields}
            newRowData={prodRowData}
            handleInputChange={handleEditProdInput}
            handleClosePopup={handleCloseEditProd}
            handleSave={handleEditProdSubmit}
            button2Label='Edit'
            validationErrors={validationErrors}
          />
        )}
        <h1 className="text-xl text-left m-10 ml-16 mb-4">Certificates</h1>
        <Table
            fields={certFields}
            tableData={certificateData}
            hasActions={true}
            actions={certActions}
            rowsPerPage={5}
            enablePagination={certificateData.length > 5}
            searchableColumn="certificate_name"
        />
        <div className="mb-6 mt-10 flex items-center justify-center">
          <Button
            label="Add Certificate"
            handleFunction={openAddCert}
          />
        </div>
        {isCertBtnOpen && (
          <PopUp
            title='Add Certificate'
            fields={certFields}
            newRowData={newCert}
            handleInputChange={handleInputCert}
            handleClosePopup={handleCloseCertBtn}
            handleSave={handleAddCert}
            validationErrors={validationErrors}
          />
        )}
        {isEditCertOpen && (
          <PopUp
            title='Edit Certificate'
            fields={certFields}
            newRowData={certRowData}
            handleInputChange={handleEditCertInput}
            handleClosePopup={handleCloseEditCert}
            handleSave={handleEditCertSubmit}
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
      </div>
    );
}