"use client"
import React, { useState } from 'react'

interface WelcomeProps {
    name: string
}
function Welcome(props: WelcomeProps) {
    return <h1>Welcome {props.name}</h1>
}


const page = () => {
    const [name, setName] = useState<string>("")
    const [input, setInput] = useState<string>("")
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleNameChange = () => {
        setName(input)
    }
    return (
        <div>
            <Welcome name={name} />
            <input className='border' type="text" value={input} onChange={handleInputChange} ></input>
            <button className="block bg-green-400 text-white rounded-md p-1" onClick={handleNameChange}>Change Name</button>
        </div>
    )
}

export default page
