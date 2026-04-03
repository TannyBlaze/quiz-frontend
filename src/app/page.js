"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const { role } = JSON.parse(storedUser);

    if (role === "admin") router.replace("/admin");
    else if (role === "setter") router.replace("/set");
    else router.replace("/quiz");
  }, [router]);

  return null;
}