import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { memeAPI } from '../api/client'
import MemeGrid from '../components/MemeGrid'
import MemeModal from '../components/MemeModal'
import UploadModal from '../components/UploadModal'
import MemeCardSkeleton from '../components/MemeCardSkeleton'
import Hero from '../components/Hero'
import { Button } from '../components/ui/Button'
import type { Meme } from '../types'

export default function Home() {
    const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
    const [showUpload, setShowUpload] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['memes'],
        queryFn: () => memeAPI.getAll().then(res => res.data)
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Hero />

            <div className="container mx-auto px-6 pb-20">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
                        最新梗图
                    </h2>
                    <Button
                        onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>上传梗图</span>
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <MemeCardSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <MemeGrid memes={data?.data || []} onMemeClick={setSelectedMeme} />
                )}
            </div>

            {selectedMeme && (
                <MemeModal meme={selectedMeme} onClose={() => setSelectedMeme(null)} />
            )}

            {showUpload && (
                <UploadModal onClose={() => setShowUpload(false)} />
            )}
        </div>
    )
}
