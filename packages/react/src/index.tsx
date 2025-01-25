import React, { ReactElement, ReactNode } from "react";

import Browser from "./components/Browser";
import { Message, DjangoBridgeResponse, djangoGet } from "./fetch";
import { Frame, useNavigationController } from "./navigation";
import { DirtyFormScope } from "./dirtyform";
import Link, { BuildLinkElement, buildLinkElement } from "./components/Link";
import Config from "./config";
import Form from "./components/Form";
import { MessagesContext } from "./contexts";

export interface AppProps {
  config: Config;
  initialResponse: DjangoBridgeResponse | JSON;
  children: ReactNode;
}

export function App({ config, initialResponse, children }: AppProps): ReactElement {
  // Toast messages state
  const [messages, setMessages] = React.useState<Message[]>([]);
  const pushMessage = React.useCallback(
    (message: Message) => {
      setMessages(messages.concat([message]));
    },
    [messages]
  );

  const onServerError = React.useCallback(
    (kind: "server" | "network") => {
      if (kind === "server") {
        pushMessage({
          level: "error",
          text: "A server error occurred. Please try again later.",
        });
      } else if (kind === "network") {
        pushMessage({
          level: "error",
          text: "A network error occurred. Please check your internet connection or try again later.",
        });
      }
    },
    [pushMessage]
  );


  const onNavigation = (
    frame: Frame | null,
    newFrame: boolean,
    newMessages: Message[]
  ) => {
    // Clear messages if moving to new frame (instead of updating existing frame)
    // For example, navigate() and submitForm() will create a new frame but
    // replacePath() and refreshProps() will update the existing one.
    // We don't want to delete messages for the latter two.
    if (newFrame) {
      setMessages(newMessages);
    } else {
      // Push any new messages from server
      newMessages.forEach(pushMessage);
    }
  };

  const initialPath =
    window.location.pathname + window.location.search + window.location.hash;
  const navigationController = useNavigationController(
    config.unpack,
    initialResponse as DjangoBridgeResponse,
    initialPath,
    {
      onNavigation,
      onServerError,
    }
  );

  React.useEffect(() => {
    // Remove the loading screen
    const loadingScreen = document.querySelector(".django-bridge-load");
    if (loadingScreen instanceof HTMLElement) {
      loadingScreen.classList.add("django-bridge-load--hidden");
      setTimeout(() => {
        loadingScreen.remove();
      }, 200);
    }

    // Add listener for popState
    // This event is fired when the user hits the back/forward links in their browser
    const navigate = () => {
      // eslint-disable-next-line no-void
      void navigationController.navigate(document.location.pathname, false);
    };
    window.addEventListener("popstate", navigate);
    return () => {
      window.removeEventListener("popstate", navigate);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const messagesContext = React.useMemo(
    () => ({ messages, pushMessage }),
    [messages, pushMessage]
  );

  return (
    <DirtyFormScope handleBrowserUnload>
      <MessagesContext.Provider value={messagesContext}>
        {!navigationController.isLoading && (
          <Browser
            config={config}
            navigationController={navigationController}
          >
            {children}
          </Browser>
        )}
      </MessagesContext.Provider>
    </DirtyFormScope>
  );
}

export {
  NavigationContext,
  FormWidgetChangeNotificationContext,
  FormSubmissionStatus,
  MessagesContext,
} from "./contexts";
export type { Navigation } from "./contexts";
export { DirtyFormContext, DirtyFormMarker } from "./dirtyform";
export type { DirtyForm } from "./dirtyform";
export { type NavigationController } from "./navigation";
export type { Frame } from "./navigation";
export type { DjangoBridgeResponse as Response };
export { Link, BuildLinkElement, buildLinkElement };
export type { Message };
export { Config };
export { Form };
export { Outlet } from './components/Outlet';