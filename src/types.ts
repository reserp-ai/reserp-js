export type ReserpErrorCode =
  | "invalid_request"
  | "authentication_failed"
  | "free_allowance_exhausted"
  | "request_not_allowed"
  | "rate_limited"
  | "internal_error"
  | "search_failed"
  | "service_unavailable";

export type BillingSource = "free" | "prepaid" | null;

export interface SearchRequest {
  /** Complete Google Search URL accepted by the public API. */
  url: string;
}

export interface SubmittedRequest {
  url: string;
}

export interface Pagination {
  /** Send this value back as request.url for the next page. */
  next_url: string;
}

export interface Metadata {
  captured_at: string;
  parser_version: string;
  warnings: string[];
}

export interface UrlEntry {
  url: string;
  text?: string;
}

export interface UrlIndexResponse {
  ok: true;
  request: SubmittedRequest;
  page: { url: string };
  urls: UrlEntry[];
  pagination: Pagination;
  metadata: Metadata;
  billed: boolean;
  billing_source: BillingSource;
}

export interface Fact {
  key: string;
  label?: string;
  value: string | number | boolean;
  unit?: string;
  raw?: string;
}

export interface Link {
  title: string;
  url: string;
  raw_url?: string;
  snippet?: string;
}

export interface ResultBase {
  position: number;
  page_position: number;
  title?: string;
  url?: string;
  raw_url?: string;
  displayed_url?: string;
  domain?: string;
  source?: string;
  date?: string;
  snippet?: string;
  image_url?: string;
  facts?: Fact[];
}

export interface WebResult extends ResultBase {
  kind: "web_result";
  title: string;
  url: string;
  sitelinks?: Link[];
}

export interface AdResult extends ResultBase {
  kind: "search_ad" | "product_ad" | "local_ad";
  title: string;
  url: string;
  placement: "top" | "inline" | "bottom" | "right" | "unknown";
  advertiser?: string;
  merchant?: string;
  price?: string;
  old_price?: string;
  rating?: number;
  review_count?: number;
  delivery?: string;
  thumbnail_url?: string;
}

export interface ImageResult extends ResultBase {
  kind: "image_result";
  image_url: string;
  thumbnail_url?: string;
  original_width?: number;
  original_height?: number;
}

export interface ProductResult extends ResultBase {
  kind: "product_result";
  title: string;
  merchant?: string;
  price?: string;
  currency?: string;
  old_price?: string;
  rating?: number;
  review_count?: number;
  delivery?: string;
}

export interface NewsResult extends ResultBase {
  kind: "news_result";
  title: string;
  url: string;
  publisher?: string;
  publisher_logo_url?: string;
}

export interface VideoResult extends ResultBase {
  kind: "video_result";
  title: string;
  url: string;
  publisher?: string;
  duration?: string;
  thumbnail_url?: string;
}

export interface PlaceResult extends ResultBase {
  kind: "place_result";
  title: string;
  place_id?: string;
  category?: string;
  address?: string;
  phone?: string;
  hours?: string;
  rating?: number;
  review_count?: number;
  latitude?: number;
  longitude?: number;
  website?: string;
}

export interface FeatureItem {
  position: number;
  title?: string;
  text?: string;
  url?: string;
  raw_url?: string;
  source?: string;
  date?: string;
  image_url?: string;
  facts?: Fact[];
}

export interface Feature {
  type: string;
  page_position: number;
  title?: string;
  text?: string;
  items: FeatureItem[];
  facts: Fact[];
}

export interface Page {
  state: "results" | "no_results" | "consent_only" | "unsupported";
  surface: "web" | "images" | "shopping" | "news" | "videos" | "local" | "other";
  url: string;
  title?: string;
  overlays: "consent"[];
  spelling?: {
    kind: "showing_results_for" | "did_you_mean" | "original_query";
    query: string;
    url?: string;
  };
}

export interface Results {
  organic: WebResult[];
  ads: AdResult[];
  images: ImageResult[];
  shopping: ProductResult[];
  news: NewsResult[];
  videos: VideoResult[];
  local: PlaceResult[];
}

export interface StructuredResponse {
  ok: true;
  schema_version: "2.0";
  request: SubmittedRequest;
  page: Page;
  results: Results;
  features: Feature[];
  pagination: Pagination;
  metadata: Metadata;
  billed: boolean;
  billing_source: BillingSource;
}

export interface ErrorResponse {
  ok: false;
  error: ReserpErrorCode;
  retryable: boolean;
  billed: boolean;
  billing_source: BillingSource;
}

export type UrlIndexAPIResponse = UrlIndexResponse | ErrorResponse;
export type StructuredAPIResponse = StructuredResponse | ErrorResponse;
export type APIResponse = UrlIndexResponse | StructuredResponse | ErrorResponse;

/** Native Fetch options, excluding the method and JSON body owned by the API. */
export type SearchRequestOptions = Omit<RequestInit, "body" | "method">;

/** Native Fetch Response with a typed API JSON body. */
export interface ReserpResponse<T extends APIResponse = APIResponse> extends Response {
  clone(): ReserpResponse<T>;
  json(): Promise<T>;
}

export type UrlIndexReserpResponse = ReserpResponse<UrlIndexAPIResponse>;
export type StructuredReserpResponse = ReserpResponse<StructuredAPIResponse>;

export interface ReserpOptions {
  apiKey: string;
  /** Legacy alias for urlIndexEndpoint, retained for test and proxy compatibility. */
  endpoint?: string | URL;
  /** Override the v2 URL-index endpoint, primarily for testing or a local proxy. */
  urlIndexEndpoint?: string | URL;
  /** Override the v2 structured endpoint, primarily for testing or a local proxy. */
  structuredEndpoint?: string | URL;
  /** Use a caller-supplied Fetch-compatible transport. */
  fetch?: typeof globalThis.fetch;
}

/** @deprecated Use UrlEntry. */
export type Result = UrlEntry;
/** @deprecated Use UrlIndexResponse. */
export type SearchResponse = UrlIndexResponse;
