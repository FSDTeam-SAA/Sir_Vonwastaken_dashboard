"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import NoUserImage from "../../../../public/assets/images/no-user.jpeg";
import { UserApiResponse } from "../settings/_components/user-data-type";

type SessionUser = { id?: string; token?: string };

export default function DashboardUserSummary() {
  const { data: session } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const userId = sessionUser?.id;
  const token = sessionUser?.token;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading } = useQuery<UserApiResponse>({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok || !result?.status) throw new Error(result?.message || "Unable to load user profile");
      return result;
    },
    enabled: Boolean(apiUrl && userId && token),
  });

  const user = data?.data;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account user";
  const role = user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : "User";

  return (
    <div className="dashboard-user-summary flex min-w-0 items-center gap-3">
      <div className="min-w-0 text-right">
        <p className="truncate text-sm font-semibold text-[#18212B] dark:text-slate-100">{isLoading ? "Loading..." : fullName}</p>
        <p className="text-xs text-[#64748B] dark:text-slate-400">{role}</p>
      </div>
      <Image
        src={user?.profileImage || NoUserImage}
        alt={`${fullName} profile image`}
        width={42}
        height={42}
        unoptimized
        className="h-10 w-10 shrink-0 rounded-full border border-[#DBE3EC] object-cover dark:border-white/10"
      />
    </div>
  );
}
