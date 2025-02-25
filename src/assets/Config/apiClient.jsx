import React, { useState } from 'react';
import axios from "axios";
import { mainConfig } from "../../assets/Config/appConfig";

const S3_api = mainConfig.REACT_APP_BACKEND_S3_API;
const TextRact_api = mainConfig.REACT_APP_BACKEND_TEXTRACT_API;
const chatbot_query_api = mainConfig.REACT_APP_BACKEND_CHATBOT_QUERY_API;

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
    },

    sendUserQuery: async (userInput, userId) => {
        console.log("chatbot api is", chatbot_query_api)
        try {
            const response = await axios.post(
                chatbot_query_api,
                {
                    query: userInput,
                    chatId: userId
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                }
            });
            console.log(response.data)
            return response.data;
        } catch (error) {
                console.error('Error sending message to backend:', error);
                return "error";
        }
    },

}
