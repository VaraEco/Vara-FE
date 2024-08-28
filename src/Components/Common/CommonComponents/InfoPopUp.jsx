import React from 'react';

const InfoPopUp = ({ closeInfo}) => {
    return (
        <div className="z-50 fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-[50%]">
                <h2 className="text-left text-2xl font-bold mb-4">Tips</h2>
                <div className="text-left space-y-4">
                    <div>
                        <p className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#00EE66] to-[#0475E6]">Ensure Data Quality</p>
                        <p>Before uploading, please verify that your data is clean, well-organized, and formatted correctly for optimal results.</p>
                    </div>
                    <div>
                        <p className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#00EE66] to-[#0475E6]">Specify Your Chart Requirements</p>
                        <p>When requesting a chart, be as specific as possible. Clearly mention the data you want on the X and Y axes to ensure accurate visualization.</p>
                    </div>
                    <div>
                        <p className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#00EE66] to-[#0475E6]">Supported Chart Types</p>
                        <p>Our chatbot currently supports the following types: Pie Chart, Bar Chart, Doughnut Chart, Scatter Plot, and Line Graph.</p>
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button
                        className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        onClick={closeInfo}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoPopUp;
