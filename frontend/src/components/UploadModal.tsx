import { useState } from 'react'
import { X, Upload as UploadIcon, Loader2, Image, FileText } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memeAPI } from '../api/client'
import type { UploadModalProps } from '../types'

export default function UploadModal({ onClose }: UploadModalProps) {
    const [type, setType] = useState<'image' | 'text'>('image')
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        textContent: ''
    })

    const queryClient = useQueryClient()

    const uploadMutation = useMutation({
        mutationFn: (data: FormData) => memeAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memes'] })
            onClose()
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files?.[0]
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            setFile(droppedFile)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(droppedFile)
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const data = new FormData()
        data.append('type', type)
        data.append('title', formData.title)
        data.append('description', formData.description)

        if (formData.tags) {
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            data.append('tags', JSON.stringify(tagsArray))
        }

        if (type === 'text') {
            if (!formData.textContent) return
            data.append('textContent', formData.textContent)
        } else {
            if (!file) return
            data.append('file', file)
        }

        uploadMutation.mutate(data)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">上传 Meme</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setType('image')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                                type === 'image'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                        >
                            <Image className="w-5 h-5" />
                            <span className="font-medium">图片梗</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('text')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                                type === 'text'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span className="font-medium">文字梗</span>
                        </button>
                    </div>

                    {type === 'image' && (
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-pointer"
                        >
                        {preview ? (
                            <div className="relative">
                                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null)
                                        setPreview(null)
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                                <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    拖拽图片到这里或点击上传
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    支持 JPG, PNG, GIF, WebP
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                        </div>
                    )}

                    {type === 'text' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                文字内容 *
                            </label>
                            <textarea
                                value={formData.textContent}
                                onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none font-mono"
                                placeholder="输入你的文字梗内容..."
                                required={type === 'text'}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            标题 (可选)
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="给你的 Meme 起个名字"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            描述 (可选)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                            placeholder="描述一下这个 Meme"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            标签 (用逗号分隔)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="搞笑, 表情包, 流行"
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={
                                (type === 'image' && !file) ||
                                (type === 'text' && !formData.textContent) ||
                                uploadMutation.isPending
                            }
                            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            {uploadMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{type === 'image' ? '上传中...' : '创建中...'}</span>
                                </>
                            ) : (
                                <span>{type === 'image' ? '上传' : '创建'}</span>
                            )}
                        </button>
                    </div>

                    {uploadMutation.isError && (
                        <p className="text-red-500 text-sm text-center">
                            上传失败，请重试
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
