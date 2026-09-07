"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PersonalInfoSkeleton from "../../_components/personal-info-skeleton";
import { UserApiResponse } from "../../_components/user-data-type";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
});

type SessionUser = { id?: string; token?: string };

const PersonalInformationForm = () => {
  const queryClient = useQueryClient();
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
      if (!response.ok || !result?.status)
        throw new Error(result?.message || "Unable to load profile");
      return result;
    },
    enabled: Boolean(apiUrl && userId && token),
    staleTime: 1000 * 60 * 5,
  });

  const user = data?.data;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (user)
      form.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        address: user.address ?? "",
        phoneNumber: user.phoneNumber ?? "",
      });
  }, [form, user]);

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-profile", userId],
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch(`${apiUrl}/users/update-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          address: values.address,
          phoneNumber: values.phoneNumber,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.status)
        throw new Error(result?.message || "Profile update failed");
      return result;
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Profile updated successfully");
      await queryClient.invalidateQueries({
        queryKey: ["user-profile", userId],
      });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Profile update failed",
      ),
  });

  if (isLoading) return <PersonalInfoSkeleton />;

  const fieldClass =
    "h-12 w-full rounded-xl border-[#C8CEC5] bg-transparent px-3 text-base text-[#3B4759] outline-none placeholder:text-[#8E959F] focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className="settings-card h-full rounded-2xl border border-[#E5E8E2] bg-white px-4 py-5 shadow-[0_4px_18px_rgba(50,59,44,0.06)] sm:px-6 sm:py-6 lg:px-8">
      <Link
        href="/settings"
        className="flex items-center gap-1 pb-5 text-sm font-medium text-gray-500 transition-colors hover:text-primary hover:underline"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Settings
      </Link>
      <h2 className="text-xl font-semibold text-[#343A40] md:text-2xl">
        Personal Information
      </h2>
      <p className="settings-muted pt-2 text-sm sm:text-base">
        Manage your personal information and contact details.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutate(values))}
          className="space-y-5 pt-7"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-[#3B4759]">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className={fieldClass}
                      placeholder="First name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-[#3B4759]">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className={fieldClass}
                      placeholder="Last name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-[#3B4759]">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    className={fieldClass}
                    placeholder="you@example.com"
                  />
                </FormControl>
                <p className="settings-muted text-xs">
                  Email is managed by your account and cannot be changed here.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-[#3B4759]">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className={fieldClass}
                    placeholder="+880 1XXXXXXXXX"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-[#3B4759]">
                  Address
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className={fieldClass}
                    placeholder="Your address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex w-full flex-col-reverse gap-3 border-t border-[#ECEEEA] pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              className="settings-discard-button h-11 w-full rounded-xl border-[#E7A7B0] text-[#D92D20] sm:w-auto"
            >
              Discard Changes
            </Button>
            <Button
              disabled={isPending}
              type="submit"
              className="h-11 w-full rounded-xl px-6 text-sm font-semibold text-white sm:w-auto"
            >
              {isPending ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalInformationForm;
