// components/Sidebar.js
'use client';
import {
  Squares2X2Icon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import Logo from '../public/GoVigiLogo.png'
import { useRouter } from 'next/navigation'; 
import { useState , useEffect} from 'react';
export default function Sidebar() {
  const [selectedCol, setCol] = useState("Summary");
  const router = useRouter();
  useEffect(() => {
    router.push('/Ordersummary');
  }, []);
  return (
    <aside className="w-50 h-screen bg-white shadow-md flex flex-col items-center py-6 space-y-6 fixed left-0 top-0">
        <div className='flex flex-col gap-5'>
            <div className="flex items-center justify-center">
                <Image src={Logo} alt="GoVigi Logo" width={80} height={30} />
            </div>
            <div className='flex gap-3 cursor-pointer hover:text-green-600 transition-all duration-300 ease-in-out' >
                <Squares2X2Icon className="h-6 w-6 text-gray-700" />
                <h1 className='text-gray-600'>DashBoard</h1>
            </div>
            <div className='flex gap-3 cursor-pointer hover:text-green-600 transition-all duration-300' 
              onClick={()=>{
                router.push('/Ordersummary');
              }
            }
            >
              {selectedCol=="Summary"?<div className='border-green-500 border-l-2'></div>:null}
                <ShoppingBagIcon className="h-6 w-6 text-gray-700 hover:text-green-600 cursor-pointer" />
                <h1 className='text-gray-600'>Order Summary</h1>
            </div>
        </div>
    </aside>
  )
}
