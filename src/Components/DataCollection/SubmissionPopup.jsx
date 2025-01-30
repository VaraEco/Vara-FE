import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

function SubmissionPopup({
  setDisplayPopup,
  submissionType,
  selectedSubmission,
  fetchIncidents
}) {

    console.log(selectedSubmission);
    

    const userId = localStorage.getItem('varaUserId');
     const [reportedBy, setReportedBy] = useState(selectedSubmission.reported_by)
        const [reportedDate, setReportedDate] = useState(selectedSubmission.date_of_report)
        const [incidentLocation, setIncidentLocation] = useState(selectedSubmission.location_of_incident)
        const [incidentDate, setIncidentDate] = useState(selectedSubmission.date_of_incident)
        const [incidentDescription, setIncidentDescription] = useState(selectedSubmission.incident_description)
  
    async function handleEditIncident(){
    
            const {data, error} = await supabase
            .from('incident_history')
            .update({
                reported_by:reportedBy,
                location_of_incident: incidentLocation,
                date_of_report: reportedDate,
                date_of_incident: incidentDate,
                incident_description: incidentDescription,
                submission: 'View Submission'
            })
            .eq('id', selectedSubmission.id)
            .eq('user_id', userId)
    
            if (error) {
                console.error('Error updating data:', error);
                alert('Error updating data. Please try again later.');
            } else {
                console.log('Incident updated successfully:', data);
                alert('Incident report updated successfully!');
                setDisplayPopup(false)
                fetchIncidents()
            }
        }

        async function deleteIncident(){
            const {data, error} = await supabase
            .from('incident_history')
            .delete()
            .eq('id', selectedSubmission.id)
            .eq('user_id', userId)

            if(error){
                throw error
            }
            else{
                console.log('Incident deleted successfully:', data);
                alert('Incident report deleted successfully!');
                setDisplayPopup(false)
                fetchIncidents()
            }
        }

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 99998,
        }}
      />

      <div
        style={{
          border: '2px solid #ccc',
          width: "90%",
          maxWidth: "600px",
          height: "auto",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: "99999",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
          padding: "30px",
        }}
      >
        <form>
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Incident Report
          </h1>

          <div className="space-y-4">
            {/* Form Fields */}
            <div>
              <label
                htmlFor="reportedBy"
                className="text-left block text-sm font-medium text-gray-700"
              >
                Reported By:
              </label>
              <input
              onChange={(e)=> setReportedBy(e.target.value)}
              disabled={submissionType === "Draft" ? false : true}
              value={reportedBy}
                type="text"
                id="reportedBy"
                name="reportedBy"
                className={`${submissionType !== 'Draft' ? 'bg-[#f0f0f0]' : ''} mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500`}              />
            </div>

            <div>
              <label
                htmlFor="dateOfReport"
                className="text-left block text-sm font-medium text-gray-700"
              >
                Date of Report:
              </label>
              <input
              onChange={(e)=> setReportedDate(e.target.value)}
              disabled={submissionType === "Draft" ? false : true}
              value={reportedDate}
                type="date"
                id="dateOfReport"
                name="dateOfReport"
                className={`${submissionType !== 'Draft' ? 'bg-[#f0f0f0]' : ''} mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                htmlFor="locationOfIncident"
                className="text-left block text-sm font-medium text-gray-700"
              >
                Location of Incident:
              </label>
              <input
              onChange={(e)=> setIncidentLocation(e.target.value)}
              value={incidentLocation}
              disabled={submissionType === "Draft" ? false : true}
                type="text"
                id="locationOfIncident"
                name="locationOfIncident"
                className={`${submissionType !== 'Draft' ? 'bg-[#f0f0f0]' : ''} mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                htmlFor="dateOfIncident"
                className="text-left block text-sm font-medium text-gray-700"
              >
                Date of Incident:
              </label>
              <input
              onChange={(e)=> setIncidentDate(e.target.value)}
              value={incidentDate}
              disabled={submissionType === "Draft" ? false : true}
                type="date"
                id="dateOfIncident"
                name="dateOfIncident"
                className={`${submissionType !== 'Draft' ? 'bg-[#f0f0f0]' : ''} mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                htmlFor="incidentDescription"
                className="text-left block text-sm font-medium text-gray-700"
              >
                Incident Description:
              </label>
              <textarea
              onChange={(e)=> setIncidentDescription(e.target.value)}
              value={incidentDescription}
              disabled={submissionType === "Draft" ? false : true}
                id="incidentDescription"
                name="incidentDescription"
                cols="30"
                rows="5"
                style={{ border: "1px solid gray" }}
                className={`${submissionType !== 'Draft' ? 'bg-[#f0f0f0]' : ''} mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500`}
              ></textarea>
            </div>
          </div>

          {submissionType === 'Draft' ? <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
  <div style={{ display: "flex", gap: "10px" }}>
    <button
    onClick={()=> deleteIncident()}
      type="button"
      className="w-full bg-gray-300 text-black py-3 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-blue-500"
    >
      Delete
    </button>

    <button
    onClick={()=> handleEditIncident()}
      type="button"
      className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
    >
      Save
    </button>
  </div>

  <button
    onClick={() => setDisplayPopup(false)}
    type="submit"
    className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
  >
    Close
  </button>
</div> : <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
            onClick={() => setDisplayPopup(false)}
            type="submit"
            className="w-full bg-blue-600 mt-5 text-white py-3 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
          </div>}

        </form>
      </div>
    </>
  );
}

export default SubmissionPopup;
