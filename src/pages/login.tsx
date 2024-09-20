import { signIn, useSession } from 'next-auth/react';
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      void router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }


  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="RivCharge Logo"
          src="./logo.png" // todo@urk: change this logo
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <button
          onClick={() => signIn('google')}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Sign in with Google
        </button>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not an employee?{' '}
          <a href="https://careers.rivian.com/careers-home/" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Become one
          </a>
        </p>
      </div>
    </div>
  );
}
