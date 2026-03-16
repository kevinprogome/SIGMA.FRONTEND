import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "../styles/actionMessageViewportGuard.css";

const ACTION_MESSAGE_SELECTOR = [
  '[role="alert"]',
  '.admin-message',
  '.alert-message',
  '.profile-message',
  '.examiner-profile-message',
  '.director-profile-message',
  '.documents-message',
  '.students-pending-message',
  '.status-message',
  '.modalities-message',
  '.modality-specific-message',
  '.notifications-alert',
  '.cancellation-message',
  '.reports-alert',
  '.director-success-message',
  '.director-propose-defense-message',
].join(', ');

const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim();

const isRenderable = (element) => {
  if (!element) return false;
  const styles = window.getComputedStyle(element);
  if (styles.display === "none" || styles.visibility === "hidden") return false;
  return element.getClientRects().length > 0;
};

const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= window.innerHeight;
};

const getMessageSignature = (pathname, element) => {
  const text = normalizeText(element.textContent);
  if (!text) return "";
  return `${pathname}::${text}`;
};

export default function ActionMessageViewportGuard() {
  const { pathname } = useLocation();
  const seenMessagesRef = useRef(new Set());
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    seenMessagesRef.current.clear();
  }, [pathname]);

  useEffect(() => {
    const processMessages = () => {
      const candidates = Array.from(document.querySelectorAll(ACTION_MESSAGE_SELECTOR)).filter((element) => {
        if (!isRenderable(element)) return false;
        const text = normalizeText(element.textContent);
        return text.length > 0;
      });

      if (candidates.length === 0) return;

      for (const element of candidates) {
        const signature = getMessageSignature(pathname, element);
        if (!signature || seenMessagesRef.current.has(signature)) continue;

        seenMessagesRef.current.add(signature);
        if (!isInViewport(element)) {
          element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
        break;
      }
    };

    const scheduleProcess = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(processMessages, 60);
    };

    scheduleProcess();

    const observer = new MutationObserver(scheduleProcess);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      observer.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [pathname]);

  return null;
}
