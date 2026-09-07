"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { useSession } from "next-auth/react";
import Image, { type StaticImageData } from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UserApiResponse } from "./user-data-type";

import NoUserImage from "../../../../../public/assets/images/no-user.jpeg"


const ProfilePicture = () => {
  const session = useSession();
  const sessionUser = session?.data?.user as { id?: string; token?: string } | undefined;
  const userId = sessionUser?.id;
  const token = sessionUser?.token;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const queryClient = useQueryClient();

  const [profilePicture, setProfilePicture] = useState<string | StaticImageData>(NoUserImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data } = useQuery<UserApiResponse>({
    queryKey: ["user-profile", userId],
    queryFn: () =>
      fetch(`${apiUrl}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } }).then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result?.status) throw new Error(result?.message || "Unable to load profile");
        return result;
      }),
      enabled: Boolean(apiUrl && userId && token),
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-profile-image"],
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${apiUrl}/users/update-avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const result = await res.json();
      if (!res.ok || !result?.status) throw new Error(result?.message || "Upload failed");
      return result;
    },
    onSuccess: async (data) => {
      toast.success(data?.message || "Profile image updated successfully!");
      queryClient.setQueryData(["user-profile", userId], data);
      await queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Upload failed"),
  });

  useEffect(() => {
    const image = data?.data?.profileImage;
    if (image) {
      setProfilePicture(image);
    }
  }, [data?.data?.profileImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file to backend
    const formData = new FormData();
    formData.append("avatar", file, file.name);
    mutate(formData);
  };

  return (
    <div className="flex justify-center items-center ">
        <div className="w-fit -mt-20 relative rounded-full border-4 border-[#F7F8F8] bg-[url('/path-to-image')] bg-cover bg-center bg-no-repeat shadow-[0_4px_15px_rgba(0,0,0,0.10)]
">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border relative">
          <Image
            src={profilePicture}
            alt="Profile"
            width={128}
            height={128}
            className="w-full h-full object-cover "
          />
        </div>

        <div className="absolute -bottom-2 -right-2 flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />

          {/* Camera Icon (Choose & Upload Image) */}
          <Button
            size="sm"
            className="w-8 h-8 p-0 rounded-full bg-primary"
            title="Upload new image"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
       
      </div>
    </div>
    </div>
  );
};

export default ProfilePicture;
