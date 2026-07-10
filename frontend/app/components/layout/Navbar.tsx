import React from 'react'
import {cookies} from 'next/headers'
import NavbarClient from './NavbarClient'

const Navbar = async () => {

    const cookieStore = await cookies();
    const isLoggedIn = !!cookieStore.get("access_token");
    
  return (
    <NavbarClient isAuthenticated = {isLoggedIn}/>
  )
}

export default Navbar
