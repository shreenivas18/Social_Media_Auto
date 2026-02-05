"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Verified } from 'lucide-react';

interface TwitterPreviewProps {
    content: string;
    characterCount: number;
}

const TwitterPreview: React.FC<TwitterPreviewProps> = ({ content, characterCount }) => {
    const maxLength = 280;
    const percentage = (characterCount / maxLength) * 100;

    // Color coding for character count
    const getCounterColor = () => {
        if (percentage >= 100) return 'text-red-500';
        if (percentage >= 90) return 'text-yellow-500';
        return 'text-gray-400';
    };

    // Highlight hashtags in the content
    const formatContent = (text: string) => {
        if (!text) return '';
        return text.replace(/(#\w+)/g, '<span class="text-sky-400">$1</span>');
    };

    return (
        <Card className="bg-black border-gray-800 w-full max-w-lg shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                            <AvatarFallback className="bg-sky-600 text-white">AI</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-1">
                                <span className="font-bold text-white text-[15px]">AI Content Team</span>
                                <Verified className="w-4 h-4 text-sky-400 fill-sky-400" />
                            </div>
                            <span className="text-gray-500 text-sm">@aicontentteam</span>
                        </div>
                    </div>
                    <button className="text-gray-500 hover:text-gray-300 p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </CardHeader>

            <CardContent className="pt-1 pb-3">
                {content ? (
                    <p
                        className="text-white text-[15px] leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
                    />
                ) : (
                    <p className="text-gray-500 text-[15px] leading-relaxed italic">
                        Your generated tweet will appear here...
                    </p>
                )}

                {/* Timestamp */}
                <div className="flex items-center space-x-2 mt-4 text-gray-500 text-sm">
                    <span>12:00 PM</span>
                    <span>·</span>
                    <span>Feb 5, 2026</span>
                    <span>·</span>
                    <span className="text-sky-400">Twitter Web App</span>
                </div>
            </CardContent>

            {/* Engagement Stats */}
            <div className="px-4 py-3 border-t border-b border-gray-800">
                <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-1">
                        <span className="font-bold text-white">128</span>
                        <span className="text-gray-500">Retweets</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="font-bold text-white">24</span>
                        <span className="text-gray-500">Quotes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="font-bold text-white">1,024</span>
                        <span className="text-gray-500">Likes</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <CardFooter className="py-2 px-2">
                <div className="flex justify-around w-full">
                    <button className="flex items-center justify-center p-3 text-gray-500 hover:text-sky-400 hover:bg-sky-400/10 rounded-full transition-colors">
                        <MessageCircle className="w-5 h-5" />
                    </button>
                    <button className="flex items-center justify-center p-3 text-gray-500 hover:text-green-500 hover:bg-green-500/10 rounded-full transition-colors">
                        <Repeat2 className="w-5 h-5" />
                    </button>
                    <button className="flex items-center justify-center p-3 text-gray-500 hover:text-pink-500 hover:bg-pink-500/10 rounded-full transition-colors">
                        <Heart className="w-5 h-5" />
                    </button>
                    <button className="flex items-center justify-center p-3 text-gray-500 hover:text-sky-400 hover:bg-sky-400/10 rounded-full transition-colors">
                        <Share className="w-5 h-5" />
                    </button>
                </div>
            </CardFooter>

            {/* Character Count Indicator */}
            {content && (
                <div className="px-4 pb-4 flex items-center justify-end space-x-2">
                    <div className={`text-sm font-medium ${getCounterColor()}`}>
                        {characterCount} / {maxLength}
                    </div>
                    <div className="w-8 h-8 relative">
                        <svg className="w-8 h-8 -rotate-90">
                            <circle
                                cx="16"
                                cy="16"
                                r="12"
                                className="fill-none stroke-gray-700"
                                strokeWidth="3"
                            />
                            <circle
                                cx="16"
                                cy="16"
                                r="12"
                                className={`fill-none ${percentage >= 100 ? 'stroke-red-500' : percentage >= 90 ? 'stroke-yellow-500' : 'stroke-sky-400'}`}
                                strokeWidth="3"
                                strokeDasharray={`${Math.min(percentage, 100) * 0.754} 75.4`}
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default TwitterPreview;
