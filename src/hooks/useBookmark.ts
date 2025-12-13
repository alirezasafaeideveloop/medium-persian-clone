"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface UseBookmarkReturn {
  isBookmarked: boolean;
  toggleBookmark: () => Promise<void>;
  loading: boolean;
}

export function useBookmark(postId: string): UseBookmarkReturn {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if post is bookmarked on mount
  useEffect(() => {
    if (session?.user && postId) {
      checkBookmarkStatus();
    }
  }, [session, postId]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch(`/api/bookmark?postId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  const toggleBookmark = useCallback(async () => {
    if (!session?.user) {
      toast.error("برای نشان کردن باید وارد شوید");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.bookmarked);
        toast.success(data.message);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "خطا در نشان کردن");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [session, postId]);

  return {
    isBookmarked,
    toggleBookmark,
    loading,
  };
}