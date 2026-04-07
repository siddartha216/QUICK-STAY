import React, { useEffect } from 'react'
import Navbar from '../../Components/hotelOwner/Navbar'
import Sidebar from '../../Components/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from "../../Context/AppContext.jsx"

const Layout = () => {
  const {isOwner}=useAppContext();
  useEffect(()=>
  {
    if(!isOwner)
    {
      
    }
  },[isOwner])
  return (
    <div className='flex flex-col h-screen'>
        <Navbar />
        <div className='flex h-full'>
            <Sidebar />
            <div className='flex-1 p-4 pt-10 md:px-10 h-full'>
                <Outlet />
            </div>
        </div>

    </div>
  )
}

export default Layout