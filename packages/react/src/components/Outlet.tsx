import { OutletContext } from "@django-bridge/react/src/contexts";
import { useContext } from "react";

export function Outlet() {
    const element = useContext(OutletContext);

    return element;
}