import Image from "next/image";
//
import useUser from "@/hooks/useUser";
import Avatar from "@/components/Avatar";

interface IProps {
  userId: string;
}

const UserHero = ({ userId }: IProps) => {
  const { data: fetchUser } = useUser(userId);

  return (
    <div>
      <div className="bg-blue-100 h-44 relative">
        {fetchUser?.coverImage && (
          <Image src={fetchUser.coverImage} fill alt="Cover Image" style={{ objectFit: "cover" }} />
        )}
        <div className="absolute -bottom-12 left-1">
          <Avatar userId={userId} isLarge hasBorder />
        </div>
      </div>
    </div>
  );
};

export default UserHero;
