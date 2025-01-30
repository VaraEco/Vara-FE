import React, { useEffect, useState } from 'react';
import { generalFunction } from '../../assets/Config/generalFunction';
import { Doughnut } from 'react-chartjs-2';
import PopUp from '../Common/CommonComponents/PopUp';
import { supabase } from '../../supabaseClient';

function Homepage() {
    const [username, setUserName] = useState('');
    const [userId, setUserId] = useState(null)

    const [reportedBy, setReportedBy] = useState('')
    const [reportedDate, setReportedDate] = useState('')
    const [incidentLocation, setIncidentLocation] = useState('')
    const [incidentDate, setIncidentDate] = useState('')
    const [incidentDescription, setIncidentDescription] = useState('')
    
    const data = {
        labels: ['Submitted', 'Assigned', 'Revising'],
        datasets: [
            {
                data: [7, 2, 5],
                backgroundColor: ['#00da12', '#e6a500', '#dc0030'], // Colors for each segment
                hoverBackgroundColor: ['#00ff15', '#ffb700', '#ff0037'],
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        return `${tooltipItem.label}: ${tooltipItem.raw}%`; // Customize tooltip
                    },
                },
            },
        },
        cutout: '80%',
    };

    async function fetchUserAccessData() {
        try {
            const userId = localStorage.getItem('varaUserId');
            const data = await generalFunction.fetchUserAccessData(userId);
            console.log(data);
            setUserId(data[0].user_id)
            setUserName(data[0].user_name);
        } catch (error) {
            console.log('Error fetching data: ', error);
        }
    }

    useEffect(() => {
        fetchUserAccessData();
    }, []);

    async function handleSaveProgress(e){
        e.preventDefault()

        const {data, error} = await supabase
        .from('incident_history')
        .insert({
            reported_by:reportedBy,
            location_of_incident: incidentLocation,
            date_of_report: reportedDate,
            date_of_incident: incidentDate,
            incident_description: incidentDescription,
            user_id: userId,
            submission: 'View Draft'
        })

        if (error) {
            console.error('Error inserting data:', error);
            alert('Error inserting data. Please try again later.');
        } else {
            console.log('Data inserted successfully:', data);
            alert('Incident report submitted successfully!');

        setReportedBy('');
        setReportedDate('');
        setIncidentLocation('');
        setIncidentDate('');
        setIncidentDescription('');
        }
        
        return data
        
    }

    async function handleSubmit(e){

        e.preventDefault()

        const {data, error} = await supabase
        .from('incident_history')
        .insert({
            reported_by:reportedBy,
            location_of_incident: incidentLocation,
            date_of_report: reportedDate,
            date_of_incident: incidentDate,
            incident_description: incidentDescription,
            user_id: userId,
            submission: 'View Submission'
        })

        if (error) {
            console.error('Error inserting data:', error);
            alert('Error inserting data. Please try again later.');
        } else {
            console.log('Data inserted successfully:', data);
            alert('Incident report submitted successfully!');

        setReportedBy('');
        setReportedDate('');
        setIncidentLocation('');
        setIncidentDate('');
        setIncidentDescription('');
        }
        
        return data
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="flex justify-center space-x-8">
                <div className="bg-red-500 w-full max-w-lg p-6 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-white mb-6">
                        {username && `Hello, ${username}`}
                    </h1>

                    {/* <h1>Task Status</h1> */}
                    <div className="flex justify-center mb-6">
                        <Doughnut data={data} options={options} />
                    </div>

                    <a className="text-xl text-white hover:text-gray-200" href="">
                        Provide feedback to improve Vara
                    </a>
                </div>

                <div className="bg-blue-500 w-full max-w-lg p-6 rounded-lg shadow-lg">
    <form onSubmit={handleSubmit} action="">
        <h1 className="text-2xl font-semibold text-white mb-6">Incident Report</h1>

        <div className="space-y-4">
            <div>
                <label htmlFor="reportedBy" className="block text-white text-sm font-medium">Reported By:</label>
                <input
                    onChange={(e)=> setReportedBy(e.target.value)}
                    value={reportedBy}
                    type="text" 
                    id="reportedBy" 
                    name="reportedBy" 
                    className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="dateOfReport" className="block text-white text-sm font-medium">Date of Report:</label>
                <input 
                    onChange={(e)=> setReportedDate(e.target.value)}
                    value={reportedDate}
                    type="date" 
                    id="dateOfReport" 
                    name="dateOfReport" 
                    className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="locationOfIncident" className="block text-white text-sm font-medium">Location of Incident:</label>
                <input 
                    onChange={(e)=> setIncidentLocation(e.target.value)}
                    value={incidentLocation}
                    type="text" 
                    id="locationOfIncident" 
                    name="locationOfIncident" 
                    className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="dateOfIncident" className="block text-white text-sm font-medium">Date of Incident:</label>
                <input 
                    onChange={(e)=> setIncidentDate(e.target.value)}
                    value={incidentDate}
                    type="date" 
                    id="dateOfIncident" 
                    name="dateOfIncident" 
                    className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="incidentDescription" className="block text-white text-sm font-medium">Incident Description:</label>
                <textarea 
                    onChange={(e)=> setIncidentDescription(e.target.value)}
                    value={incidentDescription}
                    id="incidentDescription" 
                    name="incidentDescription" 
                    cols="30" 
                    rows="5" 
                    className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                ></textarea>
            </div>
        </div>

        <div style={{display:'flex', gap:'15px'}}>
        <button onClick={handleSaveProgress} type="button" className="mt-6 w-full bg-red-100 text-black py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
            Save Progress
        </button>

        <button type="submit" className="mt-6 w-full bg-red-100 text-black py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
            Submit
        </button>
        </div>
    </form>
</div>

            </div>
        </div>
    );
}

export default Homepage;
