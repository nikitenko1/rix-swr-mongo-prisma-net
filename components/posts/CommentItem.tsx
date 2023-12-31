import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { formatDistanceToNowStrict } from "date-fns";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineComment, AiOutlineDelete, AiOutlineHeart } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
//
import Avatar from "../Avatar";
import ReplayItem from "../replay/ReplayItem";
//
import useCurrentUser from "@/hooks/useCurrentUser";
import useUser from "@/hooks/useUser";
import useReplays from "@/hooks/useReplays";
import useToggle from "@/hooks/useToggle";

interface IProps {
  comment: _Comment;
  userId?: string;
  mutatedComment?: any;
}

const CommentItem = ({ comment, mutatedComment }: IProps) => {
  const router = useRouter();
  //
  const linkRegex = /((https?:\/\/)|(www\.))[^\s]+/gi;
  const mentionRegex = /(?<=^|(?<=[^a-zA-Z0-9-_\.]))@([A-Za-z]+[A-Za-z0-9_]+)/g;
  //
  const { data: user } = useUser(comment.userId);
  const { data: loginUser } = useCurrentUser();
  const { data: replays, mutate: mutatedReplay } = useReplays(comment.id as string);

  const { login } = useToggle();

  const createdAt = useMemo(() => {
    return formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true });
  }, [comment.createdAt]);

  const gotoComment = useCallback(
    (event: any) => {
      event.stopPropagation();
      router.push(`/comment/${comment.id}`);
    },
    [comment.id]
  );

  const deleteComment = useCallback(
    async (event: React.MouseEvent<SVGElement, MouseEvent>) => {
      event.stopPropagation();
      try {
        await axios.delete("/api/comment/comment/", { params: { commentId: comment.id } });
        mutatedComment();
        toast.success("comment deleted");
      } catch (error: any) {
        toast.error(error?.response?.data);
      }
    },
    [comment.id]
  );

  const isLiked = useMemo(() => {
    const list = comment.likesId || [];
    return list.includes(loginUser?.user.id);
  }, [comment.likesId, loginUser?.user.id]);

  const onLike = useCallback(
    async (event: React.MouseEvent<SVGElement, MouseEvent>) => {
      event.stopPropagation();
      if (!loginUser) {
        login();
        return;
      }
      try {
        if (isLiked) {
          await axios.delete("/api/comment/like/", { params: { commentId: comment.id } });
          mutatedComment();
        } else {
          await axios.post("/api/comment/like/", { commentId: comment.id });
          mutatedComment();
          toast.success("comment liked");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || error.message);
      }
    },
    [comment.id, isLiked]
  );

  const LikeIcon = isLiked ? AiFillHeart : AiOutlineHeart;

  return (
    <div
      className="flex flex-col items-start p-1 w-full  my-2"
      key={comment.id}
      onClick={gotoComment}
    >
      <div className="flex items-center w-full">
        <Avatar userId={comment.userId} />
        <div className="flex items-center cursor-pointer hover:underline">
          <p className="hidden md:block text-md font-semibold ml-2">{user?.name}</p>
          <p className="truncate w-10 ml-2 md:hidden  text-md font-bold hover:underline">
            {user?.name}
          </p>
          {user?.isVerified && <MdVerified className="text-blue-500 md:ml-2" />}
        </div>
        <p className="hidden md:block text-gray-400 mx-2">{user?.customTag}</p>
        <p className="truncate w-10 md:hidden text-gray-400 mx-2">{user?.customTag}</p>
        <p className="hidden md:block text-gray-400 mx-2">{createdAt.split("ago")}</p>
        <p className="truncate w-10 md:hidden text-gray-400 mx-2">{createdAt.split("ago")}</p>
        {loginUser?.user.id === comment.userId && (
          <AiOutlineDelete
            className="text-gray-400 ml-auto cursor-pointer"
            onClick={deleteComment}
          />
        )}
      </div>
      <div className="mx-10 w-full shadow-inner bg-slate-200 py-4">
        {!linkRegex.test(comment.body) && !mentionRegex.test(comment.body) && (
          <p className="text-md whitespace-normal text-black break-words">{comment.body}</p>
        )}
        {comment.body.match(linkRegex) && !mentionRegex.test(comment.body) && (
          <>
            <p className="text-md text-black break-words">
              {comment.body.replace(linkRegex, "").trim()}
            </p>
            {Array.from(comment.body.matchAll(linkRegex)).map((link, index) => (
              <li className="list-none" key={index}>
                <span className="text-blue-500 hover:underline break-words">{link[0]}</span>
              </li>
            ))}
          </>
        )}
        {comment.body.match(mentionRegex) && !linkRegex.test(comment.body) && (
          <div className="flex flex-col items-start gap-1">
            {Array.from(comment.body.matchAll(mentionRegex)).map((mention, index) => (
              <li className="list-none" key={index}>
                <span className="text-blue-500 hover:underline break-words">{mention[0]}</span>
              </li>
            ))}
            <p className="text-md text-black break-words ">
              {comment.body.replace(mentionRegex, "").trim()}
            </p>
          </div>
        )}

        {comment.body.match(mentionRegex) && comment.body.match(linkRegex) && (
          <>
            <p className="text-md text-black break-words ">
              {comment.body.replace(mentionRegex, "").replace(linkRegex, "")}
            </p>
            {Array.from(comment.body.matchAll(mentionRegex)).map((mention, index) => (
              <li className="list-none" key={index}>
                <span className="text-blue-500 hover:underline break-words">{mention[0]}</span>
              </li>
            ))}
            {Array.from(comment.body.matchAll(linkRegex)).map((link, index) => (
              <li className="list-none" key={index}>
                <span className="text-blue-500 hover:underline break-words">{link[0]}</span>
              </li>
            ))}
          </>
        )}
        {replays && replays.length > 1 ? (
          <div>
            <ReplayItem replay={replays[0]} key={0} mutatedReplay={mutatedReplay} />
            <span
              className="text-md text-slate-600 cursor-pointer hover:scale-110 transition
              hover:font-semibold ml-2"
            >
              Show More
            </span>
          </div>
        ) : (
          replays?.map((replay: Replay, index) => (
            <div className="hidden md:flex flex-col w-full" key={index}>
              <ReplayItem replay={replay} mutatedReplay={mutatedReplay} />
            </div>
          ))
        )}
      </div>
      <div className="flex items-center w-full gap-5 ml-2">
        <AiOutlineComment
          className="text-2xl text-gray-500 hover:text-blue-300 hover:scale-105 transition-all"
          title="replay"
          onClick={gotoComment}
        />
        <p className="  text-neutral-500 ">{comment?.replays?.length}</p>

        <div
          className="
               flex 
               flex-row 
               items-center 
               text-neutral-500 
               gap-2 
               cursor-pointer 
               transition 
               hover:text-red-500
           "
        >
          <LikeIcon color={isLiked ? "red" : ""} size={20} onClick={onLike} />
          <p>{comment.likesId.length}</p>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
