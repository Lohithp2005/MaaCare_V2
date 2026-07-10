'use client'
import React, { useState } from 'react'
import { CircleUserRound, LockKeyhole, Mail } from 'lucide-react'
import { toast } from 'react-toastify'

interface SignUpData {
  name: string,
  email: string,
  password: string
}




const SignUpForm = () => {

  const [signUpData, setSignUpData] = useState<SignUpData>({
    name: '',
    email: '',
    password: ''
  })

  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const passwordDontMatch = signUpData.password !== "" && confirmPassword !== "" && signUpData.password !== confirmPassword

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/user/register', {
        "method": "post",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": JSON.stringify(signUpData)
      })

      const data = await response.json();
      console.log(data)

      if (response.ok) {
        toast.success(data.message, {
          position: "top-center",
          autoClose: 5000,
        });
      }else {
        toast.error(data.detail[0].msg, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.error("Error occurred during sign up. Please try again.", {
        position: "top-center",
        autoClose: 5000,
      });


    }
  }

  return (

    <div className='h-full flex items-center justify-center '>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4   pt-5 pb-8 px-10 w-80 md:w-105 border border-gray-200  rounded-xl p-3 bg-white'>
        <h2 className='text-center text-2xl font-bold text-gray-600'>Sign UP</h2>

        <label className='text-sm'>Name: </label>
        <div className='flex items-center gap-3  w-full '>
          <CircleUserRound className="shrink-0" />
          <input type="text" value={signUpData.name} onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })} className="w-full border-b flex-1 h-10 focus:outline-none focus:border-emerald-500 border-gray-300 " />
        </div>


        <label className='text-sm'>Email: </label>
        <div className='flex items-center gap-3  w-full '>
          <Mail className="shrink-0" />
          <input type="email" value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} className="w-full border-b flex-1 h-10 focus:outline-none focus:border-emerald-500 border-gray-300 " />
        </div>

        <label className='text-sm'>Password: </label>
        <div className='flex items-center gap-3  w-full '>
          <LockKeyhole className="shrink-0" />
          <input type="password" value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} className='w-full border-b flex-1 h-10 focus:outline-none focus:border-emerald-500 border-gray-300 ' />
        </div>

        <label >Confirm Password:</label>
        <div className="flex items-center gap-3 w-full">
          <LockKeyhole className="shrink-0" />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className='w-full border-b flex-1 h-10 focus:outline-none focus:border-emerald-500 border-gray-300' />
        </div>
        <p
          className={`text-xs h-1 text-red-500 ${passwordDontMatch ? "visible" : "invisible"
            }`}
        >
          Passwords do not match
        </p>        <button className=" bg-emerald-500 text-white  text-sm md:text-lg px-3 py-2 md:px-4 md:py-2 rounded-md md:rounded-lg" type="submit">Sign Up</button>

        <p className='text-sm text-center'>already have an account? <a href="/loginForm" className='text-emerald-600'>Login</a> </p>
      </form>
    </div>
  )
}

export default SignUpForm 
