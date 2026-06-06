"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePhotoUploader({
  userId,
  username,
  currentAvatarUrl,
  currentAvatarPath,
}: {
  userId: string;
  username: string;
  currentAvatarUrl: string | null;
  currentAvatarPath: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadPhoto(file: File) {
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Please choose an image under 5 MB.");
      return;
    }

    setUploading(true);

    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const safeExtension = ["png", "jpg", "jpeg", "webp", "gif"].includes(extension)
      ? extension
      : "png";
    const path = `${userId}/avatar-${Date.now()}.${safeExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      setUploading(false);
      setMessage(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(path);

    const avatarUrl = publicUrlData.publicUrl;

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          username,
          avatar_url: avatarUrl,
          avatar_path: path,
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      setUploading(false);
      setMessage(profileError.message);
      return;
    }

    if (currentAvatarPath && currentAvatarPath !== path) {
      await supabase.storage.from("profile-photos").remove([currentAvatarPath]);
    }

    setPreviewUrl(avatarUrl);
    setUploading(false);
    setMessage("Profile photo updated.");
    router.refresh();
  }

  async function removePhoto() {
    setUploading(true);
    setMessage("");

    if (currentAvatarPath) {
      await supabase.storage.from("profile-photos").remove([currentAvatarPath]);
    }

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null, avatar_path: null })
      .eq("user_id", userId);

    setUploading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPreviewUrl(null);
    setMessage("Profile photo removed.");
    router.refresh();
  }

  const initial = String(username || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
        {previewUrl ? (
          <img src={previewUrl} alt="Profile" className="tu-profile-preview-large" />
        ) : (
          <div
            className="tu-profile-preview-large"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
              fontWeight: 1000,
              fontSize: "42px",
            }}
          >
            {initial}
          </div>
        )}

        <div>
          <div className="sw-kicker">Display Profile</div>
          <h2 style={{ margin: "8px 0 6px", letterSpacing: "0.08em" }}>{username}</h2>
          <div className="sw-muted">
            This image appears next to your username in the top navigation.
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) uploadPhoto(file);
        }}
      />

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          className="sw-button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Choose Photo"}
        </button>

        <button
          type="button"
          className="sw-button"
          onClick={removePhoto}
          disabled={uploading || !previewUrl}
        >
          Remove Photo
        </button>
      </div>

      {message ? <div className="sw-muted">{message}</div> : null}
    </div>
  );
}
