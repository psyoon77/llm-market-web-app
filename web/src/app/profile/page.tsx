export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/current-user";
import Link from "next/link";

const IMAGE_FRAME_CLASS =
  "border rounded p-2 h-64 sm:h-72 flex items-center justify-center bg-gray-50 overflow-hidden";

export default async function ProfilePage() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return <div className="p-4">Please sign in.</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: dbUser.id },
    include: { images: true },
  });

  if (!user) {
    return <div className="p-4">User not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-5 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold break-words">
          {user.name ? `${user.name}'s Profile` : "My Profile"}
        </h1>
        <Link
          href="/profile/edit"
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded bg-blue-600 text-white w-full sm:w-auto"
        >
          Edit Profile
        </Link>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold break-words">
          {user.profileTitle || "Your profile title"}
        </h2>

        <p className="text-gray-700 whitespace-pre-wrap break-words">
          {user.profileBody || "Tell people about yourself here."}
        </p>
      </div>

      {user.images.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user.images.map((img) => (
            <div key={img.id} className="border rounded p-2 sm:p-3 flex flex-col gap-3">
              <div className={IMAGE_FRAME_CLASS}>
                <img
                  src={img.url}
                  alt={img.caption || "Profile image"}
                  className="max-h-full max-w-full object-contain rounded"
                  loading="lazy"
                />
              </div>

              <div className="min-h-[24px]">
                {img.caption && (
                  <p className="text-sm text-gray-600 break-words">
                    {img.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded p-6 text-gray-500">
          No profile images yet. Click Edit Profile to upload up to 3 images.
        </div>
      )}
    </div>
  );
}
