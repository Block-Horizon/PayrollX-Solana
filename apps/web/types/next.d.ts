declare module "next/dist/lib/metadata/types/metadata-interface.js" {
  export interface Metadata {
    title?: string;
    description?: string;
    keywords?: string[];
    authors?: Array<{ name: string; url?: string }>;
  }

  export interface ResolvingMetadata {
    title?: string;
    description?: string;
    keywords?: string[];
    authors?: Array<{ name: string; url?: string }>;
  }

  export interface ResolvingViewport {
    width?: string;
    initialScale?: number;
  }
}

declare module "next/types.js" {
  export interface NextConfig {
    experimental?: {
      appDir?: boolean;
    };
  }

  export interface ResolvingMetadata {
    title?: string;
    description?: string;
    keywords?: string[];
    authors?: Array<{ name: string; url?: string }>;
  }

  export interface ResolvingViewport {
    width?: string;
    initialScale?: number;
  }
}

declare module "next/server" {
  export class NextRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit);
    cookies: {
      get(name: string): { value: string } | undefined;
      set(name: string, value: string): void;
    };
    nextUrl: {
      pathname: string;
      searchParams: URLSearchParams;
    };
  }

  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(): NextResponse;
  }
}

declare module "next" {
  export interface Metadata {
    title?: string | { default: string; template?: string };
    description?: string;
    keywords?: string[];
    icons?: {
      icon?:
        | string
        | URL
        | Array<{ url: string | URL; sizes?: string; type?: string }>;
      shortcut?:
        | string
        | URL
        | Array<{ url: string | URL; sizes?: string; type?: string }>;
      apple?:
        | string
        | URL
        | Array<{ url: string | URL; sizes?: string; type?: string }>;
    };
    authors?: Array<{ name: string; url?: string }>;
    alternates?: {
      canonical?: string | URL;
      languages?: Record<string, string>;
    };
    openGraph?: {
      type?: "website" | "article" | "book" | "profile";
      locale?: string;
      url?: string | URL;
      title?: string;
      description?: string;
      siteName?: string;
      images?: Array<{
        url: string | URL;
        width?: number;
        height?: number;
        alt?: string;
      }>;
    };
    twitter?: {
      card?: "summary" | "summary_large_image" | "app" | "player";
      title?: string;
      description?: string;
      creator?: string;
      images?: string[];
    };
    robots?: {
      index?: boolean;
      follow?: boolean;
      googleBot?: {
        index?: boolean;
        follow?: boolean;
        "max-video-preview"?: number;
        "max-image-preview"?: "none" | "standard" | "large";
        "max-snippet"?: number;
      };
    };
    verification?: {
      google?: string;
      yandex?: string;
      yahoo?: string;
      other?: Record<string, string>;
    };
  }

  export interface NextConfig {
    reactStrictMode?: boolean;
    swcMinify?: boolean;
    eslint?: {
      ignoreDuringBuilds?: boolean;
    };
    typescript?: {
      ignoreBuildErrors?: boolean;
    };
    experimental?: {
      appDir?: boolean;
    };
    output?: "export" | "standalone";
    trailingSlash?: boolean;
    images?: {
      unoptimized?: boolean;
      domains?: string[];
      formats?: string[];
    };
    compiler?: {
      removeConsole?: boolean | { exclude?: string[] };
    };
    headers?: () => Promise<
      Array<{
        source: string;
        headers: Array<{ key: string; value: string }>;
      }>
    >;
    webpack?: (config: any) => any;
    env?: Record<string, string>;
  }
}

declare module "next/navigation" {
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (href: string) => void;
  };

  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module "next/link" {
  import { ComponentProps } from "react";
  export interface LinkProps extends ComponentProps<"a"> {
    href: string;
    className?: string;
    children: React.ReactNode;
  }
  export default function Link(props: LinkProps): JSX.Element;
}

declare module "next/server" {
  export class NextRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit);
    cookies: {
      get(name: string): { value: string } | undefined;
      set(name: string, value: string): void;
    };
    nextUrl: {
      pathname: string;
      searchParams: URLSearchParams;
    };
  }

  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(): NextResponse;
  }
}

declare module "next/font/local" {
  interface LocalFont {
    variable: string;
    className: string;
    style: { fontFamily: string };
  }
  export default function localFont(config: {
    src: string | Array<{ path: string; weight?: string; style?: string }>;
    variable?: string;
    weight?: string | number | Array<string | number>;
    style?: string | Array<string>;
    display?: string;
    adjustFontFallback?: boolean;
    fallback?: string[];
    preload?: boolean;
    declarations?: Array<{ prop: string; value: string }>;
  }): LocalFont;
}

declare module "next/font/google" {
  interface GoogleFont {
    variable: string;
    className: string;
    style: { fontFamily: string };
  }

  interface GoogleFontConfig {
    subsets?: string[];
    variable?: string;
    weight?: string | number | Array<string | number>;
    style?: string | Array<string>;
    display?: string;
    adjustFontFallback?: boolean;
    fallback?: string[];
    preload?: boolean;
    declarations?: Array<{ prop: string; value: string }>;
    icons?: Array<{
      src: string;
      sizes?: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  }

  export function Inter(config?: GoogleFontConfig): GoogleFont;
  export function Playfair_Display(config?: GoogleFontConfig): GoogleFont;
}

declare module "next/image" {
  import { ComponentProps } from "react";
  interface ImageProps
    extends Omit<ComponentProps<"img">, "src" | "alt" | "width" | "height"> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    priority?: boolean;
    quality?: number;
    placeholder?: "blur" | "empty";
    blurDataURL?: string;
    unoptimized?: boolean;
    loader?: (props: {
      src: string;
      width: number;
      quality?: number;
    }) => string;
  }
  export default function Image(props: ImageProps): JSX.Element;
}
