import React, { useCallback, useMemo } from "react";
import axios from "axios";
import { formatDistanceToNowStrict } from "date-fns";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { AiOutlineDelete, AiOutlineHeart, AiFillHeart, AiOutlineComment } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
//
import Avatar from "../Avatar";
//
import currentUser from "@/hooks/useCurrentUser";
import useFinalReplayModal from "@/hooks/useFinalReplay";
import useUser from "@/hooks/useUser";

type NestedItemProps = {
  nestedReplay: NestedReplay;
  nestedMutatedReplay: any;
};

const NestedItem: React.FC<NestedItemProps> = ({ nestedReplay, nestedMutatedReplay }) => {
  const { data: user } = useUser(nestedReplay.userId as string);
  const Replay = useFinalReplayModal();
  const { data: loginUser } = currentUser();
  const linkRegex = /((https?:\/\/)|(www\.))[^\s]+/gi;
  const mentionRegex = /(?<=^|(?<=[^a-zA-Z0-9-_\.]))@([A-Za-z]+[A-Za-z0-9_]+)/g;

  const isLiked = useMemo(() => {
    return nestedReplay.likesId.includes(loginUser?.user?.id);
  }, [nestedReplay.likesId, loginUser?.user?.id]);
  const router = useRouter();

  const createdAt = useMemo(() => {
    return formatDistanceToNowStrict(new Date(nestedReplay.createdAt), { addSuffix: true });
  }, [nestedReplay.createdAt]);
  const LikeIcon = isLiked ? AiFillHeart : AiOutlineHeart;

  const onDelete = useCallback(
    async (event: React.MouseEvent<SVGElement, MouseEvent>) => {
      event.stopPropagation();
      try {
        await axios.delete("/api/replay/nestedreplay/", {
          params: { nestedreplayId: nestedReplay.id },
        });
        nestedMutatedReplay();
        toast.success("replay deleted");
      } catch (error: any) {
        toast.error(error.response.data);
      }
    },
    [nestedReplay.id, nestedMutatedReplay]
  );

  const onLike = useCallback(async (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    event.stopPropagation();
    try {
      if (isLiked) {
        await axios.delete("/api/nestedreplay/like", {
          params: { nestedreplayId: nestedReplay.id },
        });
        nestedMutatedReplay();
        return;
      }
      await axios.post("/api/nestedreplay/like", { nestedreplayId: nestedReplay.id });
      nestedMutatedReplay();
      toast.success("liked");
    } catch (error: any) {
      toast.error(error.response.data);
    }
  }, []);

  return (
    <div
      className=" w-full p-2 my-1 cursor-pointer mt-2"
      onClick={() => router.push(`/nestedreplay/${nestedReplay.id}`)}
    >
      <div className="flex items-center">
        <Avatar userId={nestedReplay.userId as string} />
        <div className="flex items-center cursor-pointer hover:underline">
          <p className="hidden md:block text-md font-semibold ml-2">{user?.name}</p>
          <p className="truncate w-10 ml-2 md:hidden  text-md font-bold hover:underline">
            {user?.name}
          </p>
          {user?.isVerified && <MdVerified className="text-blue-500  md:ml-2" />}
        </div>
        <p className="hidden md:block text-gray-500 mx-2">{user?.customTag}</p>
        <p className="truncate w-10 md:hidden text-gray-500 mx-2">{user?.customTag}</p>
        <p className="hidden md:block text-gray-400 mx-2">{createdAt.split("ago")[0]}</p>
        <p className="truncate w-10 md:hidden text-gray-400 mx-2">{createdAt.split("ago")[0]}</p>
        {nestedReplay.userId === loginUser.user.id && (
          <AiOutlineDelete className="text-gray-400  cursor-pointer" onClick={onDelete} />
        )}
      </div>
      {!linkRegex.test(nestedReplay.body) && !mentionRegex.test(nestedMutatedReplay.body) && (
        <p className="text-md text-black text-lg ml-12">{nestedReplay.body}</p>
      )}
      <div className="flex items-center w-full gap-5 ml-2">
        <AiOutlineComment
          className="text-2xl text-gray-500 hover:text-blue-300"
          title="replay"
          onClick={Replay.onOpen}
        />

        <div
          className="
          flex flex-row items-center 
          text-neutral-500 
          gap-2 cursor-pointer 
          transition hover:text-red-500
      "
        >
          <LikeIcon color={isLiked ? "red" : ""} size={20} onClick={onLike} />
          <p>{nestedReplay?.likesId.length || 0}</p>
        </div>
      </div>
    </div>
  );
};
export default NestedItem;
