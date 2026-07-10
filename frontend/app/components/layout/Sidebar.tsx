import React from 'react'
import {cookies} from 'next/headers'
import SidebarClient from './SidebarClient'

const Sidebar = async () => {

    const cookieStore = await cookies();
    const isLoggedIn = !!cookieStore.get("access_token");
    
  return (
    <SidebarClient isAuthenticated = {isLoggedIn}/>
  )
}

export default Sidebar
