import { assetUrl } from "../../utils/format";

export function ImageThumb({ src, alt }: { src: string | null | undefined; alt: string }) {
  const u = assetUrl(src || undefined);
  if (!u) {
    return <div className="m-thumb m-thumb--ph" aria-hidden />;
  }
  return <img className="m-thumb" src={u} alt={alt} loading="lazy" />;
}
