"use client"
import React from 'react'
import { LockKeyhole, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { handleLogIn } from '@/app/services/auth'
import { toast } from 'react-toastify'


interface LoginData {
    email: string,
    password: string
}
const LoginForm = () => {

    const router = useRouter()



    const [loginData, setLoginData] = React.useState<LoginData>({
        email: '',
        password: ''
    })

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        try {
            const response = await handleLogIn(loginData)



            toast.success(response, {
                position: "top-center",
                autoClose: 2000,
            });

            router.push("/protected/chat")
            router.refresh()

        } catch (error) {
            toast.error("Error occurred during login. Please try again.", {
                position: "top-center",
                autoClose: 5000,
            });
        }
    }

    return (
        <div className='h-full flex items-center justify-center '>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4   pt-5 pb-8 px-10 w-80 md:w-105 border border-gray-200  rounded-xl p-3 bg-white'>
                <h2 className='text-center text-2xl font-bold text-gray-600'>Login</h2>
                <label className='text-sm'>Username: </label>
                <div className='flex items-center gap-3  w-full '>
                    <Mail className="shrink-0" />
                    <input type="text" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className="w-full border-b flex-1 h-10 focus:outline-none focus:border-emerald-500 border-gray-300 " />
                </div>

                <label className='text-sm'>Password: </label>
                <div className='flex items-center gap-3  w-full '>
                    <LockKeyhole className="shrink-0" />
                    <input type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className='w-full border-b flex-1 h-10 focus:outline-none focus:border-emerald-500 border-gray-300 ' />
                </div>
                <button className=" bg-emerald-500 text-white  text-sm md:text-lg px-3 py-2 md:px-4 md:py-2 rounded-md md:rounded-lg" type="submit">Login</button>

                <p className='text-sm text-center'>Don't have an account? <a href="/signUpForm" className='text-emerald-600'>Sign-Up</a> </p>
            </form>
        </div>
    )
}

export default LoginForm
