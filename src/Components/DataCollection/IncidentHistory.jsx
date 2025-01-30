import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { generalFunction } from '../../assets/Config/generalFunction';
import PopUp from '../Common/CommonComponents/PopUp';
import SubmissionPopup from './SubmissionPopup';

function IncidentHistory() {

    const userId = localStorage.getItem('varaUserId');
    const [incidents, setIncidents] = useState([])
    const [submissionType, setSubmissionType] = useState('')

    const [selectedSubmission, setSelectedSubmission] = useState({})
    const [displayPopup, setDisplayPopup] = useState(false)

    async function fetchIncidents(){
        try {
            const allIncidents = await generalFunction.fetchIncidentHistory(userId)
            console.log(allIncidents);
            setIncidents(allIncidents)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=> {
        fetchIncidents()  
    }, [])

    function handleSubmissions(e, incident){
        if(e.target.innerText === 'View Draft'){
            setSelectedSubmission(incident)
            setSubmissionType('Draft')
            setDisplayPopup(true)
        }
        else if(e.target.innerText === 'View Submission'){
            setSelectedSubmission(incident)
            setSubmissionType('Submitted')
            setDisplayPopup(true)
        }
        else{
            console.log('others');
            
        }
    }

  return (
    <div style={{display:'flex', justifyContent:'center', marginTop:'50px', textAlign:'center'}}>
         <table className="w-[90%] border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">Reported By</th>
                            <th className="border border-gray-300 px-4 py-2">Date of Report</th>
                            <th className="border border-gray-300 px-4 py-2">Date of Incident</th>
                            <th className="border border-gray-300 px-4 py-2">Submission</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.map((incident, index) => (
                            <tr 
                                key={index} 
                                className="cursor-pointer hover:bg-gray-100 transition"
                            >
                                <td className="border border-gray-300 px-4 py-2">{incident.reported_by}</td>
                                <td className="border border-gray-300 px-4 py-2">{incident.date_of_report}</td>
                                <td className="border border-gray-300 px-4 py-2">{incident.date_of_incident}</td>
                                <td onClick={(e)=> handleSubmissions(e,incident)} className="border border-gray-300 px-4 py-2">{incident.submission}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {displayPopup && <SubmissionPopup fetchIncidents={fetchIncidents} displayPopup={displayPopup} setDisplayPopup={setDisplayPopup} selectedSubmission={selectedSubmission} submissionType={submissionType}/>}
    </div>
  )
}

export default IncidentHistory