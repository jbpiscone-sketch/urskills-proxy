// /api/r/[id].ts
export default async function handler(req, res) {
  const { id } = req.query; // récupère l'ID dans l'URL

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const REPORT_BUCKET = process.env.REPORT_BUCKET || "reports";

  // Si l'utilisateur passe déjà une extension (.html/.pdf), on la garde.
  const hasExt = /\.[a-z0-9]+$/i.test(String(id));
  const key = hasExt ? String(id) : `${id}.html`;

  // URL du fichier public dans Supabase
  const path = `${SUPABASE_URL}/storage/v1/object/public/${REPORT_BUCKET}/${encodeURIComponent(key)}`;

  const r = await fetch(path, { cache: "no-store" });
  if (!r.ok) {
    res.status(404).send("Report not ready");
    return;
  }
  const buf = Buffer.from(await r.arrayBuffer());

  // Type MIME selon extension
  const isPDF = /\.pdf$/i.test(key);
  res.setHeader("Content-Type", isPDF ? "application/pdf" : "text/html; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(buf);
}
