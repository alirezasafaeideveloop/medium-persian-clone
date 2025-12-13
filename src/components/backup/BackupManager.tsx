'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Download, 
  Upload, 
  FileText, 
  Database, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface BackupOptions {
  posts: boolean
  bookmarks: boolean
  likes: boolean
  comments: boolean
  followers: boolean
  following: boolean
  publications: boolean
}

export function BackupManager() {
  const { data: session } = useSession()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportType, setExportType] = useState('json')
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    posts: true,
    bookmarks: true,
    likes: true,
    comments: true,
    followers: true,
    following: true,
    publications: true
  })
  const [importFile, setImportFile] = useState<File | null>(null)
  const [overwrite, setOverwrite] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleExport = async (type: string, postId?: string) => {
    if (!session) return

    setIsExporting(true)
    setProgress(0)

    try {
      const params = new URLSearchParams({ type })
      if (postId) params.set('postId', postId)

      const response = await fetch(`/api/export?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('خطا در خروجی گرفتن')
      }

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `export.${type}`

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setProgress(100)
      toast.success('خروجی با موفقیت دانلود شد')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('خطا در خروجی گرفتن')
    } finally {
      setIsExporting(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const handleBackup = async () => {
    if (!session) return

    setIsExporting(true)
    setProgress(0)

    try {
      const include = Object.entries(backupOptions)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(',')

      const response = await fetch(`/api/backup?include=${include}`)
      
      if (!response.ok) {
        throw new Error('خطا در ایجاد پشتیبان')
      }

      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'backup.json'

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setProgress(100)
      toast.success('پشتیبان با موفقیت ایجاد شد')
    } catch (error) {
      console.error('Backup error:', error)
      toast.error('خطا در ایجاد پشتیبان')
    } finally {
      setIsExporting(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const handleImport = async () => {
    if (!session || !importFile) return

    setIsImporting(true)
    setProgress(0)

    try {
      const fileContent = await importFile.text()
      const backupData = JSON.parse(fileContent)

      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backupData,
          overwrite
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'خطا در وارد کردن پشتیبان')
      }

      setProgress(100)
      toast.success(`بازنشانی با موفقیت انجام شد: ${data.results.posts} مقاله، ${data.results.bookmarks} نشان`)
      
      // Reload page after successful import
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Import error:', error)
      toast.error(error instanceof Error ? error.message : 'خطا در وارد کردن پشتیبان')
    } finally {
      setIsImporting(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/json') {
      setImportFile(file)
    } else {
      toast.error('لطفاً یک فایل JSON معتبر انتخاب کنید')
    }
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">نیاز به ورود به سیستم</h3>
          <p className="text-muted-foreground">
            برای دسترسی به ابزارهای خروجی و پشتیبان‌گیری، لطفاً وارد حساب کاربری خود شوید
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">مدیریت داده‌ها</h1>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">خروجی گرفتن</TabsTrigger>
          <TabsTrigger value="backup">پشتیبان‌گیری</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                خروجی گرفتن از داده‌ها
              </CardTitle>
              <CardDescription>
                داده‌های خود را در فرمت‌های مختلف خروجی بگیرید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="export-type">نوع خروجی</Label>
                <Select value={exportType} onValueChange={setExportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="نوع خروجی را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="pdf">PDF (به صورت Markdown)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleExport(exportType)}
                  disabled={isExporting}
                  className="flex items-center gap-2"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  خروجی تمام مقالات
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleExport(exportType, 'single')}
                  disabled={isExporting}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  خروجی مقاله خاص
                </Button>
              </div>

              {progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>در حال پردازش...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                ایجاد پشتیبان
              </CardTitle>
              <CardDescription>
                از تمام داده‌های خود یک نسخه پشتیبان کامل ایجاد کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>داده‌های مورد نظر برای پشتیبان:</Label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(backupOptions).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          setBackupOptions(prev => ({ ...prev, [key]: checked as boolean }))
                        }
                      />
                      <Label htmlFor={key} className="text-sm">
                        {key === 'posts' && 'مقالات'}
                        {key === 'bookmarks' && 'نشان‌شده‌ها'}
                        {key === 'likes' && 'لایک‌ها'}
                        {key === 'comments' && 'نظرات'}
                        {key === 'followers' && 'دنبال‌کنندگان'}
                        {key === 'following' && 'دنبال‌شده‌ها'}
                        {key === 'publications' && 'انتشارات'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleBackup}
                disabled={isExporting || !Object.values(backupOptions).some(v => v)}
                className="w-full flex items-center gap-2"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                ایجاد پشتیبان
              </Button>

              {progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>در حال ایجاد پشتیبان...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                بازنشانی پشتیبان
              </CardTitle>
              <CardDescription>
                فایل پشتیبان خود را برای بازنشانی داده‌ها آپلود کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="backup-file">فایل پشتیبان (JSON)</Label>
                <input
                  id="backup-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="mt-2 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/80"
                />
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="overwrite"
                  checked={overwrite}
                  onCheckedChange={(checked) => setOverwrite(checked as boolean)}
                />
                <Label htmlFor="overwrite">
                  بازنویسی داده‌های موجود (اخطار: این عمل غیرقابل بازگشت است)
                </Label>
              </div>

              <Button
                onClick={handleImport}
                disabled={!importFile || isImporting}
                variant="destructive"
                className="w-full flex items-center gap-2"
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                بازنشانی پشتیبان
              </Button>

              {progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>در حال بازنشانی...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  بازنشانی پشتیبان تمام داده‌های فعلی شما را پاک می‌کند. قبل از این کار حتماً یک پشتیبان جدید تهیه کنید.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}