import Masonry from 'react-masonry-css'
import MemeCard from './MemeCard'
import type { Meme } from '../types'

interface MemeGridProps {
    memes: Meme[]
    onMemeClick: (meme: Meme) => void
}

export default function MemeGrid({ memes, onMemeClick }: MemeGridProps) {
    const breakpointColumns = {
        default: 4,
        1280: 3,
        768: 2,
        640: 1
    }

    if (!memes || memes.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 dark:text-gray-400">暂无内容</p>
            </div>
        )
    }

    return (
        <Masonry
            breakpointCols={breakpointColumns}
            className="flex -ml-4 w-auto"
            columnClassName="pl-4 bg-clip-padding"
        >
            {memes.map((meme) => (
                <div key={meme.id} className="mb-4">
                    <MemeCard meme={meme} onClick={onMemeClick} />
                </div>
            ))}
        </Masonry>
    )
}
