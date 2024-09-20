import React from 'react'

function Switch({ checked, onChange }) {
  return (
        <label  className="relative inline-block w-12 h-5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="opacity-0 w-0 h-0"
      />
      <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 transition-all duration-300 rounded-full ${checked ? 'bg-blue-400' : 'bg-gray-300'}`}>
        <span
          className={`absolute h-4 w-4 bg-white rounded-full bottom-[2.5px] left-[-2px] transition-transform duration-300 ${
            checked ? 'translate-x-8' : 'bottom-[2.5px] left-[3px]'
          }`}
        ></span>
      </span>
    </label>
  )
}

export default Switch