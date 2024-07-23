import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export const apiClient = {

    getOCRValue: async (evidence_name) => {
        try {
            const response = await axios.post(apiUrl, {
                bucketName: 'compliance-document-bucket',
                documentName: evidence_name,
            } , {
                headers: {
                'Content-Type': 'application/json'
            }}
            );
            return response.data.Value;
        } catch (error) {
                console.error('Error sending message to backend:', error);
        }
    }

}
