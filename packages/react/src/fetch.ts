/* eslint-disable @typescript-eslint/no-explicit-any */

export type MessageLevel = "info" | "success" | "warning" | "error";

export interface TextMessage {
  level: MessageLevel;
  text: string;
}

export interface HTMLMessage {
  level: MessageLevel;
  html: string;
}

export type Message = TextMessage | HTMLMessage;

interface ReloadResponse {
  status: "reload";
}

interface RedirectResponse {
  status: "redirect";
  path: string;
}

interface RenderResponse {
  status: "render";
  title: string;
  view: string;
  props: Record<string, unknown>;
  context: Record<string, unknown>;
  messages: Message[];
}

interface ServerErrorResponse {
  status: "server-error";
}

interface NetworkErrorResponse {
  status: "network-error";
}

export type DjangoBridgeResponse =
  | ReloadResponse
  | RedirectResponse
  | RenderResponse
  | ServerErrorResponse
  | NetworkErrorResponse;

export async function djangoGet(
  url: string
): Promise<DjangoBridgeResponse> {
  let response: Response;

  const headers: HeadersInit = { "X-Requested-With": "DjangoBridge" };

  try {
    response = await fetch(url, { headers });
  } catch (e) {
    return {
      status: "network-error",
    };
  }

  if (response.status === 500) {
    return {
      status: "server-error",
    };
  }
  if (!response.headers.get("X-DjangoBridge-Status")) {
    return {
      status: "reload",
    };
  }
  return response.json() as Promise<DjangoBridgeResponse>;
}

export async function djangoPost(
  url: string,
  data: FormData
): Promise<DjangoBridgeResponse> {
  let response: Response;

  const headers: HeadersInit = { "X-Requested-With": "DjangoBridge" };

  try {
    response = await fetch(url, {
      method: "post",
      headers,
      body: data,
    });
  } catch (e) {
    return {
      status: "network-error",
    };
  }

  if (response.status === 500) {
    return {
      status: "server-error",
    };
  }
  if (!response.headers.get("X-DjangoBridge-Status")) {
    return {
      status: "reload",
    };
  }
  return response.json() as Promise<DjangoBridgeResponse>;
}
