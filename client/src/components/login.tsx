"use client";

import React from 'react'
import Image from "next/image";
import { AppDispatch } from '@/redux/store';


export default function Login(dispatchFunction: any, setIsLoggedIn: Function) {
  return (
    <div className="w-screen h-screen relative flex justify-center items-center size-full">
      <Image
        src="../../public/home.png"
        alt="homeImage"
        className="size-full absolute left-0 top-0 z-0"
      />
      <div className="flex flex-col justify-center items-center gap-y-[126px] relative z-[1]">
        <div className="w-[736px] size-full">
          <Image
            src="../../public/logo.svg"
            alt="logo"
            className="size-full left-0 top-0 select-none"
          />
        </div>
        <button
          onClick={dispatchFunction(setIsLoggedIn(true))}
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
                stroke-width="3"
              />
              <path d="M27 2L39 13L27 24" stroke="black" stroke-width="3" />
            </svg>
          </span>
        </button>
      </div>
    </div>

  )
}
