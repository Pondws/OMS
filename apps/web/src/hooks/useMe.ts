"use client"

import { authApi } from "apis";
import { useQuery } from "@tanstack/react-query";

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    retry: false 
  })
}