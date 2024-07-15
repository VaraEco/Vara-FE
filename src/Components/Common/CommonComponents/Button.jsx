import React from "react";

const Button = ({
    label = "Click here",
    handleFunction,
    isSelected = false,
    disabled = false,
    additionalClasses = "",
    actionButton = false
}) => {
    const baseClasses = "flex justify-center items-center h-10 text-sm text-black bg-gradient-to-br from-[#00EE66] to-[#0475E6] rounded-lg shadow focus:shadow-outline text-center p-0.5 font-light hover:text-white";
    const selectedClasses = isSelected ? 'bg-green-500 text-white' : 'bg-white';
    const actionButtonClasses = "text-lg font-light border-none p-0 hover:text-[#0475E6]";

    const buttonClasses = actionButton ? `${actionButtonClasses}` : `${baseClasses} ${selectedClasses} ${additionalClasses}`;

    return (
        <button
            onClick={handleFunction}
            type="button"
            disabled={disabled}
            className={buttonClasses}
        >
            {actionButton ? (
                <span>{label}</span>
            ) : (
                <span className="flex w-[200%] bg-white p-5 py-2 rounded-md hover:bg-transparent">
                    {label}
                </span>
            )}
        </button>
    );
}

export default Button;
