import React, { useState } from 'react';
import axios from "axios";

const S3_api = process.env.REACT_APP_BACKEND_S3_API;
const TextRact_api = process.env.REACT_APP_BACKEND_TEXTRACT_API;

export const apiClient = {

    uploadToS3: async (file, file_name) => {
            const formData = new FormData();
            formData.append('fileName', file_name)
            formData.append('file', file);

            try {
                const response = await axios.post(
                    S3_api,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                return response.data.Value;
            } catch (error) {
                console.error('Error sending message:', error);
            }
    },

    getOCRValue: async (file_name) => {
        try {
            const response = await axios.post(
                TextRact_api,
                {
                    bucketName: 'compliance-document-bucket',
                    documentName: file_name,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                }
            });
            return response.data.Value;
        } catch (error) {
                console.error('Error sending message to backend:', error);
        }
    }

}
