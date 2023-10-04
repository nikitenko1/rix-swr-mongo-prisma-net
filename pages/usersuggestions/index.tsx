import { useCallback } from "react";
import { getSession } from "next-auth/react";
import { NextPageContext } from "next";
import Head from "next/head";
import axios from "axios";
import toast from "react-hot-toast";
import { MdVerified } from "react-icons/md";
//
import Header from "@/components/header/Header";
import Avatar from "@/components/Avatar";
//
import useUsers from "@/hooks/useUsers";
import useCurrentUser from "@/hooks/useCurrentUser";
import usePosts from "@/hooks/usePosts";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
}

const UserSuggestions = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: users, mutate: mutatedUser } = useUsers();
  const { mutate: mutatedPost } = usePosts();

  const onFollow = useCallback(
    async (userId: string) => {
      await axios.post("/api/follow", { userId: userId });
      toast.success("Followed");
      mutatedUser();
      mutatedPost();
    },
    [currentUser?.user.id]
  );
  return (
    <>
      <Head>
        <title>Who To Follow | UA-You</title>
      </Head>
      <Header showBackArrow label="Who To Follow" />
      {users &&
        users?.map((user: User) => (
          <>
            <div key={user?.id} className="hidden md:flex items-center">
              <div className="flex flex-row gap-4 ml-5 mt-5 justify-start hover:cursor-pointer w-full">
                {currentUser.user.id !== user.id && <Avatar userId={user.id} />}
                {currentUser.user.id !== user.id && (
                  <>
                    <div className="flex flex-col mt-3 cursor-pointer">
                      <div className="flex items-center">
                        <h1 className="font-bold text-xl truncate">{user.name}</h1>
                        {user.isVerified && <MdVerified className="text-blue-500 md:ml-2" />}
                      </div>
                      <p className="text-gray-500 text-sm">{user.customTag}</p>
                    </div>
                  </>
                )}
              </div>
              {currentUser.user.id !== user.id && (
                <div className="mx-2">
                  <button
                    className="text-blue w-full border-2 border-solid p-1 my-3 mr-3 border-blue-400
                    text-lg font-medium rounded-full"
                    onClick={() => onFollow(user.id)}
                  >
                    Follow
                  </button>
                </div>
              )}
            </div>
            <div key={user?.id} className="sm:flex-col md:hidden items-center">
              <div className="flex flex-row gap-4 ml-5 mt-5 justify-start hover:cursor-pointer w-full">
                {currentUser.user.id !== user.id && <Avatar userId={user.id} />}
                {currentUser.user.id !== user.id && (
                  <>
                    <div className="flex flex-col mt-3 cursor-pointer">
                      <div className="flex items-center">
                        <h1 className="font-bold text-xl truncate">{user.name}</h1>
                        {user.isVerified && <MdVerified className="text-blue-500 md:ml-2" />}
                      </div>
                      <p className="text-gray-500 text-sm">{user.customTag}</p>
                    </div>
                  </>
                )}
              </div>
              {currentUser.user.id !== user.id && (
                <div className="mx-2">
                  <button
                    className="text-blue w-full border-2 border-solid p-1 my-3 mr-3 border-blue-400
                    text-lg font-medium rounded-full"
                    onClick={() => onFollow(user.id)}
                  >
                    Follow
                  </button>
                </div>
              )}
            </div>
          </>
        ))}
    </>
  );
};

export default UserSuggestions;
