import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import { DirtyFormContext } from "../dirtyform";

import { Frame, NavigationController } from "../navigation";
import {
  NavigateOptions,
  NavigationContext,
} from "../contexts";
import Config from "../config";
import { OutletContext } from "@django-bridge/react/src/contexts";

export interface BrowserProps {
  config: Config;
  navigationController: NavigationController;
  children: ReactNode;
}

type UltraProviderProps = {
  children: ReactNode,
  contextProviders: Map<string, React.Context<unknown>>,
  currentFrame: Frame<Record<string, unknown>>
};

/**
 * Takes all the providers in the config and turns it into one mega provider.
 */
function UltraProvider({children, contextProviders, currentFrame}: UltraProviderProps) {
  let finalResult = <>{ children }</>;
  contextProviders.forEach((provider, name) => {
    finalResult = (
      <provider.Provider value={currentFrame.context[name]}>
        {finalResult}
      </provider.Provider>
    );
  });
  return finalResult;
}

function Browser({
  config,
  navigationController,
  children
}: BrowserProps): ReactElement {
  const { currentFrame, navigate, replacePath, submitForm, refreshProps, pageLoading } =
    navigationController;

  const { isDirty, requestUnload, cancelUnload } =
    React.useContext(DirtyFormContext);

  const [outletElement, setOutletElement] = useState<React.ReactNode>(undefined);

  const NavigationUtils = React.useMemo(
    () => ({
      frameId: currentFrame.id,
      path: currentFrame.path,
      props: currentFrame.props,
      context: currentFrame.context,
      navigate: (url: string, options: NavigateOptions = {}) => {
        // If there is a dirty form, block navigation until unload has been confirmed
        if (!isDirty || options.skipDirtyFormCheck === true) {
          if (options.skipDirtyFormCheck === true) {
            cancelUnload();
          }

          return navigate(url, options.pushState);
        }

        return requestUnload().then(() => navigate(url, options.pushState));
      },
      replacePath,
      submitForm,
      refreshProps,
      pageLoading
    }),
    [
      currentFrame,
      replacePath,
      submitForm,
      isDirty,
      requestUnload,
      cancelUnload,
      navigate,
      refreshProps,
      pageLoading
    ]
  );
  // Get the view component
  const View = config.views.get(currentFrame.view);
  if (!View) {
    return <p>Unknown view &apos;{currentFrame.view}&apos;</p>;
  }

  // Render the view
  let view = (
    <div key={currentFrame.id}>
      <View {...currentFrame.props} />
    </div>
  )

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return (
    <UltraProvider contextProviders={config.contextProviders} currentFrame={currentFrame}>
      <NavigationContext.Provider value={NavigationUtils}>
        <OutletContext.Provider value={view}>
          {children}
        </OutletContext.Provider>
      </NavigationContext.Provider>
    </UltraProvider>
  );
}

export default Browser;
