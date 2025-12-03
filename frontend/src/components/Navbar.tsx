import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
    const [darkMode, setDarkMode] = useState(() => {
        // 从localStorage读取主题设置，如果没有则使用系统偏好
        const saved = localStorage.getItem('theme')
        if (saved) {
            return saved === 'dark'
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [darkMode])

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm' : 'bg-transparent'}`}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                    MemeStore
                </Link>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                    >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </nav>
    )
}
