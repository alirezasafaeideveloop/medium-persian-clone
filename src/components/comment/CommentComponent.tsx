"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Heart, 
  Reply,
  MoreHorizontal,
  Trash2,
  Edit,
  Flag
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username?: string;
    image?: string;
  };
  postId: string;
  parentId?: string;
  createdAt: Date;
  replies?: Comment[];
  likes: number;
  _count?: {
    replies: number;
  };
}

interface CommentComponentProps {
  comment: Comment;
  onReply?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
  isReply?: boolean;
}

export function CommentComponent({ 
  comment, 
  onReply, 
  onDelete, 
  onLike, 
  isReply = false 
}: CommentComponentProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes || 0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: faIR 
    });
  };

  const handleLike = async () => {
    if (!session) {
      toast.error("برای لایک کردن باید وارد شوید");
      return;
    }

    try {
      const response = await fetch("/api/comments/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId: comment.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      toast.error("خطا در لایک کردن کامنت");
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error("متن پاسخ نمی‌تواند خالی باشد");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onReply) {
        await onReply(comment.id, replyContent);
      }
      setReplyContent("");
      setShowReplyForm(false);
      toast.success("پاسخ با موفقیت ارسال شد");
    } catch (error) {
      toast.error("خطا در ارسال پاسخ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!session || session.user.id !== comment.author.id) {
      toast.error("شما مجوز حذف این کامنت را ندارید");
      return;
    }

    if (window.confirm("آیا از حذف این کامنت مطمئن هستید؟")) {
      try {
        if (onDelete) {
          await onDelete(comment.id);
        }
        toast.success("کامنت با موفقیت حذف شد");
      } catch (error) {
        toast.error("خطا در حذف کامنت");
      }
    }
  };

  const isAuthor = session?.user?.id === comment.author.id;

  return (
    <Card className={`${isReply ? "border-l-4 border-l-primary" : ""}`}>
      <CardContent className="p-4">
        {/* Comment Header */}
        <div className="flex items-start space-x-3 space-x-reverse">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.image} alt={comment.author.name} />
            <AvatarFallback className="text-xs">
              {comment.author.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="font-medium text-sm">{comment.author.name}</span>
                {comment.author.username && (
                  <span className="text-sm text-muted-foreground">@{comment.author.username}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </div>
            </div>
            
            <div className="text-sm text-justify leading-relaxed mt-1">
              {comment.content}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`${isLiked ? "text-red-500" : "text-muted-foreground"}`}
            >
              <Heart className={`h-3 w-3 ${isLiked ? "fill-current" : ""}`} />
              {likesCount}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply className="h-3 w-3" />
            </Button>
            
            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 border-t pt-4">
            <div className="space-y-3">
              <Textarea
                placeholder="نوشتن پاسخ خود..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleReply}
                  disabled={isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? "در حال ارسال..." : "ارسال پاسخ"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="text-sm font-medium text-muted-foreground mb-3">
              {comment._count?.replies} پاسخ
            </div>
            {comment.replies.map((reply) => (
              <CommentComponent
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onDelete={onDelete}
                onLike={onLike}
                isReply={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}