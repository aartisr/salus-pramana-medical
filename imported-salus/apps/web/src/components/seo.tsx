import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

const siteName = "SALUS";
const defaultDescription = "Transparent, source-linked evidence comparison for integrative healthcare. Explore uncertainty, safety context, and evidence quality across medical systems.";

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

export function Seo() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const page = pathname === "/"
      ? { title: "Compare healthcare evidence", description: defaultDescription }
      : pathname === "/math"
        ? { title: "How evidence scoring works", description: "Inspect SALUS evidence scoring, uncertainty controls, and governance gates for transparent health information." }
        : pathname === "/new"
          ? { title: "Submit verifiable evidence", description: "Contribute structured, source-linked health evidence for editorial review." }
          : { title: "Evidence intelligence", description: defaultDescription };
    const title = `${page.title} | ${siteName}`;
    document.title = title;
    setMeta('meta[name="description"]', "name", "description", page.description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", page.description);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", page.description);
    const canonical = new URL(pathname, window.location.origin).toString();
    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.append(canonicalLink);
    }
    canonicalLink.href = canonical;
  }, [pathname]);

  return null;
}
