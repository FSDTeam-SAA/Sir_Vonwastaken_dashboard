
"use client"
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react'
import React from 'react'
import Link from 'next/link';
import { KeyRound, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { UserApiResponse } from './user-data-type';
import ProfilePicture from './profile-picture';
import { SettingSidebarSkeleton } from './setting-sidebar-skeleton';

const SettingSidebar = () => {
  const pathname = usePathname();
  const session = useSession();
  const status = session?.status;
  const sessionUser = session?.data?.user as { id?: string; token?: string } | undefined;
  const userId = sessionUser?.id;
  const token = sessionUser?.token;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading } = useQuery<UserApiResponse>({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !result?.status) throw new Error(result?.message || "Unable to load profile");
      return result;
    },
    enabled: Boolean(apiUrl && userId && token),
  });

  const fullName = [data?.data?.firstName, data?.data?.lastName].filter(Boolean).join(" ") || "N/A";

  if (status === "loading" || isLoading) {
    return <SettingSidebarSkeleton />;
  }


  return (
    <div className="settings-sidebar space-y-4">
      <div className="settings-card h-auto overflow-hidden rounded-2xl border border-[#E5E8E2] bg-white pb-5 shadow-[0_4px_18px_rgba(50,59,44,0.06)]">
        <div className="h-32 w-full bg-[linear-gradient(135deg,hsl(var(--primary)),#87947b)] sm:h-[150px]" />
        {/* profile picture  */}
        <div>
          <ProfilePicture />
        </div>
        {/* user info  */}
        <div className='px-4 pb-7 pt-5 text-center'>
          <h4 className="text-xl font-semibold leading-[120%] text-primary md:text-2xl">{fullName}</h4>
          <p className='settings-muted pt-1 text-sm font-normal leading-[120%]'>{data?.data?.email || "N/A"}</p>
        </div>
        <div className='settings-sidebar-details border-t border-[#ECEEEA] px-5 pt-5'>
          <ul className="space-y-3 text-sm leading-[120%]">
            <li><strong className="font-semibold">Name:</strong> {fullName}</li>
            <li><strong className="font-semibold">Email:</strong> {data?.data?.email || "N/A"}</li>
            <li><strong className="font-semibold">Phone:</strong> {data?.data?.phoneNumber || "N/A"}</li>
            <li><strong className="font-semibold">Address:</strong> {data?.data?.address || "N/A"}</li>
          </ul>
        </div>
      </div>
      <nav aria-label="Settings navigation" className="settings-card rounded-2xl border border-[#E5E8E2] bg-white p-3 shadow-[0_4px_18px_rgba(50,59,44,0.06)]">
        <p className="settings-muted px-3 pb-2 text-xs font-semibold uppercase tracking-[0.14em]">Settings</p>
        <Link href="/settings/personal-information" className={`settings-sidebar-link flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${pathname === "/settings/personal-information" ? "settings-sidebar-link-active" : ""}`}>
          <UserRound className="h-4 w-4" />
          Personal Information
        </Link>
        <Link href="/settings/change-password" className={`settings-sidebar-link mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${pathname === "/settings/change-password" ? "settings-sidebar-link-active" : ""}`}>
          <KeyRound className="h-4 w-4" />
          Password & Security
        </Link>
      </nav>
    </div>
  )
}

export default SettingSidebar
