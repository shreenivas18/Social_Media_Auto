import Image from 'next/image';
import React from 'react';

interface CardProps {
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  hoverTheme: 'blog' | 'linkedin' | 'twitter';
}

export default function GeneratorCard({ tag, title, description, imageUrl, hoverTheme }: CardProps) {
  const themeClasses = {
    blog: {
      bg: 'group-hover:bg-emerald-900/70',
      tag: 'group-hover:text-emerald-200 group-hover:border-emerald-300/60',
      button: 'group-hover:text-emerald-300 group-hover:border-emerald-300/60',
    },
    linkedin: {
      bg: 'group-hover:bg-sky-900/70',
      tag: 'group-hover:text-sky-200 group-hover:border-sky-300/60',
      button: 'group-hover:text-sky-300 group-hover:border-sky-300/60',
    },
    twitter: {
      bg: 'group-hover:bg-sky-900/70',
      tag: 'group-hover:text-sky-200 group-hover:border-sky-300/60',
      button: 'group-hover:text-sky-300 group-hover:border-sky-300/60',
    }
  };

  const currentTheme = themeClasses[hoverTheme];
  return (
    <div className="w-80 flex-shrink-0 group">
      <div className={`relative card-border overflow-hidden rounded-2xl flex flex-col animate-float bg-zinc-900/50 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 ${currentTheme.bg}`}>
        <div className="p-4 flex justify-center relative">
          <div className="w-full h-48 rounded-xl gradient-border inner-glow overflow-hidden relative">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              style={{ objectFit: 'cover' }}
              className="group-hover:scale-105 transition-transform duration-300"
              priority={false}
            />
          </div>
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="p-4">
          <span className={`inline-block px-3 py-1 glass text-indigo-300 rounded-full text-xs font-medium mb-3 border border-indigo-400/30 transition-colors duration-300 ${currentTheme.tag}`}>{tag}</span>
          <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
          <p className="text-white/70 mb-4 leading-relaxed text-xs">
            {description}
          </p>
          <div className="flex justify-between items-center">
            <span className={`text-indigo-400 transition flex items-center text-xs font-medium glass px-3 py-1.5 rounded-lg border border-indigo-400/30 transition-colors duration-300 ${currentTheme.button}`}>
              Generate
              <svg className="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className="text-white/50 text-xs glass px-2 py-1 rounded-full border border-white/10">AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
