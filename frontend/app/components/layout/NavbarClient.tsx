"use client"
import { Menu } from 'lucide-react';
import { useState } from 'react'
import Button from '../ui/Button';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { handleLogOut } from '@/app/services/auth';
import { useRouter } from 'next/navigation'


const NavbarClient = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const [open, setOpen] = useState<boolean>(false)
  const router = useRouter();

  const clickedLogout = async () => {
    await handleLogOut();
    router.push("/loginForm")
    router.refresh()

  }


  return (
    <nav className="border-b h-15 relative flex items-center bg-white text-slate-700 border-gray-200 p-5 w-full">
      <Link href={isAuthenticated ? "/protected/chat" : "/"} className='flex items-center gap-2'>
        <h1 className='md:text-2xl font-bold shrink-0 text-emerald-500'>MaaCare </h1>
      </Link>


      <div className='hidden md:flex absolute left-1/2 -translate-x-1/2 gap-20 tracking-wide'>

       
      </div>

      <Menu className='md:hidden ml-auto'
        onClick={() => setOpen(prev => !prev)}
      />

      {open &&
        <div className='absolute z-10 top-full left-0 justify-center items-center gap-7 p-2 bg-white w-full border-b border-gray-200 rounded-b-2xl flex flex-col'>
          <div className='flex flex-col items-center gap-7 underline underline-offset-4'>
            <a href="/">Home</a>
            <a href="/">Home</a>
            <a href="/">Home</a>
          </div>
          {isAuthenticated ? (<Button onClick={() => clickedLogout()} className="px-3! py-1!" text="Logout" />) : (<Link href="/loginForm"><Button onClick={() => { }} className="px-3! py-1!" text="Login " /></Link>)}

        </div>
      }

      <div className='hidden md:flex shrink-0 md:ml-auto md:justify-end md:gap-2'>
        {isAuthenticated ? (<Button onClick={() => clickedLogout()} className="px-3! py-1!" text="Logout" />) : (<a href="/loginForm"><Button onClick={() => { }} className="px-3! py-1!" text="Login" /> </a>)}
        <a href="/signUpForm"><Button onClick={() => { }} className="px-3! py-1!" text="Sign Up" /> </a>

      </div>
      


    </nav>
  )
}

export default NavbarClient
