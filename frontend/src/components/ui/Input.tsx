import React, { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: LucideIcon
    rightIcon?: React.ReactNode
    helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon: Icon, rightIcon, helperText, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {Icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full bg-white dark:bg-gray-800 
                            border border-gray-300 dark:border-gray-700 
                            rounded-xl shadow-sm 
                            py-2.5 ${Icon ? 'pl-10' : 'pl-4'} ${rightIcon ? 'pr-10' : 'pr-4'}
                            text-gray-900 dark:text-white 
                            placeholder-gray-400 dark:placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200
                            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                            ${className}
                        `}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-sm text-red-500 animate-slide-up">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
