import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { X, Copy, Trash2, Eye, Download } from 'lucide-react'
import { memeAPI } from '../api/client'
import LazyImage from './LazyImage'
import type { MemeModalProps } from '../types'

export default function MemeModal({ meme, onClose }: MemeModalProps) {
    const queryClient = useQueryClient()
    const isTextMeme = meme.type === 'text'

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    const deleteMutation = useMutation({
        mutationFn: () => memeAPI.delete(meme.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memes'] })
            onClose()
        },
        onError: (error: any) => {
            console.error('Delete error:', error)
            toast.error('删除失败: ' + (error.response?.data?.error || error.message))
        }
    })

    const handleCopy = async () => {
        if (isTextMeme) {
            try {
                await navigator.clipboard.writeText(meme.textContent!)
                toast.success('文字已复制到剪贴板！')
            } catch (err) {
                console.error('Copy error:', err)
                toast.error('复制失败')
            }
        } else {
            try {
                const response = await fetch(meme.originalUrl!)
                const blob = await response.blob()
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ])
                toast.success('图片已复制到剪贴板！')
            } catch (err) {
                console.error('Copy error:', err)
                toast.error('复制失败')
            }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-slide-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-full md:w-2/3 bg-black/5 dark:bg-black/20 flex items-center justify-center p-4 md:p-8 overflow-auto">
                    {isTextMeme ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl">
                            <p className="text-2xl font-medium text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                                {meme.textContent}
                            </p>
                        </div>
                    ) : (
                        <LazyImage
                            src={meme.originalUrl}
                            alt={meme.title || 'Meme'}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            isGif={meme.mimeType?.includes('gif')}
                        />
                    )}
                </div>

                <div className="w-full md:w-1/3 p-6 md:p-8 overflow-y-auto bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800">
                    <div className="space-y-6">
                        <div>
                            {meme.title && (
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {meme.title}
                                </h2>
                            )}
                            {meme.description && (
                                <p className="text-gray-600 dark:text-gray-400">
                                    {meme.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <span>{meme.viewCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                <span>{meme.downloadCount}</span>
                            </div>
                        </div>

                        {meme.tags && meme.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {meme.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium"
                                    >
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="space-y-3 pt-4">
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-primary-500/30"
                            >
                                <Copy className="w-5 h-5" />
                                <span>{isTextMeme ? '复制文字' : '复制图片'}</span>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (window.confirm('确定要删除这个 Meme 吗?')) {
                                        console.log('Deleting meme:', meme.id)
                                        deleteMutation.mutate()
                                    }
                                }}
                                disabled={deleteMutation.isPending}
                                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-5 h-5" />
                                <span>{deleteMutation.isPending ? '删除中...' : '删除'}</span>
                            </button>
                        </div>

                        <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1.5 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <p>类型: {isTextMeme ? '文字梗' : '图片梗'}</p>
                            {!isTextMeme && (
                                <>
                                    <p>文件名: {meme.filename}</p>
                                    <p>大小: {((meme.fileSize || 0) / 1024 / 1024).toFixed(2)} MB</p>
                                    <p>尺寸: {meme.width} × {meme.height}</p>
                                </>
                            )}
                            <p>创建时间: {new Date(meme.createdAt).toLocaleString('zh-CN')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
