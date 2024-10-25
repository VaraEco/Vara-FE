import React, { useState } from 'react'
import Login from '../Login/Login'
import { Navigate } from 'react-router-dom'

function PrivateRoute(props) {

    const [isAuth, setIsAuth] = useState(localStorage.getItem('questUserToken'))

    if(!isAuth){
       return <Navigate to={'/login'}/>
    }
    else{
        return props.children
    }
}


export default PrivateRoute