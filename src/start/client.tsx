import { StartClient } from "@tanstack/react-start/client";
import { hydrateRoot } from "react-dom/client";
import { getRouter } from "../router";

const appElement = document.getElementById("root")!;

const router = getRouter();

hydrateRoot(appElement, <StartClient router={router} />);
