import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../Common/AppContext";
import Button from "../Common/CommonComponents/Button";
import "./manage-users.css";
import { generalFunction } from "../../assets/Config/generalFunction";
import Popup from "../Common/CommonComponents/PopUp";
import axios from "axios";
import { mainConfig } from "../../assets/Config/appConfig";

export default function ManageUsers() {
  const { theme, bgColors, appConfig } = useContext(ThemeContext);
  const [Users, setUsers] = useState([]);
  const [AllUsers, setAllUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    role: "",
    user_id: "",
    status: false,
    access_till: "",
    assigned_by: "",
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userAccessPopup, setUserAccessPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [facilities, setFacilities] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [selectedParameter, setSelectedParameter] = useState("");
  const [userAccessData, setUserAccessData] = useState([]);
  const [userId, setUserId] = useState("")
  const [userAccessId, setUserAccessId] = useState("")
  const [loading, setLoading] = useState(false);
  const [saveAccess, setSaveAccess] = useState(true)
  const [error, setError] = useState("");
  const [dataCollectionPoints, setDataCollectionPoints] = useState([]);
  const [selectedDataCollectionPoint, setSelectedDataCollectionPoint] =
    useState("");
  const [buttonColor, setButtonColor] = useState({}); // State to control button color

  const [selectMethod, setSelectMethod] = useState("");

  const roles = ["OWNER", "ADMIN", "TEAM MANAGER", "FIELD MANAGER"];

  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchAllUsers();
    fetchParameters();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");
      const data = await generalFunction.fetchUserPermissions();
      setUsers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleMethodChange(e) {
    const method = e.target.value;
    setSelectMethod(method);
  }

  async function fetchDataCollectionPoints(processId) {
    try {
      setError("");
      const data = await generalFunction.fetchDataCollectionPoints(
        selectedParameter,
        processId
      );
      setDataCollectionPoints(data);
    } catch (error) {
      setError(error.message);
    }
  }

  async function fetchAllUsers() {
    try {
      setLoading(true);
      setError("");
      const data = await generalFunction.fetchAllUsers();
      setAllUsers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFacilities() {
    try {
      setError("");
      const data = await generalFunction.fetchFacilities();
      setFacilities(data);
    } catch (error) {
      setError(error.message);
    }
  }

  async function fetchProcesses(facilityId) {
    try {
      setError("");
      const data = await generalFunction.fetchProcesses(facilityId);
      setProcesses(data);
    } catch (error) {
      setError(error.message);
    }
  }

  async function fetchParameters() {
    try {
      setError("");
      const data = await generalFunction.fetchParameters();
      setParameters(data);
    } catch (error) {
      setError(error.message);
    }
  }

  const handleInputChange = (e, userSetter) => {
    const { name, value } = e.target;
    userSetter((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddUser = async () => {
    try {
      setError("");
      await generalFunction.addUserPermission(newUser);
      await fetchUsers();
      resetNewUser();
      setIsPopupOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddUserAccess = async () => {
    if (
      !selectedDataCollectionPoint ||
      !selectedProcess ||
      !selectedUser.user_id
    ) {
      setError("Please select all required fields.");
      return;
    }

    try {
      setError("");
      await generalFunction.createTableRow("user_data_access", {
        user_id: selectedUser.user_id,
        data_collection_id: selectedDataCollectionPoint,
        process_id: selectedProcess,
      });
      
      fetchUserAccessData(selectedUser);
      setUserAccessPopup(false);
      
      handleButtonClick(selectedUser,selectedDataCollectionPoint, selectedProcess, selectedParameter)
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchUserAccessData = async (user) => {
    try {
      setError("");
      const data = await generalFunction.fetchUserAccessData(user.user_id);
      setUserAccessData(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCellClick = (row) => {
    setSelectedUser(row);
    fetchUserAccessData(row);
    setUserAccessPopup(true);
    fetchFacilities();
  };

  const resetNewUser = () => {
    setNewUser({
      role: "",
      user_id: "",
      status: false,
      access_till: "",
      assigned_by: "",
    });
  };

  const handleSaveUserDetails = async (user) => {
    try {
      setError("");
      await generalFunction.updateUserPermission(user.id, {
        role: user.role,
        status: user.status,
        access_till: user.access_till,
      });

      const isLocal = window.location.hostname === "localhost";
      if (!isLocal) {
        const jwtToken = await generalFunction.generateAndSetJWT(
          localStorage.getItem("varaUserId")
        );
      }

      setButtonColor((prevState) => ({ ...prevState, [user.id]: "success" }));
      setTimeout(
        () => setButtonColor((prevState) => ({ ...prevState, [user.id]: "" })),
        2000
      );
      fetchUsers();
    } catch (error) {
      setError(error.message);
      setButtonColor((prevState) => ({ ...prevState, [user.id]: "error" }));
      setTimeout(
        () => setButtonColor((prevState) => ({ ...prevState, [user.id]: "" })),
        2000
      );
    }
  };

  const handleEditUser = (index, field, value) => {
    setUsers((prevUsers) => {
      const updatedUsers = [...prevUsers];
      updatedUsers[index] = { ...updatedUsers[index], [field]: value };
      return updatedUsers;
    });
  };

  const handleButtonClick = async (user, selectedDataCollectionPoint, selectedProcess ,selectedParameter) => {
      
    setTimeout(() => {
            
      axios
      .post(`${mainConfig.WHATSAPP_BOT_API_BASE_URL}/api/setup_whatsapp`, {
        phone_number: phoneNumber,
        data_collection_id: selectedDataCollectionPoint,
        process_id: selectedProcess,
        para_id: selectedParameter
      })
      .then(function (res) {
        alert(res.data.message);
        const whatsappUrl = `${mainConfig.TWILIO_WHATSAPP}?text=${encodeURIComponent(
          mainConfig.WHATSAPP_JOINING_CODE
        )}`;
        window.open(whatsappUrl, "_blank");
      })
      .catch(function (err) {
        console.log(err);
      });
    }, 2000);
  }

  const handleDeleteRow = async(det)=> {
    await generalFunction.removeTableRow("user_data_access", {
        user_id: det.user_id,
        data_collection_id: det.data_collection_id,
        process_id: det.process_id,
        id: det.user_data_access_id
      });

      fetchUserAccessData(selectedUser);
  }

  const handleEditRow = (access)=> {
  console.log(access);
  setUserAccessId(access.user_data_access_id)
  setUserId(access.user_id)
  setSelectedProcess(access.process_id);
  setSelectedDataCollectionPoint(access.data_collection_id);

  setSelectedParameter(access.parameter_id);
  setSelectedFacility(access.facility_id);

  setSaveAccess(false)

  }

  const handleSaveEditedData = async ()=> {
    try {
      const updatedData = {
      id: userAccessId,  
      user_id: userId,
      process_id: selectedProcess,
      data_collection_id: selectedDataCollectionPoint,
      }

      console.log(updatedData);
      

      await generalFunction.updateUserAccessData(userAccessId, updatedData);
      fetchUserAccessData(selectedUser);
      setUserAccessPopup(false)

    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="relative flex flex-col justify-center overflow-hidden mt-20">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-xl shadow-black-600/40 lg:max-w-4xl">
        <h1 className="text-2xl text-center mb-4">User Management</h1>
        <div className="container mx-auto">
          {error && <p className="text-red-500">{error}</p>}
          <table className="mt-4 w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">User Name</th>
                <th className="border border-gray-300 px-4 py-2">Role</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">
                  Access Till
                </th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Users.map((user, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.user_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleEditUser(index, "role", e.target.value)
                      }
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={user.status}
                      onChange={(e) =>
                        handleEditUser(index, "status", e.target.value)
                      }
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="date"
                      value={
                        user.access_till
                          ? new Date(user.access_till)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleEditUser(index, "access_till", e.target.value)
                      }
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2 flex justify-center gap-2">
                    <Button
                      label="Save"
                      handleFunction={() => handleSaveUserDetails(user)}
                      className={`rounded ${
                        buttonColor[user.id] === "success"
                          ? "bg-green-500"
                          : buttonColor[user.id] === "error"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      } text-white hover:bg-green-600 transition duration-300`}
                    />
                    <Button
                      label="Assign User"
                      handleFunction={() => handleCellClick(user)}
                      className={`rounded ${
                        buttonColor[user.id] === "success"
                          ? "bg-green-500"
                          : buttonColor[user.id] === "error"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      } text-white hover:bg-green-600 transition duration-300`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* <Button
                        label="Add User"
                        handleFunction={() => setIsPopupOpen(true)}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    /> */}
        </div>
      </div>

      {isPopupOpen && (
        <Popup
          title="Add New User"
          fields={[
            {
              id: "user_id",
              label: "User",
              type: "select",
              options: AllUsers.filter((user) => user.name).map((user) => ({
                value: user.id,
                label: `${user.name}`,
              })),
            },
            {
              id: "role",
              label: "Role",
              type: "select",
              options: roles.map((role) => ({ value: role, label: role })),
            },
            {
              id: "status",
              label: "Status",
              type: "select",
              options: [
                { value: false, label: "Inactive" },
                { value: true, label: "Active" },
              ],
            },
            { id: "access_till", label: "Access Till", type: "date" },
            {
              id: "assigned_by",
              label: "Assigned by",
              type: "select",
              options: AllUsers.filter((user) => user.name).map((user) => ({
                value: user.id,
                label: `${user.name}`,
              })),
            },
          ]}
          newRowData={newUser}
          handleInputChange={(e) => handleInputChange(e, setNewUser)}
          handleClosePopup={() => setIsPopupOpen(false)}
          handleSave={handleAddUser}
        />
      )}

      {userAccessPopup && (
        <div  className="popup">
          <div className="popup-content max-h-[95vh] overflow-y-auto">
            <h2 className="popup-title">{selectedUser.user_name}</h2>
            <p>Role - {selectedUser.role}</p>
            <table className="mt-4 w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Facility</th>
                  <th className="border border-gray-300 px-4 py-2">Process</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Parameter
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Data Collection Point
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userAccessData.map((access, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      {access.facility_name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {access.process_name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {access.parameter_name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {access.data_collection_point_name}
                    </td>
                    
                      <td className="flex justify-center gap-2">
                        <Button handleFunction={()=> handleEditRow(access)} label="Edit" />
                        <Button handleFunction={()=> handleDeleteRow(access)} label="Delete" />
                      </td>
                   
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="form-group">
              <label htmlFor="parameter">Parameter</label>
              <select
                id="parameter"
                name="parameter"
                value={selectedParameter}
                onChange={(e) => {
                  setSelectedParameter(e.target.value);
                }}
              >
                <option value="">Select a parameter</option>
                {parameters.map((parameter) => (
                  <option key={parameter.para_id} value={parameter.para_id}>
                    {parameter.para_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="facility">Facility</label>
              <select
                id="facility"
                name="facility"
                value={selectedFacility}
                onChange={(e) => {
                  setSelectedFacility(e.target.value);
                  fetchProcesses(e.target.value);
                }}
              >
                <option value="">Select a facility</option>
                {facilities.map((facility) => (
                  <option
                    key={facility.facility_id}
                    value={facility.facility_id}
                  >
                    {facility.facility_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="process">Process</label>
              <select
                id="process"
                name="process"
                value={selectedProcess}
                onChange={(e) => {
                  setSelectedProcess(e.target.value);
                  fetchDataCollectionPoints(e.target.value); // Fetch data collection points based on selected parameter
                }}
              >
                <option value="">Select a process</option>
                {processes.map((process) => (
                  <option key={process.process_id} value={process.process_id}>
                    {process.process_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dataCollectionPoint">Data Collection Point</label>
              <select
                id="dataCollectionPoint"
                name="dataCollectionPoint"
                value={selectedDataCollectionPoint}
                onChange={(e) => setSelectedDataCollectionPoint(e.target.value)}
              >
                <option value="">Select a data collection point</option>
                {dataCollectionPoints.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="whatsappbotselect">Method</label>
              <select onChange={handleMethodChange}>
                <option value="">Select Method</option>
                <option value="in-app">Manual</option>
                <option value="whatsapp">Whatsapp</option>
              </select>
            </div>

            {
              selectMethod === "whatsapp" && (
                <div
                  className="form-group"
                >
                  <input
                    type="number"
                    placeholder="Enter Your Number"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="placeholder-gray-700"
                  />
                  {/* <Button
                    label="Submit"
                    handleFunction={handleButtonClick}
                    className="p-[7px] w-28 rounded-lg text-white bg-gradient-to-br from-[#00EE66] to-[#0475E6]"
                  /> */}
                </div>
              )}

            <div className="flex gap-4">
            {saveAccess && <Button
              label="Add Access"
              handleFunction={handleAddUserAccess}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              
            />}
            {!saveAccess && <Button
              label="Save Edited Data"
              handleFunction={handleSaveEditedData}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              
            />}
            <Button
              label="Close"
              handleFunction={() => setUserAccessPopup(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
