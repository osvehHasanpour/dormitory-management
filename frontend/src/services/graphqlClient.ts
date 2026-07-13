import { toPersianGraphqlError } from "../utils/graphqlErrors";

function resolveGraphqlUrl(): string {
  const configured = import.meta.env.VITE_GRAPHQL_URL?.trim();

  if (configured) {
    return configured.endsWith("/") ? configured : `${configured}/`;
  }

  return "/graphql/";
}

const GRAPHQL_URL = resolveGraphqlUrl();

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface GraphqlRequestOptions {
  accessToken: string;
  document: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

function buildAuthHeaders(accessToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

async function parseGraphqlResponse<TData>(
  response: Response,
): Promise<TData> {
  if (!response.ok) {
    throw new Error(
      "ارتباط با سرور GraphQL برقرار نشد. لطفاً دوباره تلاش کنید.",
    );
  }

  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "خطای GraphQL رخ داد.");
  }

  if (!payload.data) {
    throw new Error("پاسخ GraphQL نامعتبر است.");
  }

  return payload.data;
}

async function postGraphqlRequest<TData>(
  options: GraphqlRequestOptions,
): Promise<TData> {
  const { accessToken, document, variables, operationName } = options;

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: buildAuthHeaders(accessToken),
    body: JSON.stringify({
      query: document,
      variables,
      operationName,
    }),
  });

  return parseGraphqlResponse<TData>(response);
}

export async function graphqlQuery<TData>(
  options: GraphqlRequestOptions,
): Promise<TData> {
  try {
    return await postGraphqlRequest<TData>(options);
  } catch (error) {
    throw toPersianGraphqlError(error);
  }
}

export async function graphqlMutation<TData>(
  options: GraphqlRequestOptions,
): Promise<TData> {
  try {
    return await postGraphqlRequest<TData>(options);
  } catch (error) {
    throw toPersianGraphqlError(error);
  }
}

/** @deprecated Use graphqlQuery or graphqlMutation instead. */
export async function graphqlRequest<TData>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const isMutation = /^\s*mutation\b/i.test(query);

  if (isMutation) {
    return graphqlMutation({ accessToken, document: query, variables });
  }

  return graphqlQuery({ accessToken, document: query, variables });
}
