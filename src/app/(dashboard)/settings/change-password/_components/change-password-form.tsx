"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";

const formSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters."),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const ChangePasswordForm = () => {
    const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const session = useSession();
  const token = (session?.data?.user as { token?: string })?.token;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
     defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

    const { mutate, isPending } = useMutation({
    mutationKey: ["changePassword"],
    mutationFn: (values: { oldPassword: string; newPassword: string; confirmPassword: string }) =>
      fetch(`${apiUrl}/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      }).then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result?.status) throw new Error(result?.message || "Password change failed");
        return result;
      }),
    onSuccess: (data) => {
      toast.success(data?.message || "Password Change successfully!");
      form.reset();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Password change failed"),
  });


  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      oldPassword: values?.oldPassword,
      newPassword: values?.newPassword,
      confirmPassword: values?.confirmPassword,
    };
    mutate(payload);
  }
  return (
    <div className='settings-card rounded-2xl border border-[#E5E8E2] bg-white px-4 py-5 shadow-[0_4px_18px_rgba(50,59,44,0.06)] sm:px-6 sm:py-6 lg:px-8'>
       <div className="pb-2">
        <Link href="/settings" className="flex items-center gap-1 text-sm text-gray-500 font-medium transition-colors hover:text-primary hover:underline">
          <ChevronLeft /> Back to Settings
        </Link>
      </div>
      <div>
        <h4 className='text-xl font-semibold leading-tight text-[#343A40] md:text-2xl'>Change Password</h4>
        <p className='pt-2 text-sm font-normal leading-6 text-[#68706A] sm:text-base'>Use a strong, unique password that you do not use elsewhere.</p>
      </div>
      {/* form  */}
      <div className="pt-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

             <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-[#3B4759] leading-[120%]">
                    Current Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showCurrent ? "text" : "password"}
                        placeholder="********"
                        className="h-[48px] w-full rounded-[4px] border-[#C0C3C1] p-3 placeholder:text-[#8E959F] text-[#3B4759] text-base ring-0 outline-none leading-[120%] font-normal"
                      />
                    </FormControl>
                    <button type="button" aria-label={showCurrent ? "Hide current password" : "Show current password"}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => setShowCurrent((prev) => !prev)}
                    >
                      {showCurrent ? (
                        <EyeOff size={20} className="" />
                      ) : (
                        <Eye size={20} className="" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-[#3B4759] leading-[120%]">
                    New Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showNew ? "text" : "password"}
                        placeholder="********"
                        className="h-[48px] w-full rounded-[4px] border-[#C0C3C1] p-3 placeholder:text-[#8E959F] text-[#3B4759] text-base ring-0 outline-none leading-[120%] font-normal"
                      />
                    </FormControl>
                    <button type="button" aria-label={showNew ? "Hide new password" : "Show new password"}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => setShowNew((prev) => !prev)}
                    >
                      {showNew ? (
                        <EyeOff size={20} className="" />
                      ) : (
                        <Eye size={20} className="" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-[#3B4759] leading-[120%]">
                    Confirm New Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showConfirm ? "text" : "password"}
                        placeholder="********"
                        className="h-[48px] w-full rounded-[4px] border-[#C0C3C1] p-3 placeholder:text-[#8E959F] text-[#3B4759] text-base ring-0 outline-none leading-[120%] font-normal"
                      />
                    </FormControl>
                    <button type="button" aria-label={showConfirm ? "Hide confirmed password" : "Show confirmed password"}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-600  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => setShowConfirm((prev) => !prev)}
                    >
                      {showConfirm ? (
                        <EyeOff size={20} className="" />
                      ) : (
                        <Eye size={20} className="" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


            
            <div className="flex w-full flex-col-reverse gap-3 border-t border-[#ECEEEA] pt-5 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="settings-discard-button h-11 w-full rounded-xl border border-[#E7A7B0] px-6 text-sm font-medium text-[#D92D20] sm:w-auto"
              >
                Discard Changes
              </Button>


              <Button disabled={isPending} className="h-11 w-full rounded-xl px-6 text-sm font-semibold text-white sm:w-auto" type="submit">{isPending ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default ChangePasswordForm
