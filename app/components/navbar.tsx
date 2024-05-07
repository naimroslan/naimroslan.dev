import { useNavigate } from "@remix-run/react";
import { useState } from "react";

export default function Navbar() {
  
  return (
    <nav className="sticky top-2 z-10 bg-white backdrop-filter backdrop-blur-lg bg-opacity-30 border-b border-gray-200 rounded-full">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <span className="text-2xl text-gray-900 font-semibold">naimroslan.</span>
          <div className="flex space-x-4 text-gray-900">
            <a href="#">HOME</a>
            <a href="#">ABOUT</a>
            <a href="#">PROJECT</a>
          </div>
          <span className="text-gray-900">CONTACT</span>
        </div>
      </div>
    </nav>
  )
}