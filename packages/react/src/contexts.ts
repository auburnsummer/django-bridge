import React, { ReactNode } from "react";
import { Message } from "./fetch";

export interface NavigateOptions {
  pushState?: boolean;
  skipDirtyFormCheck?: boolean;
}

export interface Navigation {
  frameId: number;
  path: string;
  props: Record<string, unknown>;
  context: Record<string, unknown>;
  pageLoading: boolean;
  navigate: (path: string, options?: NavigateOptions) => Promise<void>;
  replacePath: (frameId: number, path: string) => void;
  submitForm: (path: string, data: FormData) => Promise<void>;
  refreshProps: () => Promise<void>;
}

export const NavigationContext = React.createContext<Navigation>({
  frameId: 0,
  path: "/",
  props: {},
  context: {},
  pageLoading: false,
  navigate: () => {
    // eslint-disable-next-line no-console
    console.error("navigate() called from outside a Django Bridge Browser");

    return Promise.resolve();
  },
  replacePath: () => {
    // eslint-disable-next-line no-console
    console.error("replacePath() called from outside a Django Bridge Browser");
  },
  submitForm: () => {
    // eslint-disable-next-line no-console
    console.error("submitForm() called from outside a Django Bridge Browser");

    return Promise.resolve();
  },
  refreshProps: () => {
    // eslint-disable-next-line no-console
    console.error("refreshProps() called from outside a Django Bridge Browser");

    return Promise.resolve();
  },
});

// This context is used to allow form widgets to notify their forms that data has changed
export const FormWidgetChangeNotificationContext = React.createContext(
  () => {}
);

// This context is used to notify components within a form if the form is currently submitting
// This is used to display spinners in submit buttons
export const FormSubmissionStatus = React.createContext(false);

export interface Messages {
  messages: Message[];
  pushMessage: (message: Message) => void;
}

export const MessagesContext = React.createContext<Messages>({
  messages: [],
  pushMessage: () => {},
});



export const OutletContext = React.createContext<ReactNode>(undefined);