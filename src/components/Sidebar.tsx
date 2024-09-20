import { signOut, useSession } from "next-auth/react";

export default function Sidebar() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const { data: session } = useSession();
  if (!session) return null;

  const src = session?.user?.image || "";
  const logoSrc = './logo-tiny.png'

  return (
    <aside
      className="flex flex-col lg:flex-col items-center bg-white text-gray-700 shadow-lg h-auto lg:h-screen w-full lg:w-auto p-4">
      <div className="h-16 flex items-center w-full mb-4">
        <a href="./profile" className="h-16 w-full flex items-center">
          <img
            className="h-16 w-16 rounded-md mx-auto"
            src={src}
            alt="user image"
          />
        </a>
      </div>

      <ul className="flex-1 w-full lg:flex-col lg:w-auto">
        <li className="hover:bg-gray-100 rounded-md">
          <a
            href="./"
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
              <path d="M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3zm-1-5.907v-5.093h-3v2.093l3 3z"/>
            </svg>
          </a>
        </li>
        <li className="hover:bg-gray-100 rounded-md">
          <a
            href="."
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
        <li className="hover:bg-gray-100 rounded-md">
          <a
            href="./map"
            className="h-16 px-6 flex justify-center items-center w-full focus:text-orange-500 rounded-md">
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
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
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