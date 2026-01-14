"use client";

import React from 'react'
import Image from "next/image";
import { useAppContext } from '@/context/AppContext';


export default function Login(dispatchFunction: any) {
  const { setIsLoggedIn } = useAppContext();

  return (
    <div className="w-screen h-screen relative flex justify-center items-center size-full">
      
      {/* Background Image */}
      <Image
        src="/home.png"
        alt="homeImage"
        fill
        className="size-full absolute left-0 top-0 z-0"
      />

      {/* Container Wrapper */}
      <div className="flex flex-col justify-center items-center gap-y-[126px] relative z-[1]">
        
        {/* Logo */}
        <div className="w-[736px]">
        <Image
          src="/logo.svg"
          alt="logo"
          width={736}  // Set width manually
          height={300} // Adjust height as needed
          className="select-none"
        />
        </div>

        {/* Button */}
        <button
          onClick={() => setIsLoggedIn(true)}
          className="rounded-[40px] bg-white flex gap-x-[26px] py-[18px] px-[30px] text-[35px] leading-[42px] items-center"
        >
          Login
          <span>
            <svg
              width="42"
              height="26"
              viewBox="0 0 42 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="1.31134e-07"
                y1="13.5"
                x2="39"
                y2="13.5"
                stroke="black"
                strokeWidth="3"
              />
              <path d="M27 2L39 13L27 24" stroke="black" strokeWidth="3" />
            </svg>
          </span>
        </button>
      </div>
    </div>

  )
}
