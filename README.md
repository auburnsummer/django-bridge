This is my personal fork of django-bridge!

The main changes are:

 - [`pageLoading` field](https://github.com/auburnsummer/django-bridge/blob/88e75e44564eb56f18dca39e3cf9f757591e12d5/packages/react/src/navigation.ts#L26) on `NavigationContext` can be used to determine if a page is loading. This can be used to display a global loading state. It doesn't work everywhere yet.
 - [`<Outlet />`](https://github.com/auburnsummer/django-bridge/blob/main/packages/react/src/components/Outlet.tsx) component can be used to customise where the rendered view of `DjangoBridge.App` goes, like this:

    ```ts
    <DjangoBridge.App>
        <GlobalProviderThatShouldBeOnEveryPage>
            <SomeOtherStuffToo />
            <Etc />
            <DjangoBridge.Outlet />
        </GlobalProviderThatShouldBeOnEveryPage>
    </DjangoBridge.App>
    ``` 

 - The Overlay functionality has been removed, as it wouldn't work with the Outlet concept I've got above, and I'm not
 currently using Overlay in my usecase for django-bridge.