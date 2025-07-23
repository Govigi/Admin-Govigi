// components/TopBar.js
import {
  Cog6ToothIcon,
  BellIcon,
  InformationCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
export default function TopBar() {
  return (
    <header className="bg-white text-white px-6 py-4 shadow-md">
        <div className='flex gap-7 justify-end mr-12'>
            <Cog6ToothIcon className="h-6 w-6 text-gray-700" />
            <BellIcon className="h-6 w-6 text-gray-700" />
            <InformationCircleIcon className="h-6 w-6 text-gray-600" />
            <UserIcon className="h-6 w-6 text-green-600" />
        </div>
    </header>
  );
}
