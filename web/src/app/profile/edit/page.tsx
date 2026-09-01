"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UploadedImage = {
  id: string;
  url: string;
  caption: string;
  previewUrl: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function makeImageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const IMAGE_FRAME_CLASS =
  "border rounded p-2 h-64 sm:h-72 flex items-center justify-center bg-white overflow-hidden";

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [profileTitle, setProfileTitle] = useState("");
  const [profileBody, setProfileBody] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  const hasEmptySlot = useMemo(
    () => images.some((img) => !img.url.trim()),
    [images]
  );

  const canAddImage =
    images.length < 3 && !hasEmptySlot && !uploading && !isSaving;

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setProfileTitle(data?.profileTitle || "");
        setProfileBody(data?.profileBody || "");
        setImages(
          Array.isArray(data?.images)
            ? data.images.slice(0, 3).map((img: any) => ({
                id: makeImageId(),
                url: img.url,
                caption: img.caption || "",
                previewUrl: img.url,
              }))
            : []
        );
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  function addImageSlot() {
    if (!canAddImage) return;

    setImages((prev) => [
      ...prev,
      {
        id: makeImageId(),
        url: "",
        caption: "",
        previewUrl: "",
      },
    ]);
  }

  async function replaceImage(id: string, file: File | null) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setError("Only jpg, jpeg, png allowed");
      const input = fileInputRefs.current[id];
      if (input) input.value = "";
      return;
    }

    setUploading(true);
    setError("");

    try {
      const dataUrl = await fileToDataUrl(file);

      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? {
                ...img,
                url: dataUrl,
                previewUrl: dataUrl,
              }
            : img
        )
      );
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      const input = fileInputRefs.current[id];
      if (input) input.value = "";
    }
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
    const input = fileInputRefs.current[id];
    if (input) input.value = "";
  }

  function updateCaption(id: string, caption: string) {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (uploading) {
      setError("Please wait until image processing finishes.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileTitle: profileTitle.trim(),
          profileBody: profileBody.trim(),
          images: images
            .map(({ url, caption }) => ({
              url: url.trim(),
              caption: caption.trim(),
            }))
            .filter((img) => img.url),
        }),
      });

      if (!res.ok) {
        setError("Failed to save profile");
        setIsSaving(false);
        return;
      }

      router.replace("/profile");
      router.refresh();
    } catch {
      setError("Failed to save profile");
      setIsSaving(false);
    }
  }

  if (loadingProfile) {
    return <div className="container mx-auto max-w-2xl p-4 sm:p-5">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Edit Profile</h1>
        <Link
          href="/profile"
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded border w-full sm:w-auto"
        >
          Back to Profile
        </Link>
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Profile Title</label>
          <input
            value={profileTitle}
            onChange={(e) => setProfileTitle(e.target.value)}
            placeholder="Profile title"
            className="w-full min-h-[44px] border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Profile Description</label>
          <textarea
            value={profileBody}
            onChange={(e) => setProfileBody(e.target.value)}
            placeholder="Profile description"
            className="w-full border rounded px-3 py-2 min-h-[180px]"
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            You can upload up to 3 profile images. Add them one by one.
          </p>
          <p className="text-sm text-gray-600">
            Images selected:{" "}
            <span className="font-medium">
              {images.filter((img) => img.url).length}/3
            </span>
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="block font-medium">Images</label>
            <button
              type="button"
              onClick={addImageSlot}
              disabled={!canAddImage}
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded border disabled:opacity-50 w-full sm:w-auto"
            >
              Add Image
            </button>
          </div>

          {images.length === 0 && (
            <div className="text-sm text-gray-500">No images yet.</div>
          )}

          {images.map((img, index) => (
            <div key={img.id} className="border rounded p-3 sm:p-4 flex flex-col gap-3">
              {img.previewUrl ? (
                <div className={IMAGE_FRAME_CLASS}>
                  <img
                    src={img.previewUrl}
                    alt=""
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>
              ) : (
                <div className={`${IMAGE_FRAME_CLASS} text-sm text-gray-500`}>
                  No image selected yet. Click Add Image to choose one.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Image ({index + 1}/3)
                </label>
                <input
                  value={img.caption}
                  onChange={(e) => updateCaption(img.id, e.target.value)}
                  placeholder="Optional caption"
                  className="w-full min-h-[44px] border rounded px-3 py-2"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <label className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded border cursor-pointer w-full sm:w-auto">
                  {img.url ? "Replace Image" : "Add Image"}
                  <input
                    ref={(el) => {
                      fileInputRefs.current[img.id] = el;
                    }}
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) =>
                      replaceImage(img.id, e.target.files?.[0] || null)
                    }
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 border rounded text-red-600 w-full sm:w-auto"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={uploading || isSaving}
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 w-full sm:w-auto"
          >
            {uploading ? "Processing..." : isSaving ? "Saving..." : "Save Profile"}
          </button>

          <Link
            href="/profile"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded border w-full sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
