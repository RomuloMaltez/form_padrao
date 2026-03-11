"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Instagram, Search } from "lucide-react";

import IlustracaoCidade from "@/components/ui/ilustracao-cidade";
import LogoPrefeitura from "@/components/ui/logo-prefeitura";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

const SEARCH_ROOT_SELECTOR = "[data-search-root]";
const HIGHLIGHT_ATTRIBUTE = "data-search-highlight";
const HIGHLIGHT_CLASS_NAME = "site-search-highlight";

const getSearchRoots = () => {
  if (typeof document === "undefined") {
    return [];
  }

  return Array.from(
    document.querySelectorAll<HTMLElement>(SEARCH_ROOT_SELECTOR),
  );
};

const openDetailsAncestors = (element: HTMLElement) => {
  let parent: HTMLElement | null = element.parentElement;

  while (parent) {
    if (parent instanceof HTMLDetailsElement) {
      parent.open = true;
    }
    parent = parent.parentElement;
  }
};

const collectTextNodes = (root: HTMLElement): Text[] => {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent?.trim()) {
        return NodeFilter.FILTER_REJECT;
      }

      const parent = node.parentElement;
      if (!parent) {
        return NodeFilter.FILTER_REJECT;
      }

      if (
        parent.closest(`[${HIGHLIGHT_ATTRIBUTE}]`) ||
        parent.closest("[data-search-ignore='true']") ||
        parent.closest("script, style") ||
        parent.closest("[aria-hidden='true']")
      ) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode = walker.nextNode();
  while (currentNode) {
    nodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  return nodes;
};

const highlightNodeMatches = (
  node: Text,
  normalizedTerm: string,
  hits: HTMLElement[],
) => {
  if (!node.data || !normalizedTerm) {
    return;
  }

  const termLength = normalizedTerm.length;
  let currentNode = node;
  let remainingText = currentNode.data;
  let matchIndex = remainingText.toLowerCase().indexOf(normalizedTerm);

  while (matchIndex !== -1) {
    const matchNode = currentNode.splitText(matchIndex);
    const afterMatchNode = matchNode.splitText(termLength);
    const highlight = document.createElement("mark");
    highlight.className = HIGHLIGHT_CLASS_NAME;
    highlight.setAttribute(HIGHLIGHT_ATTRIBUTE, "true");
    highlight.setAttribute("tabindex", "-1");
    matchNode.parentNode?.insertBefore(highlight, matchNode);
    highlight.appendChild(matchNode);
    openDetailsAncestors(highlight);
    hits.push(highlight);
    currentNode = afterMatchNode;
    remainingText = currentNode.data ?? "";
    matchIndex = remainingText.toLowerCase().indexOf(normalizedTerm);
  }
};

const highlightMatches = (term: string) => {
  if (typeof document === "undefined") {
    return [];
  }

  const normalizedTerm = term.toLowerCase();
  if (!normalizedTerm) {
    return [];
  }

  const hits: HTMLElement[] = [];
  const roots = getSearchRoots();

  roots.forEach((root) => {
    const textNodes = collectTextNodes(root);
    textNodes.forEach((node) =>
      highlightNodeMatches(node, normalizedTerm, hits),
    );
  });

  return hits;
};

const clearHighlights = () => {
  if (typeof document === "undefined") {
    return;
  }

  const highlights = document.querySelectorAll<HTMLElement>(
    `mark[${HIGHLIGHT_ATTRIBUTE}]`,
  );

  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    if (!parent) {
      return;
    }

    const textContent = highlight.textContent ?? "";
    parent.replaceChild(document.createTextNode(textContent), highlight);

    if (parent instanceof Element || parent instanceof DocumentFragment) {
      parent.normalize();
    }
  });

  getSearchRoots().forEach((root) => root.normalize());
};

export default function Header() {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedQuery = query.trim();

      if (trimmedQuery.length < 3) {
        clearHighlights();
        alert("Por favor, digite pelo menos 3 caracteres para buscar.");
        return;
      }

      clearHighlights();
      const hits = highlightMatches(trimmedQuery);

      if (!hits.length) {
        alert("Nenhum resultado encontrado na página.");
        return;
      }

      hits[0].scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [query],
  );

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      clearHighlights();
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest("#site-search-form") &&
        !target.closest("#search-toggle")
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      clearHighlights();
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:items-center lg:gap-8">
          <div className="order-1 flex w-full items-center justify-center self-center lg:order-1 lg:w-auto lg:justify-start lg:self-start lg:pr-4">
            <Link
              href="/"
              aria-label="Ir para a página inicial da SEMEC Porto Velho"
              className="shrink-0"
            >
              <LogoPrefeitura size="hero" />
            </Link>
          </div>

          <div className="order-3 flex w-full items-center lg:order-2">
            <IlustracaoCidade />
          </div>

          <div className="order-2 flex flex-col gap-3 lg:order-3 lg:items-center">
            <div className="flex w-full items-center justify-center gap-4 lg:w-75">
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/semec.pvh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram da SEMEC"
                  className="inline-flex h-14 w-14 items-center justify-center rounded-md border border-rose-100 bg-rose-50 text-[#E1306C] shadow-sm transition hover:border-rose-200 hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1306C]"
                >
                  <Instagram size={24} aria-hidden />
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=556999425251"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp da SEMEC"
                  className="inline-flex h-14 w-14 items-center justify-center rounded-md border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                >
                  <WhatsappIcon size={24} aria-hidden />
                </a>
                <button
                  id="search-toggle"
                  onClick={toggleSearch}
                  className="inline-flex h-14 w-14 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--pv-blue-900)]"
                  aria-label="Abrir busca"
                >
                  <Search size={26} aria-hidden />
                </button>
              </div>
            </div>

            <div className="relative flex w-full flex-col lg:w-75 lg:items-center">
              <form
                id="site-search-form"
                onSubmit={handleSearch}
                aria-label="Barra de busca do portal"
                className={`absolute top-3 left-1/2 z-10 w-full -translate-x-1/2 flex-col gap-2 lg:w-75 ${isSearchOpen ? "flex" : "hidden"}`}
              >
                <div className="flex w-full items-center rounded-md border border-slate-200 bg-white shadow-lg focus-within:border-(--pv-blue-900) focus-within:ring-2 focus-within:ring-[color:var(--pv-blue-900)]/10">
                  <label htmlFor="site-search" className="sr-only">
                    O que você procura?
                  </label>
                  <span className="pl-3 text-slate-500">
                    <Search size={18} aria-hidden />
                  </span>
                  <input
                    ref={searchInputRef}
                    id="site-search"
                    name="search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="O que você procura?"
                    className="w-full border-0 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-r-md bg-(--pv-yellow-500) px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400"
                  >
                    Buscar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </header>
      <div
        aria-hidden="true"
        className="h-5 w-full border-b-4 border-[#FFDD00] bg-[#70B643]"
      />
    </>
  );
}
