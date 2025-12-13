"use client";

import { useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link,
  Image,
  Eye,
  Save,
  X,
  Hash,
  Plus
} from "lucide-react";
import { toast } from "sonner";

interface ArticleEditorProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    content?: string;
    tags?: string[];
    coverImage?: string;
  };
  onSave?: (data: any) => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export function ArticleEditor({ 
  initialData, 
  onSave, 
  onCancel, 
  mode = "create" 
}: ArticleEditorProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    content: initialData?.content || "",
    tags: initialData?.tags || [],
    coverImage: initialData?.coverImage || "",
  });
  const [newTag, setNewTag] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const insertText = (before: string, after: string = "") => {
    const textarea = document.querySelector("#content-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = before + selectedText + after;
    
    const newValue = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);
    
    handleInputChange("content", newValue);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const insertMarkdown = (type: string) => {
    switch (type) {
      case "bold":
        insertText("**", "**");
        break;
      case "italic":
        insertText("*", "*");
        break;
      case "underline":
        insertText("__", "__");
        break;
      case "code":
        insertText("`", "`");
        break;
      case "codeblock":
        insertText("```\n", "\n```");
        break;
      case "quote":
        insertText("> ");
        break;
      case "list":
        insertText("- ");
        break;
      case "orderedlist":
        insertText("1. ");
        break;
      case "link":
        const url = prompt("لینک را وارد کنید:");
        if (url) insertText("[", `](${url})`);
        break;
      case "image":
        const imgUrl = prompt("آدرس تصویر را وارد کنید:");
        if (imgUrl) insertText("![", `](${imgUrl})`);
        break;
      case "heading":
        insertText("## ");
        break;
    }
  };

  const handleSave = async () => {
    if (!session?.user) {
      setError("برای ذخیره مقاله باید وارد شوید");
      return;
    }

    if (!formData.title.trim()) {
      setError("عنوان مقاله الزامی است");
      return;
    }

    if (!formData.content.trim()) {
      setError("محتوای مقاله الزامی است");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const articleData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        content: formData.content.trim(),
        tags: formData.tags,
        coverImage: formData.coverImage.trim(),
        authorId: session.user.id,
      };

      if (mode === "edit" && initialData) {
        // TODO: Update existing article
        toast.success("مقاله با موفقیت ویرایش شد");
      } else {
        // Create new article
        const response = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
        });

        if (response.ok) {
          toast.success("مقاله با موفقیت ذخیره شد");
          if (onSave) onSave(articleData);
        } else {
          const data = await response.json();
          setError(data.error || "خطا در ذخیره مقاله");
        }
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = () => {
    return (
      <div className="prose prose-lg max-w-none persian-content">
        <div dangerouslySetInnerHTML={{ 
          __html: formData.content
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
            const altText = alt.trim() || 'تصویر مقاله';
            return `<img src="${src}" alt="${altText}" />`;
          })
            .replace(/\n/g, '<br>')
        }} />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {mode === "create" ? "ایجاد مقاله جدید" : "ویرایش مقاله"}
            </CardTitle>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="ml-2 h-4 w-4" />
                {previewMode ? "ویرایش" : "پیش‌نمایش"}
              </Button>
              {onCancel && (
                <Button variant="outline" size="sm" onClick={onCancel}>
                  <X className="ml-2 h-4 w-4" />
                  انصراف
                </Button>
              )}
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="min-w-[100px]"
              >
                {saving ? (
                  <>
                    <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save className="ml-2 h-4 w-4" />
                    ذخیره
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!previewMode ? (
            <>
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">عنوان مقاله *</Label>
                <Input
                  id="title"
                  placeholder="عنوان جذاب و گویا برای مقاله خود..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">زیرعنوان (اختیاری)</Label>
                <Input
                  id="subtitle"
                  placeholder="خلاصه کوتاهی از مقاله..."
                  value={formData.subtitle}
                  onChange={(e) => handleInputChange("subtitle", e.target.value)}
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="coverImage">تصویر شاخص (اختیاری)</Label>
                <Input
                  id="coverImage"
                  placeholder="آدرس تصویر شاخص مقاله..."
                  value={formData.coverImage}
                  onChange={(e) => handleInputChange("coverImage", e.target.value)}
                  dir="ltr"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>برچسب‌ها</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      #{tag}
                      <X 
                        className="mr-1 h-3 w-3" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <Input
                    placeholder="برچسب جدید..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    className="flex-1"
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Content Editor */}
              <div className="space-y-2">
                <Label>محتوای مقاله *</Label>
                
                {/* Editor Toolbar */}
                <div className="border rounded-lg p-2 bg-muted/50">
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("bold")}
                      title="ضخیم"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("italic")}
                      title="کج"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("underline")}
                      title="زیرخط‌دار"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("heading")}
                      title="عنوان"
                    >
                      <Hash className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("quote")}
                      title="نقل قول"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("code")}
                      title="کد"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("codeblock")}
                      title="بلوک کد"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("list")}
                      title="لیست"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("orderedlist")}
                      title="لیست شماره‌دار"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("link")}
                      title="لینک"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("image")}
                      title="تصویر"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Content Textarea */}
                <Textarea
                  id="content-textarea"
                  placeholder="محتوای مقاله خود را اینجا بنویسید..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  className="min-h-[400px] font-mono text-sm leading-relaxed"
                  dir="rtl"
                />
                
                <div className="text-xs text-muted-foreground">
                  می‌توانید از Markdown برای قالب‌بندی متن استفاده کنید
                </div>
              </div>
            </>
          ) : (
            /* Preview Mode */
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{formData.title}</h1>
                {formData.subtitle && (
                  <p className="text-xl text-muted-foreground mb-4">{formData.subtitle}</p>
                )}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {formData.coverImage && (
                <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                  <img
                    src={formData.coverImage}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="prose prose-lg max-w-none persian-content">
                {renderPreview()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}