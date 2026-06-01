import type { Metadata } from "next";
import { Suspense } from "react";
import DetailClient from "./DetailClient";

const API_BASE = "https://api.getitsju.com";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/registration/${id}`, {
      cache: "no-store",
      headers: { Authorization: "Bearer " },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const item = data.result;
    const typeLabel = item.itemType === "LOST" ? "분실물" : "습득물";
    const description = [typeLabel, item.location, item.occurredDate?.replace(/-/g, ".")]
      .filter(Boolean)
      .join(" · ");
    return {
      title: `${item.title} | GET IT`,
      description,
      openGraph: {
        title: item.title,
        description,
        ...(item.imageUrl && { images: [{ url: item.imageUrl }] }),
        type: "website",
      },
      twitter: {
        card: item.imageUrl ? "summary_large_image" : "summary",
        title: item.title,
        description,
        ...(item.imageUrl && { images: [item.imageUrl] }),
      },
    };
  } catch {
    return { title: "GET IT" };
  }
}

export default function DetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
        </div>
      }
    >
      <DetailClient />
    </Suspense>
  );
}
