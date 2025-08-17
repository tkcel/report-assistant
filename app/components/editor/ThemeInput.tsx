'use client'

import { useState, useCallback } from 'react'
import { Upload, Link, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils/cn'

interface ThemeInputProps {
  onNext: () => void
}

export function ThemeInput({ onNext }: ThemeInputProps) {
  const [theme, setTheme] = useState('')
  const [pdfs, setPdfs] = useState<File[]>([])
  const [links, setLinks] = useState<string[]>([])
  const [newLink, setNewLink] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024
    )
    setPdfs(prev => [...prev, ...files])
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024
      )
      setPdfs(prev => [...prev, ...files])
    }
  }

  const removePdf = (index: number) => {
    setPdfs(prev => prev.filter((_, i) => i !== index))
  }

  const addLink = () => {
    if (newLink && links.length < 5 && !links.includes(newLink)) {
      setLinks(prev => [...prev, newLink])
      setNewLink('')
    }
  }

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index))
  }

  const isValid = theme.trim().length > 0 && theme.length <= 256

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">ステップ1: テーマ設定</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              レポートのテーマ <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="レポートのテーマを入力してください（例：AIが社会に与える影響について）"
              className="min-h-[100px]"
              maxLength={256}
            />
            <div className="text-sm text-gray-500 mt-1">
              {theme.length} / 256文字
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              PDFファイルをアップロード（任意）
            </label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-gray-300"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                ドラッグ&ドロップまたは
              </p>
              <label className="mt-2 cursor-pointer">
                <span className="text-primary hover:underline">ファイルを選択</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                PDF形式、最大10MB
              </p>
            </div>
            
            {pdfs.length > 0 && (
              <div className="mt-4 space-y-2">
                {pdfs.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)}MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removePdf(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              参考リンクを追加（任意、最大5個）
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-3 py-2 border rounded-md"
                disabled={links.length >= 5}
              />
              <Button
                onClick={addLink}
                disabled={!newLink || links.length >= 5}
                variant="outline"
              >
                <Link className="h-4 w-4 mr-2" />
                追加
              </Button>
            </div>
            
            {links.length > 0 && (
              <div className="mt-4 space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate flex-1"
                    >
                      {link}
                    </a>
                    <button
                      onClick={() => removeLink(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!isValid}>
          次へ進む
        </Button>
      </div>
    </div>
  )
}