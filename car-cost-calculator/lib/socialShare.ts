// Builds the standard "share intent" URLs each platform provides — these are
// just plain links that open that platform's own share dialog pre-filled
// with our text/URL. No API keys, no app registration needed.

export function whatsappShareUrl(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
}

export function xShareUrl(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function linkedinShareUrl(url: string): string {
  // LinkedIn's share-offsite endpoint only takes a URL — it pulls its own
  // preview text from that page's Open Graph tags (which is exactly what
  // the /api/og image + metadata we set up are for).
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}
