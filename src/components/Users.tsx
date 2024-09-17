import { Session } from "next-auth";
import { useSession } from "next-auth/react";

function UsersComponent() {
  const session = useSession().data as Session & { user: { id: string } };
  let upcomingCharge = (
    <>
      <div className="text-base text-[#6B7280] mb-6">
        You have an upcoming charge on [Date/Time Placeholder]
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-[#6A64F1] font-medium">
          Location: [Location Placeholder]
        </div>
        <div className="text-sm text-[#6A64F1] font-medium">
          Time: [Time Placeholder]
        </div>
      </div>
    </>
  )

  if (Math.random() > 0.5) { // todo@urk fix this
    upcomingCharge = (<div className="text-base text-[#6B7280] mb-6">
      You have no upcoming charges
    </div>)
  }

  return (
    <div className="flex justify-center items-center p-12">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-[#07074D] mb-4">
          Hello {session?.user?.name}
        </h2>
        {upcomingCharge}
      </div>
    </div>
  );
}

export default UsersComponent;
