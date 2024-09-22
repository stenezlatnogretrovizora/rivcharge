import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function Sidebar() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const { data: session } = useSession();
  if (!session) return null;

  const logoSrc = '/logo-tiny.png'

  return (
    <aside
      className="flex flex-col lg:flex-col items-center bg-white text-gray-700 shadow-lg h-auto lg:h-screen w-full lg:w-auto p-4">
      <div className="h-16 flex items-center w-full mb-4">
        <a href="./" className="h-16 w-full flex items-center">
          <Image
            className="h-10 w-16 rounded-md mx-auto"
            src={logoSrc}
            width={64}
            height={64}
            alt="logo"
          />
        </a>
      </div>

      <ul className="flex-1 w-full lg:flex-col lg:w-auto">
        <li className="hover:bg-gray-100 rounded-md">
          <a
            href="./profile"
            className="h-16 px-6 flex justify-center items-center w-full focus:text-orange-500 rounded-md"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g id="user">
                <circle cx="12" cy="9" r="5"></circle>
                <path d="M4,28V20a2,2,0,0,1,2-2H18a2,2,0,0,1,2,2v8"></path>
              </g>
            </svg>
          </a>
        </li>
        <li className="hover:bg-gray-100 rounded-md">
          <a
            href="./list"
            className="h-16 px-6 flex justify-center items-center w-full focus:text-orange-500 rounded-md"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
              <path
                d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
          </a>
        </li>
      </ul>

      <div className="mt-auto h-16 flex items-center w-full">
        <button
          onClick={handleLogout}
          className="h-16 w-full flex justify-center items-center focus:text-orange-500 focus:outline-none rounded-md"
        >
          <svg
            className="h-5 w-5 text-red-700"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  );
}