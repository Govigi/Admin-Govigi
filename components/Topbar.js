// components/TopBar.js
import {
  Cog6ToothIcon,
  BellIcon,
  InformationCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const popupRef = useRef(null);

  // Close popup if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    }
    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setShowPopup(false);
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white text-gray-800 px-6 py-4 border-b border-gray-200 relative">
      <div className="flex gap-7 justify-end mr-12">
        <Cog6ToothIcon className="h-6 w-6 text-gray-700" />
        <BellIcon className="h-6 w-6 text-gray-700" />
        <InformationCircleIcon className="h-6 w-6 text-gray-600" />
        <div className="relative">
          <UserIcon
            className="h-6 w-6 text-green-600 cursor-pointer"
            onClick={() => setShowPopup((v) => !v)}
          />
          {showPopup && (
            <div
              ref={popupRef}
              className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow-lg z-50"
            >
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
