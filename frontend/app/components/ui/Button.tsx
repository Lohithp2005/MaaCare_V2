import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text: React.ReactNode
  className?: string
}

const Button = ({ text, className, ...rest }: ButtonProps) => {
  return (
    <button
      {...rest}
      className={`${className || ''} bg-emerald-500 text-white  text-sm md:text-lg px-3 py-2 md:px-4 md:py-2 rounded-md md:rounded-lg `}
    >
      {text}
    </button>

  )
}

export default Button
