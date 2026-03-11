"use client";

import { useTranslations } from "next-intl";
import { useState, useRef } from "react";
import { updateRecipe, updateRecipeImage } from "@/lib/actions/recipes";
import type { Recipe } from "@/lib/db/schema";

export function RecipeEditor({ recipe, existingFlavors = [] }: { recipe: Recipe; existingFlavors?: string[] }) {
  const t = useTranslations("admin.recipes");
  const tc = useTranslations("common");
  const [imageUrl, setImageUrl] = useState(recipe.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", recipe.name);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        // Auto-save image to database immediately
        await updateRecipeImage(recipe.id, data.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={updateRecipe} className="card space-y-4">
      <input type="hidden" name="id" value={recipe.id} />
      <input type="hidden" name="imageUrl" value={imageUrl} />

      {/* Image upload */}
      <div>
        <label className="block text-sm text-text-secondary mb-1">
          {t("image")}
        </label>
        {imageUrl && (
          <div className="mb-2 relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-bg-secondary">
            <img
              src={imageUrl}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary text-sm"
          >
            {uploading ? "..." : imageUrl ? t("changeImage") : t("uploadImage")}
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={async () => {
                setImageUrl("");
                await updateRecipeImage(recipe.id, null);
              }}
              className="text-xs text-text-muted hover:text-accent-burgundy transition-colors"
            >
              {tc("delete")}
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">
          {t("name")}
        </label>
        <input name="name" required defaultValue={recipe.name} className="input" />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">
          {t("description")}
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={recipe.description || ""}
          className="input"
        />
      </div>

      {/* Guest-facing fields */}
      <div>
        <label className="block text-sm text-text-secondary mb-1">
          {t("flavor")}
        </label>
        <input
          name="flavor"
          defaultValue={recipe.flavor || ""}
          placeholder="e.g. 酸甜, 清爽"
          className="input"
          list="flavor-options"
          autoComplete="off"
        />
        <datalist id="flavor-options">
          {existingFlavors.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">
          {t("characteristics")}
        </label>
        <input
          name="characteristics"
          defaultValue={recipe.characteristics || ""}
          placeholder="e.g. 经典威士忌鸡尾酒，醇厚回甘"
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("abv")}
          </label>
          <input
            name="abv"
            type="number"
            step="0.1"
            min="0"
            max="100"
            defaultValue={recipe.abv ?? ""}
            placeholder="e.g. 25"
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("price")}
          </label>
          <input
            name="price"
            type="number"
            step="1"
            min="0"
            defaultValue={recipe.price ?? ""}
            placeholder="e.g. 68"
            className="input"
          />
        </div>
      </div>

      <div className="divider my-2">
        <span className="text-text-muted text-xs">Bartender Notes</span>
      </div>

      {/* Bartender-only fields */}
      <div>
        <label className="block text-sm text-text-secondary mb-1">
          {t("instructions")}
        </label>
        <textarea
          name="instructions"
          rows={4}
          defaultValue={recipe.instructions || ""}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">
          {t("glassType")}
        </label>
        <select
          name="glassType"
          className="input"
          defaultValue={recipe.glassType || "rocks"}
        >
          <option value="rocks">Rocks</option>
          <option value="coupe">Coupe</option>
          <option value="highball">Highball</option>
          <option value="collins">Collins</option>
          <option value="flute">Flute</option>
          <option value="nick-nora">Nick & Nora</option>
        </select>
      </div>

      <button type="submit" className="btn-primary text-sm">
        {tc("save")}
      </button>
    </form>
  );
}
