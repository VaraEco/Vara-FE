import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

Modal.setAppElement('#root');

const PdfViewer = ({ pdfUrl, isOpen, onClose }) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="PDF Viewer"
            style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    height: '80%',
                    zIndex: 1000,
                },
                overlay: {
                    zIndex: 1000,
                },
            }}
        >
        <button onClick={onClose} style={{ marginBottom: '10px' }}>Close</button>
        <div style={{ height: '90%' }}>
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                <div
                    style={{
                        height: '750px',
                    }}
                >
                    <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} /> 
                </div>
            </Worker>
        </div>
        </Modal>
    );
};

export default PdfViewer;
