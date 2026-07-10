"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "../components/ui/Button";

export default function Home() {


  return (
    <main className="h-screen w-full flex items-center justify-center ">
      
      <div className="p-2 h-full  w-full flex flex-col items-center text-center md:flex md:flex-row-reverse md:gap-55 md:justify-center md:items-center">
        <div className="md:-mt-25 md:-ml-25 ">
        <div className="b flex flex-col  items-center ">
          <h1 className="text-[25px]  mt-10  md:text-[45px] font-bold">   <span className="text-emerald-500 "> AI-Powered </span>    Healthcare Companion <br className="hidden md:block" />  for Safer and Smarter Motherhood</h1>
          <h1 className="mt-2 md:mt-0 text-sm md:text-xl  text-slate-500">   Built with Care, Support, and Love for Mothers</h1>
          <div className=" flex gap-10 md:gap-20 mt-4 ">
            <Button text="Get Started" />
            <Button text="Learn More" className="border-emerald-500 border bg-transparent text-emerald-500!" />
          </div>
        </div>
        </div>
        <div className="w-70 h-70  mt-5  relative md:w-[30%] ">
          <Image src="/mother.png" alt="doctor" fill className="object-contain" />
        </div>
      </div>
    </main>
  );
}
