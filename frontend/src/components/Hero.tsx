import { Search } from 'lucide-react';
import { Button } from './ui/Button';

export default function Hero() {
    return (
        <div className="relative overflow-hidden mb-12 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-gray-900/10"></div>
            <div className="relative container mx-auto px-6 py-24 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 animate-fade-in">
                    发现 & 分享 <br />
                    <span className="text-gray-900 dark:text-white">最有趣的梗图</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto animate-slide-up">
                    每日快乐源泉。收集、分享并享受来自网络的精彩瞬间。
                </p>

                <div className="max-w-xl mx-auto relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg shadow-blue-500/10 transition-all"
                        placeholder="搜索梗图、标签或分类..."
                    />
                    <div className="absolute inset-y-2 right-2">
                        <Button size="sm">搜索</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
