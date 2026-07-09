"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { clientApi } from "@/lib/client-api";

interface FileUploadProps {
  value?: string | string[];
  onChange: (value: any) => void;
  maxFiles?: number; // 1 for single, >1 for multiple
  accept?: string;
  label?: string;
  helperText?: string;
}

export function FileUpload({
  value,
  onChange,
  maxFiles = 1,
  accept = "image/jpeg,image/png,image/webp,image/jpg",
  label,
  helperText = "JPEG, PNG or WEBP up to 5MB",
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get array of fileIds
  const fileIds = Array.isArray(value) ? value : value ? [value] : [];

  const handleUpload = async (files: FileList) => {
    if (files.length === 0) return;

    // Check if we exceed maxFiles
    if (maxFiles === 1 && files.length > 1) {
      toast.error("You can only upload 1 file");
      return;
    }

    if (maxFiles > 1 && fileIds.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files`);
      return;
    }

    // Validate size (5MB)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large (max 5MB)`);
        return;
      }
    }

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await clientApi.post("/files/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success && Array.isArray(res.data.files)) {
        const newFileIds = res.data.files.map((f: any) => f._id);

        if (maxFiles === 1) {
          onChange(newFileIds[0]);
        } else {
          onChange([...fileIds, ...newFileIds]);
        }
        toast.success("Files uploaded successfully");
      } else {
        toast.error("Failed to upload files");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to upload files";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files);
    }
  };

  const handleRemove = async (idToRemove: string) => {
    try {
      await clientApi.delete(`/files/${idToRemove}`);

      if (maxFiles === 1) {
        onChange("");
      } else {
        onChange(fileIds.filter((id) => id !== idToRemove));
      }
      toast.success("File removed");
    } catch {
      if (maxFiles === 1) {
        onChange("");
      } else {
        onChange(fileIds.filter((id) => id !== idToRemove));
      }
      toast.info("File removed from list");
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2 w-full">
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}

      {/* File Dropzone */}
      {(maxFiles === 1 && fileIds.length === 0) ||
      (maxFiles > 1 && fileIds.length < maxFiles) ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInput}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors min-h-[140px]
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/10"
            }
            ${isUploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxFiles > 1}
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Uploading files...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-muted rounded-full text-muted-foreground">
                <Upload className="h-5 w-5 text-foreground/70" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Drag & drop files here, or{" "}
                <span className="text-primary underline font-semibold">
                  browse
                </span>
              </p>
              {helperText && (
                <p className="text-xs text-muted-foreground">{helperText}</p>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Preview Grid */}
      {fileIds.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {fileIds.map((fileId) => {
            const url = `/api/files/view/${fileId}`;
            return (
              <div
                key={fileId}
                className="relative group aspect-square rounded-lg overflow-hidden border border-muted bg-muted flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Uploaded file preview"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.log(e, "lolo");
                    e.currentTarget.style.display = "none";
                    const fallback =
                      e.currentTarget.parentElement?.querySelector(
                        ".fallback-icon",
                      );
                    if (fallback) fallback.classList.remove("hidden");
                  }}
                />

                {/* Fallback Icon for non-images / errors */}
                <div className="fallback-icon hidden text-muted-foreground flex flex-col items-center">
                  <ImageIcon className="h-8 w-8 mb-1" />
                  <span className="text-xs">File Preview</span>
                </div>

                {/* Remove Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemove(fileId)}
                    className="p-2 bg-destructive/90 text-destructive-foreground rounded-full hover:bg-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
