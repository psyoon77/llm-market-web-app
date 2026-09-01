"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type EditableImage = {
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

export default function EditProductForm({
  productId,
  initialTitle,
  initialBody,
  initialImages,
}: {
  productId: number;
  initialTitle: string;
  initialBody: string;
  initialImages: { url: string; caption: string }[];
}) {
  const router = useRouter();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [images, setImages] = useState<EditableImage[]>(
    initialImages.map((img) => ({
      id: makeImageId(),
      url: img.url,
      caption: img.caption || "",
      previewUrl: img.url,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const hasEmptySlot = useMemo(
    () => images.some((img) => !img.url.trim()),
    [images]
  );

  const canAddImage =
    images.length < 3 && !hasEmptySlot && !isSaving && !isProcessingImage;

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

  async function replaceImage(id: string, file: File | null) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Only jpg, jpeg, png allowed");
      const input = fileInputRefs.current[id];
      if (input) input.value = "";
      return;
    }

    setIsProcessingImage(true);

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
      alert("Image processing failed");
    } finally {
      setIsProcessingImage(false);
      const input = fileInputRefs.current[id];
      if (input) input.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isProcessingImage) {
      alert("Please wait until image processing finishes.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (!cleanTitle || !cleanBody) {
      alert("Title and body are required.");
      return;
    }

    setIsSaving(true);

    try {
      const cleanedImages = images
        .map((img) => ({
          url: img.url.trim(),
          caption: img.caption.trim(),
        }))
        .filter((img) => img.url);

      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          body: cleanBody,
          images: cleanedImages,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update product");
        setIsSaving(false);
        return;
      }

      router.replace(`/products/${productId}`);
      router.refresh();
    } catch {
      alert("Failed to update product");
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block font-medium mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full min-h-[44px] border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Body</label>
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border rounded px-3 py-2 min-h-[220px]"
          required
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-500">
          You can upload up to 3 images. Add them one by one.
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
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 border rounded disabled:opacity-50 w-full sm:w-auto"
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
                  alt={img.caption || `Image ${index + 1}`}
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
                type="text"
                value={img.caption}
                onChange={(e) => updateCaption(img.id, e.target.value)}
                className="w-full min-h-[44px] border rounded px-3 py-2"
                placeholder="Optional caption"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <label className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 border rounded cursor-pointer w-full sm:w-auto">
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
          disabled={isSaving || isProcessingImage}
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60 w-full sm:w-auto"
        >
          {isSaving
            ? "Saving..."
            : isProcessingImage
            ? "Processing..."
            : "Save Changes"}
        </button>

        <Link
          href={`/products/${productId}`}
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded border w-full sm:w-auto"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
