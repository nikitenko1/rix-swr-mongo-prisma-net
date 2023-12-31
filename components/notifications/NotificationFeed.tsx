import React, { useEffect } from "react";
import useNotifications from "@/hooks/useNotifications";
import { CircleLoader } from "react-spinners";
//
import NotificationItem from "./NotificationItem";
//
import useCurrentUser from "@/hooks/useCurrentUser";

const NotificationFeed = () => {
  const { data: loginUser, mutate: mutatedLoginUser } = useCurrentUser();
  const { data: notifications, isLoading } = useNotifications(loginUser?.user.id as string);

  useEffect(() => {
    mutatedLoginUser();
  }, [mutatedLoginUser()]);

  return (
    <>
      {notifications instanceof Array &&
        notifications?.length > 0 &&
        notifications?.map((notification: any) => (
          <NotificationItem notification={notification} key={notification.id} />
        ))}
      {isLoading && (
        <div className="flex justify-center items-center">
          <CircleLoader color="#3B82F6" size={50} />
        </div>
      )}
    </>
  );
};

export default NotificationFeed;
