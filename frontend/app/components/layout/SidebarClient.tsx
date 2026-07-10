"use client"
import { ChevronLeft, ChevronRight, Menu, MessageCircle, PersonStanding, ScanText, UserPen, Utensils, LogOut } from 'lucide-react';
import { useState } from 'react'
import Button from '../ui/Button';
import Link from 'next/link';
import { handleLogOut } from '@/app/services/auth';
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/protected/chat', label: 'Chat', icon: MessageCircle },
  { href: '/protected/scan', label: 'Scan', icon: ScanText },
  { href: '/protected/exercise', label: 'Exercise', icon: PersonStanding },
  { href: '/protected/diet', label: 'Diet', icon: Utensils },
  { href: '/protected/profile', label: 'Profile', icon: UserPen },
];

const NavbarClient = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const router = useRouter();
  const pathname = usePathname();

  const clickedLogout = async () => {
    const success = await handleLogOut();
    if (success) {
      router.push("/loginForm");
      router.refresh();
    }
  }

  return (
    <nav className={`flex flex-col h-screen transition-all duration-200 ${collapsed ? 'w-20' : 'w-40'}`}>
      <div className=" bg-linear-to-br from-emerald-400/70 to-emerald-500/90 text-white flex justify-center h-20 relative overflow-hidden">
        <div className="absolute rounded-full h-12 w-12 bg-white/35 -right-3 -top-4"></div>
        <div className="absolute rounded-full h-12 w-12 bg-white/35 -bottom-7 left-2"></div>
        <Link href={isAuthenticated ? "/protected/home" : "/"} className='flex items-center gap-2'>
          {!collapsed && <h1 className='md:text-2xl font-bold shrink-0 '>MaaCare </h1>}
        </Link>
      </div>

      <div className="border-b shadow relative flex flex-1 flex-col justify-between items-center text-slate-700 border-gray-200 p-5 bg-white">
        <div></div>
        <div className={`flex flex-col tracking-wide ${collapsed ? 'gap-5' : 'gap-7'}`}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link key={href} href={href}>
                <span
                  className={`flex items-center rounded-xl transition-colors ${
                    collapsed ? 'justify-center px-2 py-3' : 'gap-2 px-3 py-1'
                  } ${
                    isActive ? 'bg-emerald-50 text-emerald-600' : 'text-emerald-500 hover:bg-slate-50 hover:text-emerald-600'
                  }`}
                >
                  {/* Fixed padding structure prevents layout shifts */}
                  <span className={`p-2 rounded-lg ${isActive ? 'bg-transparent' : 'bg-emerald-50'}`}>
                    <Icon />
                  </span>
                  {!collapsed && label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex w-full items-center justify-between">
          <Menu
            className='md:hidden'
            onClick={() => setOpen(prev => !prev)}
          />

          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className=" mx-auto rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            {collapsed ? <ChevronRight /> : <div className=" "> <ChevronLeft /></div>}
          </button>
        </div>

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

        <div className='hidden md:flex shrink-0 md:justify-end '>
          {isAuthenticated ? (
            <Button
              onClick={clickedLogout}
              text={collapsed ? <LogOut size={18} /> : "Logout"}
              className={`${
                collapsed
                  ? "w-10 h-8! px-0! flex items-center justify-center "
                  : "px-8! py-1!"
              }`}
            />
          ) : (
            <a href="/loginForm">
              <Button
                onClick={() => {}}
                text="Login"
                className={`${
                  collapsed
                    ? "w-10 h-8! px-0! flex items-center justify-center "
                    : "px-3! py-1!"
                }`}
              />
            </a>
          )}
        </div>

      </div>
    </nav>
  )
}

export default NavbarClient