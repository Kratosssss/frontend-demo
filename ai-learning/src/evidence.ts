function deploymentBase(base: string, pathname: string) {
  const normalized = `${base.replace(/\/?$/, "/")}`;
  if (normalized !== "/") return normalized;
  const devSubpath = pathname.match(/^(.*\/ai-learning)(?:\/|$)/)?.[1];
  return devSubpath ? `${devSubpath}/` : normalized;
}

export function publicEvidenceHref(path: string, base = import.meta.env.BASE_URL, pathname = typeof window === "undefined" ? "/" : window.location.pathname) {
  return path.startsWith("/evidence/") ? `${deploymentBase(base, pathname)}${path.slice(1)}` : path;
}
