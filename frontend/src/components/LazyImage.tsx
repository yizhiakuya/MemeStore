import { useState, useRef, useEffect } from 'react'

interface LazyImageProps {
    src?: string
    alt: string
    className?: string
    onClick?: () => void
    isGif?: boolean
}

export default function LazyImage({ src, alt, className, onClick, isGif = false }: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const [isGifPlaying, setIsGifPlaying] = useState(false)
    const imgRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true)
                        observer.unobserve(entry.target)
                    }
                })
            },
            {
                rootMargin: '50px'
            }
        )

        if (imgRef.current) {
            observer.observe(imgRef.current)
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current)
            }
        }
    }, [])

    const handleMouseEnter = () => {
        if (isGif) {
            setIsGifPlaying(true)
        }
    }

    const handleMouseLeave = () => {
        if (isGif) {
            setIsGifPlaying(false)
        }
    }

    return (
        <div 
            ref={imgRef} 
            className={`relative overflow-hidden ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {!isLoaded && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            )}
            {isInView && src && (
                <>
                    <img
                        src={isGif && !isGifPlaying ? src.replace('.gif', '-static.jpg') : src}
                        alt={alt}
                        className={`transition-opacity duration-300 ${
                            isLoaded ? 'opacity-100' : 'opacity-0'
                        } ${className}`}
                        onLoad={() => setIsLoaded(true)}
                        onClick={onClick}
                        loading="lazy"
                    />
                    {isGif && !isGifPlaying && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md font-medium">
                            GIF
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
