import React, { useCallback } from "react";
import { CldUploadWidget, CldImage } from "next-cloudinary";
import Image from "next/image";
import { TbPhotoPlus } from "react-icons/tb";

interface IProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  isHome?: boolean;
}
const FormImageUpload = ({ onChange, value, label, isHome }: IProps) => {
  // https://console.cloudinary.com/settings
  const uploadPreset = "ua-you";

  const handleUpload = useCallback(
    (result: any) => {
      onChange(result.info.secure_url);
    },
    [onChange]
  );

  return (
    <CldUploadWidget
      onUpload={handleUpload}
      uploadPreset={uploadPreset}
      options={{
        maxFiles: 1,
        maxFileSize: 1048576,
      }}
    >
      {({ open }) => {
        return (
          <div
            onClick={() => open()}
            className="
              relative
              cursor-pointer
              hover:opacity-70
              transition
              border-dashed 
              border-2 
              p-10
              flex
              flex-col
              justify-center
              items-center
              gap-4
              text-neutral-
              mt-2
            "
          >
            <TbPhotoPlus size={isHome ? 50 : 20} />
            <div className="font-semibold text-lg">{label}</div>
            {value && (
              <div className="absolute inset-0 w-full h-full">
                {isHome ? (
                  <CldImage
                    fill
                    style={{ objectFit: "cover" }}
                    src={value}
                    alt="image"
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="flex item-center justify-center p-1">
                    <Image
                      fill
                      style={{ objectFit: "contain" }}
                      src={value}
                      alt="cover"
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }}
    </CldUploadWidget>
  );
};

export default FormImageUpload;
