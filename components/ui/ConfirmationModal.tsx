'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    isLoading = false
}: ConfirmationModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <Trash2 className="w-6 h-6 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="w-6 h-6 text-amber-600" />;
            case 'info':
                return <Info className="w-6 h-6 text-blue-600" />;
            case 'success':
                return <CheckCircle className="w-6 h-6 text-green-600" />;
            default:
                return <AlertCircle className="w-6 h-6 text-gray-600" />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'warning':
                return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
            case 'info':
                return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
            case 'success':
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            default:
                return 'bg-gray-900 hover:bg-gray-800 focus:ring-gray-500';
        }
    };

    const getIconBgColor = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-100';
            case 'warning':
                return 'bg-amber-100';
            case 'info':
                return 'bg-blue-100';
            case 'success':
                return 'bg-green-100';
            default:
                return 'bg-gray-100';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={isLoading ? undefined : onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        aria-hidden="true"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${getIconBgColor()}`}>
                                    {getIcon()}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-1">
                                    <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
                                        {title}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                        {message}
                                    </p>
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-shrink-0 -mt-1 -mr-1 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5693C1]"
                                >
                                    <span className="sr-only">Close</span>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
