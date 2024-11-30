import React, { useState, useEffect } from 'react';
import { generalFunction } from '../../assets/Config/generalFunction'
import  Button from '../Common/CommonComponents/Button'
import  Table from '../Common/CommonComponents/Table'
import PopUp from '../Common/CommonComponents/PopUp'
import IconEdit from '../Common/CommonComponents/IconEdit';
import IconDelete from '../Common/CommonComponents/IconDelete';
import { mainConfig } from "../../assets/Config/appConfig";
import axios from 'axios';

export default function ProjectManagement() {
  const fields = [
    { id: 'project_id', label: 'Project ID', type: 'number', link: true, showInPopup: false},
    { id: 'project', label: 'Project', type: 'text', showInPopup: true},
    { id: 'status', label: 'Status', type: 'text', showInPopup: true},
    { id: 'due_date', label: 'Due Date', type: 'date', showInPopup: true},
    { id: 'lead', label: 'Lead', type: 'text', showInPopup: true},
    {id:'reminder', label: 'Opt-in For Reminder', type:'checkbox', showInPopup:false, not_required: true}
  ];

  const initial_fields = { task_id: '', project: '', status: '', due_date: '', lead: '', reminder: false }

  const [AllProjects, setAllProjects] = useState([]);
  const [newProject, setProject] = useState({
    project_id: '',
    project: '',
    status: '',
    due_date: '',
    lead: '',
    reminder: false
});
  const [editProject, setEditProject] = useState({
    project_id: '',
    project: '',
    status: '',
    due_date: '',
    lead: '',
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [projectTracker, setProjectTracker] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [isEditOpen, setEditOpen] = useState(false);
  const [rowIndex, setRowIndex] = useState(-1);
  const [allUers, setAllUsers] = useState([])
  const ownerDetails = JSON.parse(localStorage.getItem("adminDetails"));
  const [mail, setUserMail] = useState('')

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await generalFunction.getTableData(`project_management`);
        if (data) {
          setAllProjects(data);
          setProjectTracker(data.length + 1)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    getData();
  }, [])

  useEffect(() => {
    const getAdmins = async () => {
        
        let request = generalFunction.createUrl(`api/entities/${ownerDetails?.ownerEntityId}/admins?userId=${generalFunction.getUserId()}`);
        const { data } = await axios.get(
            request.url,
            {
                headers: {...request.headers, apiKey: ownerDetails?.apiKey},
            }
        );
        console.log('data-data',data.data);
        
        let filteredData = data.data.filter((user) => !mainConfig.ALLOWED_ADMIN.includes(user.emails[0]) && user.isActive);
        setAllUsers(filteredData)
       
    };
    getAdmins();
}, []);

  const handleOpenPopup = () => {
    setValidationErrors({});
    setIsPopupOpen(true);
  };

  const getProjectNumber = async () => {
    const data = await generalFunction.getTableData(`project_management`);
    setProjectTracker(data.length + 1)
  }

  const handleClosePopup = async () => {
    console.log('new-project', newProject);
    
    setIsPopupOpen(false);
    getProjectNumber();
    const newProject_ = {
        project_id: projectTracker,
        project: newProject.project,
        status: newProject.status,
        lead: newProject.lead,
        due_date: newProject.due_date,
        reminder: newProject.reminder,
        company_id: await generalFunction.getCompanyId()
    }
    generalFunction.createTableRow(`project_management`, newProject_);
    setProject({
        project_id: '',
        project: '',
        status: '',
        due_date: '',
        lead: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;    
    setProject((prevData) => ({
      ...prevData,
      project_id: projectTracker,
      [name]: value,
    }));    

    if(name === "lead"){
      const selectedUser = allUers.find(user=> user.name === value)
      console.log(selectedUser.name, selectedUser.emails[0]);
      setUserMail(selectedUser.emails[0])
    }
  };

  const handleAddRow = () => {
    console.log('save button clicked');
    
    const errors = generalFunction.validateData(newProject, fields);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    console.log('save button clicked----------->2');
    console.log(newProject);
    

    const newProjectWithReminder = { ...newProject, reminder: false };

    setAllProjects((prevData) => [...prevData, newProjectWithReminder]);
    // sendReminder()
    handleClosePopup();
  };

  async function handleReminderToggle(e, project) {
    const updatedReminder = e.target.checked;
  
    const selectedUser = allUers.find(user=> user.name == project.lead)

    console.log(project, 'sel00000000000000000000');
    
    try {
      // Send updated reminder status to backend
      await axios.post(mainConfig.REMINDER_BASE_URL, {
        email: selectedUser.emails[0], // Assuming `lead` contains the email
        taskName: project.project,
        dueDate: project.due_date,
        reminder: updatedReminder,
      });

      await generalFunction.editProject({
        ...project,
        reminder: updatedReminder,
      });
  
      // Update the local state to reflect the change
      setAllProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.project_id === project.project_id
            ? { ...p, reminder: updatedReminder }
            : p
        )
      );
    } catch (error) {
      console.error('Error updating reminder status:', error);
    }
  }

  function sendReminder(){
    console.log('mail',mail, newProject.project, newProject.due_date);
    
    axios.post(mainConfig.REMINDER_BASE_URL , 
      {
        email: mail,
        taskName: newProject.project,
        dueDate: newProject.due_date,
        reminder: newProject.reminder
      }
    )
    .then(function(res){
      console.log(res);
      console.log('reminder sent...');
      
    })
    .catch(function(error){
      console.log(error);
    })
  }

  const popupFields = fields.filter(field => field.showInPopup).map(field => {
    if (field.id === 'lead') {
        return {
            ...field,
            type: 'select',
            options: allUers.map(user => ({
                value: user.id, // Assuming `id` is the unique identifier
                label: user.name // Assuming `name` is the display name
            }))
        };
    }
    return field;
});

// functions for edit button

const openEdit = (row, index) => {
  console.log(row);
  
  setValidationErrors({});
  setEditProject(row);
  setRowIndex(index);
  setEditOpen(true);
}

// function for deleting a projects

const handleDelete = (row)=>{
  generalFunction.deleteProject(row)
  setAllProjects(previousProject=> previousProject.filter(project=> project.id !== row.id))
}


const handleEditInput = (e) => {
  const { name, value } = e.target;
  console.log(name, value);
  
  setEditProject((prevData) => ({
      ...prevData,
      [name]: value,
  }));
};

async function handleEditSubmit() {
  console.log('edit cicked');
  
  const errors = generalFunction.validateData(editProject, fields);
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    return;
  }
  generalFunction.editProject(editProject);
  setAllProjects((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...editProject };
      return newData;
  });
  setEditOpen(false);
}

const handleCloseEdit = () => {
  setEditOpen(false);
  setEditProject(initial_fields);
  setRowIndex(-1);
};

  const actions = [
    <Button
    label={<IconEdit/>}
    handleFunction = {openEdit}
    actionButton={true}
    />,
    <Button
    label={<IconDelete/>}
    handleFunction = {handleDelete}
    actionButton={true}
    />,
  ];

  return (
    <div className="flex flex-col justify-center overflow-hidden mt-20 p-6">
      <h1 className="text-xl text-center mb-10">Compliance Management</h1>
      <Table
        fields={fields}
        tableData={AllProjects}
        hasLink={true}
        pageLink="/project_management/project_page/"
        searchableColumn="project"
        hasActions={true}
        actions={actions}
        handleReminderToggle={handleReminderToggle}
      />
      <div className="mb-6 mt-10 flex items-center justify-center">
        <Button
          label="Add Projects"
          handleFunction = {handleOpenPopup}
        />
      </div>
      {isPopupOpen && (
        <PopUp
          title='New Project'
          fields={popupFields}
          newRowData={newProject}
          handleInputChange={handleInputChange}
          handleClosePopup={handleClosePopup}
          handleSave={handleAddRow}
          validationErrors={validationErrors}
          allUers={allUers}
        />
      )}
      {isEditOpen && (
        <PopUp
          title='Edit Project'
          fields={popupFields}
          newRowData={editProject}
          handleInputChange={handleEditInput}
          handleClosePopup={handleCloseEdit}
          handleSave={handleEditSubmit}
          button2Label='Edit'
          validationErrors={validationErrors}
        />
        )}
    </div>

  );
}
