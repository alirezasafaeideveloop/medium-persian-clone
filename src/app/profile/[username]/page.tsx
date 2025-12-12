"use client";

import { useState, useEffect } from "react";
import { ProfilePage } from "@/components/profile/ProfilePage";

export default function ProfilePageRoute({ params }: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = useState<string>("");
  
  useEffect(() => {
    const getParams = async () => {
      const { username: paramUsername } = await params;
      setUsername(paramUsername);
    };
    getParams();
  }, [params]);
  
  if (!username) return null;
  
  return <ProfilePage username={username} />;
}