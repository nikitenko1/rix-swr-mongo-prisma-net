import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { formatDistanceToNowStrict } from "date-fns";
import { getSession } from "next-auth/react";
import { NextPageContext } from "next";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineComment, AiOutlineDelete, AiOutlineHeart } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
//
import Avatar from "@/components/Avatar";
import ReplaysFeed from "@/components/replay/ReplaysFeed";
import Form from "@/components/Form";
//
import useComment from "@/hooks/useComment";
import currentUser from "@/hooks/useCurrentUser";
import usePost from "@/hooks/usePost";
import useReplays from "@/hooks/useReplays";
import useReplayModal from "@/hooks/useReplayModal";
import useToggle from "@/hooks/useToggle";
import useUser from "@/hooks/useUser";

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

const CommentId = () => {
  const router = useRouter();
  const { commentId } = router.query;
  const linkRegex = /((https?:\/\/)|(www\.))[^\s]+/gi;
  const mentionRegex = /(?<=^|(?<=[^a-zA-Z0-9-_\.]))@([A-Za-z]+[A-Za-z0-9_]+)/g;

  const { data: comment, mutate: commentMutate } = useComment(commentId as string);
  const { data: post, mutate: postMutated } = usePost(comment?.postId as string);

  const { mutate: mutatedReplay } = useReplays(commentId as string);
  const { data: loginUser } = currentUser();
  const { login } = useToggle();
  const { data: user } = useUser(comment?.userId as string);

  const ReplayModal = useReplayModal();

  const [body, setBody] = useState<string>("");
  const [characterRemain, setCharacterRemain] = useState<number>(140);
  const [bodyLength, setBodyLength] = useState<number>(0);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length > 140) return;
      setBody(e.target.value);
      setBodyLength(e.target.value.length);
      setCharacterRemain(140 - e.target.value.length);
    },
    [setBody, setBodyLength, setCharacterRemain]
  );

  const createdAt = useMemo(() => {
    if (!comment?.createdAt) return "";
    else {
      return formatDistanceToNowStrict(new Date(comment?.createdAt), { addSuffix: true });
    }
  }, [comment?.createdAt]);

  const deleteComment = useCallback(
    async (event: React.MouseEvent<SVGElement, MouseEvent>) => {
      event.stopPropagation();
      try {
        await axios.delete("/api/comment/comment/", { params: { commentId: comment?.id } });
        commentMutate();
        toast.success("comment deleted");
        router.push(`/posts/${comment?.postId}`);
      } catch (error: any) {
        toast.error(error.response?.data?.error || error.message);
      }
    },
    [comment?.id, commentMutate]
  );

  const isLiked = useMemo(() => {
    const list = comment?.likesId || [];
    return list.includes(loginUser?.user.id);
  }, [comment?.likesId, loginUser?.user.id]);

  const onLike = useCallback(
    async (event: React.MouseEvent<SVGElement, MouseEvent>) => {
      event.stopPropagation();
      if (!loginUser) {
        login();
        return;
      }
      try {
        if (isLiked) {
          await axios.delete("/api/comment/like/", { params: { commentId: comment?.id } });
          commentMutate();
          router.push(`/posts/${comment?.postId}`);
        } else {
          await axios.post("/api/comment/like/", { commentId: comment?.id });
          commentMutate();
          toast.success("comment liked");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || error.message);
      }
    },
    [comment?.id, commentMutate, isLiked]
  );

  const LikeIcon = isLiked ? AiFillHeart : AiOutlineHeart;

  return (
    <div className="flex flex-col items-start p-1 w-full my-2 mx-2" key={comment?.id}>
      <div
        className="flex items-center w-full "
        onClick={() => router.push(`/user/${comment?.userId}`)}
      >
        {comment && <Avatar userId={comment?.userId as string} />}
        {comment && (
          <div className="flex items-center cursor-pointer hover:underline">
            <p className="hidden md:block text-md font-semibold ml-2">{user?.name}</p>
            <p className="truncate w-10 ml-2 md:hidden  text-md font-bold hover:underline">
              {user?.name}
            </p>
            {user?.isVerified && <MdVerified className="text-blue-500  md:ml-2" />}
          </div>
        )}
        <p className="hidden md:block text-gray-400 mx-2">{user?.customTag}</p>
        <p className="truncate w-10 md:hidden text-gray-400 mx-2">{user?.customTag}</p>
        <p className="hidden md:block text-gray-400 mx-2">{createdAt.split("ago")[0]}</p>
        <p className="truncate w-10 md:hidden text-gray-400 mx-2">{createdAt.split("ago")[0]}</p>

        {loginUser?.user.id === comment?.userId && (
          <AiOutlineDelete className="text-gray-400  cursor-pointer" onClick={deleteComment} />
        )}
      </div>
      <div className="mx-10">
        <>
          {comment && !linkRegex.test(comment?.body) && !mentionRegex.test(comment.body) && (
            <p className="text-md text-black break-words">{comment.body}</p>
          )}
          {comment?.body.match(linkRegex) && !mentionRegex.test(comment.body) && (
            <>
              <p className="text-md text-black break-words ">
                {comment.body.replace(linkRegex, "").trim()}
              </p>
              {Array.from(comment.body.matchAll(linkRegex)).map((link, index) => (
                <li className="list-none" key={index}>
                  <span className="text-blue-500 hover:underline break-words ">{link[0]}</span>
                </li>
              ))}
            </>
          )}
          {comment?.body.match(mentionRegex) && !linkRegex.test(comment.body) && (
            <div className="flex items-center gap-2">
              {Array.from(comment.body.matchAll(mentionRegex)).map((mention, index) => (
                <li className="list-none" key={index}>
                  <span className="text-blue-500 hover:underline break-words ">{mention[0]}</span>
                </li>
              ))}
              <p className="text-md text-black break-words ">
                {comment.body.replace(mentionRegex, "").trim()}
              </p>
            </div>
          )}
          {comment?.body.match(mentionRegex) && comment.body.match(linkRegex) && (
            <div className="flex items-center gap-2">
              <p className="text-md text-black break-words ">
                {comment.body.replace(mentionRegex, "").replace(linkRegex, "")}
              </p>
              {Array.from(comment.body.matchAll(mentionRegex)).map((mention, index) => (
                <li className="list-none" key={index}>
                  <span className="text-blue-500 hover:underline break-words ">{mention[0]}</span>
                </li>
              ))}
              {Array.from(comment.body.matchAll(linkRegex)).map((link, index) => (
                <li className="list-none" key={index}>
                  <span className="text-blue-500 hover:underline break-words">{link[0]}</span>
                </li>
              ))}
            </div>
          )}
        </>
      </div>
      <div className="flex items-center w-full gap-5 ml-2">
        {comment && (
          <AiOutlineComment
            className="text-2xl cursor-pointer text-gray-500 hover:text-blue-300"
            title="replay"
            onClick={ReplayModal.onOpen}
          />
        )}
        {comment && <p className="gap-2 text-gray-500 ">{comment?.replays.length}</p>}
        {comment && (
          <div
            className="
           flex flex-row items-center 
           text-neutral-500 
           gap-2 
           cursor-pointer 
           transition 
           hover:text-red-500
       "
          >
            <LikeIcon color={isLiked ? "red" : ""} size={20} onClick={onLike} />
            <p>{comment?.likesId.length}</p>
          </div>
        )}
      </div>
      <Form
        placeholder="replay"
        isReplay
        commentId={comment?.id as string}
        mutatedReplay={mutatedReplay}
        postid={comment?.postId as string}
      />
      <ReplaysFeed commentId={comment?.id as string} />
    </div>
  );
};

export default CommentId;
