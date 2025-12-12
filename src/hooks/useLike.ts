"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface UseLikeReturn {
  isLiked: boolean;
  likeCount: number;
  toggleLike: () => Promise<void>;
  loading: boolean;
}

export function useLike(postId: string, initialLikeCount: number): UseLikeReturn {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  // Check if post is liked on mount
  useEffect(() => {
    if (session?.user && postId) {
      checkLikeStatus();
    }
  }, [session, postId]);

  const checkLikeStatus = async () => {
    try {
      const response = await fetch(`/api/like?postId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const toggleLike = useCallback(async () => {
    if (!session?.user) {
      toast.error("برای لایک کردن باید وارد شوید");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
        
        toast.success(data.message);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "خطا در لایک کردن");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [session, postId]);

  return {
    isLiked,
    likeCount,
    toggleLike,
    loading,
  };
}