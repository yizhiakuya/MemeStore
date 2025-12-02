import { Copy, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { memeAPI } from '../api/client'
import LazyImage from './LazyImage'
import type { MemeCardProps } from '../types'

export default function MemeCard({ meme, onClick }: MemeCardProps) {
    const isTextMeme = meme.type === 'text'
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: () => memeAPI.delete(meme.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memes'] })
            toast.success('删除成功')
        },
        onError: (error: any) => {
            console.error('Delete error:', error)
            toast.error('删除失败: ' + (error.response?.data?.error || error.message))
        }
    })

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation()
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
                toast.error('复制失败，请尝试手动下载')
            }
        }
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (window.confirm('确定要删除这个 Meme 吗?')) {
            deleteMutation.mutate()
        }
    }

    return (
        <div
            className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 animate-fade-in border border-gray-100 dark:border-gray-700 cursor-pointer"
            onClick={() => onClick?.(meme)}
        >
            {/* Delete Button - Top Right */}
            <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    title="删除"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Center Copy Prompt */}
            <div
                className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            >
                <button
                    onClick={handleCopy}
                    className="pointer-events-auto px-6 py-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white rounded-full font-medium shadow-xl backdrop-blur-md transform scale-90 group-hover:scale-100 transition-all duration-300 flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800"
                >
                    <Copy className="w-4 h-4" />
                    <span>点击复制</span>
                </button>
            </div>

            {isTextMeme ? (
                <div className="p-6 min-h-[200px] flex flex-col justify-center bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 relative">
                    <div className="text-gray-900 dark:text-white text-center">
                        <p className="text-lg font-medium leading-relaxed line-clamp-6 whitespace-pre-wrap">
                            {meme.textContent}
                        </p>
                    </div>
                    {meme.title && (
                        <h3 className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 font-bold text-sm text-gray-600 dark:text-gray-400 text-center">
                            {meme.title}
                        </h3>
                    )}
                </div>
            ) : (
                <div className="block relative overflow-hidden aspect-w-16 aspect-h-9">
                    <LazyImage
                        src={meme.thumbnailUrl}
                        alt={meme.title || 'Meme'}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 group-hover:blur-[2px]"
                        isGif={meme.mimeType?.includes('gif')}
                    />

                    {/* Dark overlay on hover to make text pop */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {meme.title && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="text-white font-bold text-sm line-clamp-2 text-center">
                                {meme.title}
                            </h3>
                        </div>
                    )}
                </div>
            )}

            {meme.tags && meme.tags.length > 0 && (
                <div className="p-3 flex flex-wrap gap-2 bg-white dark:bg-gray-800 relative z-10 border-t border-gray-100 dark:border-gray-700">
                    {meme.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag.id}
                            className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            #{tag.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
