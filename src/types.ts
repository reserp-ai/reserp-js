import type { components, paths } from "./openapi.js";

export type OpenAPIComponents = components;
export type OpenAPIPaths = paths;

export type Request = components["schemas"]["Request"];
export type Pagination = components["schemas"]["Pagination"];
export type ResultEntry = components["schemas"]["ResultEntry"];
export type BillingSource = components["schemas"]["BillingSource"];
export type SearchRequest = components["schemas"]["SearchRequest"];
export type SearchResponse = components["schemas"]["SearchResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type ReserpErrorCode = ErrorResponse["error"];
export type Spelling = components["schemas"]["Spelling"];
export type Page = components["schemas"]["Page"];
export type Link = components["schemas"]["Link"];
export type Sitelink = components["schemas"]["Sitelink"];
export type Fact = components["schemas"]["Fact"];
export type Section = components["schemas"]["Section"];
export type StructuredPagination = components["schemas"]["StructuredPagination"];

export type OrganicItem = components["schemas"]["OrganicItem"];
export type OrganicBlock = components["schemas"]["OrganicBlock"];
export type FeaturedSnippetItem = components["schemas"]["FeaturedSnippetItem"];
export type FeaturedSnippetBlock = components["schemas"]["FeaturedSnippetBlock"];
export type AdsItem = components["schemas"]["AdsItem"];
export type AdsBlock = components["schemas"]["AdsBlock"];
export type ShoppingItem = components["schemas"]["ShoppingItem"];
export type ShoppingBlock = components["schemas"]["ShoppingBlock"];
export type LocalItem = components["schemas"]["LocalItem"];
export type LocalBlock = components["schemas"]["LocalBlock"];
export type HotelsItem = components["schemas"]["HotelsItem"];
export type HotelsBlock = components["schemas"]["HotelsBlock"];
export type ImagesItem = components["schemas"]["ImagesItem"];
export type ImagesBlock = components["schemas"]["ImagesBlock"];
export type VideosItem = components["schemas"]["VideosItem"];
export type VideosBlock = components["schemas"]["VideosBlock"];
export type NewsItem = components["schemas"]["NewsItem"];
export type NewsBlock = components["schemas"]["NewsBlock"];
export type KnowledgeItem = components["schemas"]["KnowledgeItem"];
export type KnowledgeBlock = components["schemas"]["KnowledgeBlock"];
export type ProfilesItem = components["schemas"]["ProfilesItem"];
export type ProfilesBlock = components["schemas"]["ProfilesBlock"];
export type AiOverviewItem = components["schemas"]["AiOverviewItem"];
export type AiOverviewBlock = components["schemas"]["AiOverviewBlock"];
export type PeopleAlsoAskItem = components["schemas"]["PeopleAlsoAskItem"];
export type PeopleAlsoAskBlock = components["schemas"]["PeopleAlsoAskBlock"];
export type ThingsToKnowItem = components["schemas"]["ThingsToKnowItem"];
export type ThingsToKnowBlock = components["schemas"]["ThingsToKnowBlock"];
export type RelatedSearchesItem = components["schemas"]["RelatedSearchesItem"];
export type RelatedSearchesBlock = components["schemas"]["RelatedSearchesBlock"];
export type DiscussionsItem = components["schemas"]["DiscussionsItem"];
export type DiscussionsBlock = components["schemas"]["DiscussionsBlock"];
export type RecipesItem = components["schemas"]["RecipesItem"];
export type RecipesBlock = components["schemas"]["RecipesBlock"];
export type JobsItem = components["schemas"]["JobsItem"];
export type JobsBlock = components["schemas"]["JobsBlock"];
export type WebsitesItem = components["schemas"]["WebsitesItem"];
export type WebsitesBlock = components["schemas"]["WebsitesBlock"];
export type AppsItem = components["schemas"]["AppsItem"];
export type AppsBlock = components["schemas"]["AppsBlock"];
export type WeatherItem = components["schemas"]["WeatherItem"];
export type WeatherBlock = components["schemas"]["WeatherBlock"];
export type CurrencyItem = components["schemas"]["CurrencyItem"];
export type CurrencyBlock = components["schemas"]["CurrencyBlock"];
export type CalculatorItem = components["schemas"]["CalculatorItem"];
export type CalculatorBlock = components["schemas"]["CalculatorBlock"];
export type TimeItem = components["schemas"]["TimeItem"];
export type TimeBlock = components["schemas"]["TimeBlock"];
export type FinanceItem = components["schemas"]["FinanceItem"];
export type FinanceBlock = components["schemas"]["FinanceBlock"];
export type DictionaryItem = components["schemas"]["DictionaryItem"];
export type DictionaryBlock = components["schemas"]["DictionaryBlock"];
export type TranslateItem = components["schemas"]["TranslateItem"];
export type TranslateBlock = components["schemas"]["TranslateBlock"];
export type FlightsItem = components["schemas"]["FlightsItem"];
export type FlightsBlock = components["schemas"]["FlightsBlock"];
export type SportsItem = components["schemas"]["SportsItem"];
export type SportsBlock = components["schemas"]["SportsBlock"];
export type NavigationItem = components["schemas"]["NavigationItem"];
export type NavigationBlock = components["schemas"]["NavigationBlock"];
export type NoticeItem = components["schemas"]["NoticeItem"];
export type NoticeBlock = components["schemas"]["NoticeBlock"];
export type ConsentItem = components["schemas"]["ConsentItem"];
export type ConsentBlock = components["schemas"]["ConsentBlock"];
export type OtherItem = components["schemas"]["OtherItem"];
export type OtherBlock = components["schemas"]["OtherBlock"];
export type StructuredResponse = components["schemas"]["StructuredResponse"];
export type StructuredBlock = StructuredResponse["blocks"][number];
export type StructuredBlockType = StructuredBlock["type"];

export type SearchAPIResponse = SearchResponse | ErrorResponse;
export type StructuredAPIResponse = StructuredResponse | ErrorResponse;
export type APIResponse = SearchResponse | StructuredResponse | ErrorResponse;

/** Native Fetch options, excluding the method and JSON body owned by the API. */
export type SearchRequestOptions = Omit<RequestInit, "body" | "method">;

/** Native Fetch Response with a typed API JSON body. */
export interface ReserpResponse<T extends APIResponse = APIResponse> extends Response {
  clone(): ReserpResponse<T>;
  json(): Promise<T>;
}

export type SearchReserpResponse = ReserpResponse<SearchAPIResponse>;
export type StructuredReserpResponse = ReserpResponse<StructuredAPIResponse>;

export interface ReserpOptions {
  apiKey: string;
  /** Legacy alias for searchEndpoint, retained for test and proxy compatibility. */
  endpoint?: string | URL;
  /** Override the v2 Search endpoint, primarily for testing or a local proxy. */
  searchEndpoint?: string | URL;
  /** @deprecated Use searchEndpoint. */
  urlIndexEndpoint?: string | URL;
  /** Override the v2 structured endpoint, primarily for testing or a local proxy. */
  structuredEndpoint?: string | URL;
  /** Use a caller-supplied Fetch-compatible transport. */
  fetch?: typeof globalThis.fetch;
}

/** @deprecated Use Request. */
export type SubmittedRequest = Request;
/** @deprecated Use ResultEntry. */
export type Result = ResultEntry;
/** @deprecated Use ResultEntry. */
export type UrlEntry = ResultEntry;
/** @deprecated Use SearchResponse. */
export type UrlIndexResponse = SearchResponse;
/** @deprecated Use SearchAPIResponse. */
export type UrlIndexAPIResponse = SearchAPIResponse;
/** @deprecated Use SearchReserpResponse. */
export type UrlIndexReserpResponse = SearchReserpResponse;
