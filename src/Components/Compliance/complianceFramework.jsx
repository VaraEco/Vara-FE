import React, { useState, useEffect } from 'react';
import { generalFunction } from '../../assets/Config/generalFunction'
import  Button from '../Common/CommonComponents/Button'
import  Table from '../Common/CommonComponents/Table'
import PopUp from '../Common/CommonComponents/PopUp'

const HTMLContent = ({ html }) => (
  <span dangerouslySetInnerHTML={{ __html: html }} />
);

export default function Compliance() {
  const [tableData, setTableData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({ name: '', date_published: '', document: '', chatbot_link: '' });

  const compliance_fields = [
    { id: 'name', label: 'Compliance Name', type: 'text' },
    { id: 'date_published', label: 'Date published', type: 'date' },
    { id: 'document', label: 'Document', type: 'text' },
    { id: 'chatbot_link', label: 'Chatbot Link', type: 'text' },
  ];

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await generalFunction.fetchCompliances();
        setTableData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const newRow = { 
      name: 'The Greenhouse Gas Protocol', 
      date_published: '05/20/2023', 
      document: '<a href="https://ghgprotocol.org/sites/default/files/standards/ghg-protocol-revised.pdf" target="_blank" rel="noopener noreferrer">PDF</a>', 
      chatbot_link: '<a href="/chatbot" target="_blank" rel="noopener noreferrer">Link</a>' };
    setTableData(prevData => formatData([...prevData, newRow]));
  }, [])

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    generalFunction.createCompliance(newRowData);
    setNewRowData({ name: '', date_published: '', document: '', chatbot_link: '' });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRowData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleAddRow = () => {
    const formattedRow = formatData([newRowData])[0];
    setTableData((prevData) => [...prevData, formattedRow]);
    handleClosePopup();
  };

  const formatData = (data) => {
    return data.map(row => ({
      ...row,
      document: <HTMLContent html={row.document} />,
      chatbot_link: <HTMLContent html={row.chatbot_link} />
    }));
  };

  return (
    <div className="flex flex-col justify-center overflow-hidden mt-20 p-6">
      <h1 className="text-xl text-center mb-10">Compliance Framework</h1>
      <Table
        fields={compliance_fields}
        tableData={tableData}
      />
      
      {isPopupOpen && (
        <PopUp
          fields={compliance_fields}
          newRowData={newRowData}
          handleInputChange={handleInputChange}
          handleClosePopup={handleClosePopup}
          handleSave={handleAddRow}
        />
      )}
    </div>

  );
}
