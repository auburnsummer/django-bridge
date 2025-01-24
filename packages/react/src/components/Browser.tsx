import React, { ReactElement, ReactNode, useEffect } from "react";
import { DirtyFormContext } from "../dirtyform";

import { NavigationController } from "../navigation";
import {
  NavigateOptions,
  NavigationContext,
} from "../contexts";
import Config from "../config";

export interface BrowserProps {
  config: Config;
  navigationController: NavigationController;
}

function Browser({
  config,
  navigationController
}: BrowserProps): ReactElement {
  const { currentFrame, navigate, replacePath, submitForm, refreshProps, pageLoading } =
    navigationController;

  const { isDirty, requestUnload, cancelUnload } =
    React.useContext(DirtyFormContext);

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

  // Render the view and wrap it with each configured global context provider
  let view = <View {...currentFrame.props} />;
  config.contextProviders.forEach((provider, name) => {
    view = (
      <provider.Provider value={currentFrame.context[name]}>
        {view}
      </provider.Provider>
    );
  });

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return (
    <NavigationContext.Provider value={NavigationUtils}>
      <div key={currentFrame.id}>{view}</div>
    </NavigationContext.Provider>
  );
}

export default Browser;
