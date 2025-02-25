import React from 'react'

function IconPrevPage({disabled}) {
  return (
    <div  style={{
        width: '30px',
        height: '30px',
        backgroundColor: disabled ? '#9d9d9d' : 'transparent', // Sets background color
        backgroundImage: disabled ? 'none' : 'linear-gradient(to bottom right, #00EE66, #0475E6)', // Applies gradient if not disabled
        borderRadius: '50%', // Make the background circular
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
        cursor:'pointer'
}}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ fill: disabled ? '#ededed' : 'white' }}>
        <path d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM271 135c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-87 87 87 87c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L167 273c-9.4-9.4-9.4-24.6 0-33.9L271 135z"/>
        </svg>
    </div>
  )
}

export default IconPrevPage