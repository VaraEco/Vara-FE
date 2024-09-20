import React, { useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify';

function ToastPop({message}) {
    useEffect(() => {
       toast(message)
    }, []);

    return (
        <div>
            <ToastContainer />
        </div>
    );
}

export default ToastPop