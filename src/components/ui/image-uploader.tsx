"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { useRef } from "react";

interface ImageUploaderProps {
  preview: string | null;
  fileName?: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  round?: boolean;
  size?: number;
  placeholder?: string;
}

export function ImageUploader({
  preview,
  fileName,
  onFileSelect,
  round = false,
  size = 80,
  placeholder = "Click to upload a photo",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shapeClass = round ? "rounded-full" : "rounded-2xl";
  const borderClass = "border-2 border-dashed border-slate-300 dark:border-slate-600";
  const bgClass = "bg-slate-50 dark:bg-white/5";

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`flex ${round ? "" : `h-20 w-20`} items-center justify-center ${shapeClass} ${borderClass} ${bgClass} text-slate-400 transition hover:border-teal-400 hover:text-teal-500`}
        style={round ? { width: size, height: size } : undefined}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Preview"
            width={round ? size : 80}
            height={round ? size : 80}
            unoptimized
            className={`${shapeClass} object-cover`}
            style={round ? { width: size, height: size } : { width: 80, height: 80 }}
          />
        ) : (
          <ImagePlus className="h-6 w-6" />
        )}
      </button>
      <span className="text-sm text-[var(--muted)]">
        {fileName ?? placeholder}
      </span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelect}
      />
    </div>
  );
}
