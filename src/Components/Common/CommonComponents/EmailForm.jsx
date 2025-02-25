import React, { useState } from "react";
import { generalFunction } from '../../../assets/Config/generalFunction';
import emailjs from "@emailjs/browser";
import Button from './Button';

const EmailForm = ({handleCancel, supplierEmail = false, supplierData, onSent}) => {
    const [subject, setSubject] = useState('');
    const [name, setName] = useState('');
    const [toEmail, setToEmail] = useState('');
    const [fromEmail, setFromEmail] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [toCc, setToCc] = useState('')

    const validate = () => {
        const errors = {};
        if (!subject) errors.subject = "Subject is required";
        if (!name) errors.name = "Name is required";
        if (!fromEmail) {
            errors.fromEmail = "From email is required";
        } else if (!/\S+@\S+\.\S+/.test(fromEmail)) {
            errors.fromEmail = "From email is invalid";
        }
        if (!toEmail) {
            errors.toEmail = "To email is required";
        } else if (!/\S+@\S+\.\S+/.test(toEmail)) {
            errors.toEmail = "To email is invalid";
        }
        if (!message) errors.message = "Message is required";
        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log(subject, name, toEmail, fromEmail, message, toCc);
        
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        const date_sent = new Date().toISOString().split('T')[0];

        if (supplierEmail) {
            generalFunction.createSupplierEmail(toEmail, fromEmail, date_sent, supplierData);
        }

        const serviceId = 'service_x30xlx6';
        const templateId = 'template_pny88l2';
        const publicKey = 'E1xHr2cBW8hczak6i';
        const privateKey = '2OkN0CkOLCP_pH0WHEk23';

        const templateParams = {
            subject: subject,
            from_name: name,
            reply_to: fromEmail,
            // to_name: 'Test Name',
            to_email: toEmail,
            message: message,
            from_cc: toCc
        };

        emailjs.send(serviceId, templateId, templateParams, {publicKey: publicKey, privateKey: privateKey})
            .then((response) => {
                console.log('Email sent successfullly:', response);
                setName('');
                setToEmail('');
                setFromEmail('');
                setMessage('');
                onSent();
            })
            .catch((error) => {
                console.log('Error sending email:', error);
            });
        
        handleCancel();
    }

    return (
        <div className="z-50 fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 w-1/2 min-h-min max-w-4xl max-h-screen overflow-y-auto rounded-lg">
                <form className="flex flex-col gap-y-2 mb-4">
                    <h3>Subject</h3>
                    {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
                    <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="p-1 border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                    />
                    <h3>Your Name</h3>
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="p-1 border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                    />
                    <h3>Reply To</h3>
                    {errors.fromEmail && <p className="text-red-500 text-sm">{errors.fromEmail}</p>}
                    <input
                    type="email"
                    value={fromEmail}
                    placeholder="example@gmail.com"
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="p-1 border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                    />
                    <h3>Send To</h3>
                    {errors.toEmail && <p className="text-red-500 text-sm">{errors.toEmail}</p>}
                    <input
                    type="email"
                    value={toEmail}
                    placeholder="example@gmail.com"
                    onChange={(e) => setToEmail(e.target.value)}
                    className="p-1 border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                    />
                    <h3>Add CC</h3>
                    {/* {errors.toEmail && <p className="text-red-500 text-sm">{errors.toEmail}</p>} */}
                    <input
                    type="email"
                    value={toCc}
                    placeholder="example@gmail.com"
                    onChange={(e) => setToCc(e.target.value)}
                    className="p-1 border border-gray-300 rounded-md shadow-sm mt-1 block w-full"
                    />
                    <h3>Message</h3>
                    {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
                    <textarea
                    cols="5"
                    rows="6"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="h-fit p-2 border border-[1px] border-solid border-[#d1d5db] focus:border-[#d1d5db] focus:border-solid focus:border-[1px] hover:border-[#d1d5db] hover:border-solid hover:border-[1px] rounded-md shadow-sm mt-1 mb-2 block w-full"
                    >
                    </textarea>
                </form>
                <div className="flex flex-row justify-evenly">
                    <Button
                        label="Cancel"
                        handleFunction={handleCancel}
                    />
                    <Button
                        label="Send"
                        handleFunction={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
};

export default EmailForm;