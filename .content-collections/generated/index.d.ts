import configuration from "../../content-collections.ts";
import { GetTypeByName } from "@content-collections/core";

export type Education = GetTypeByName<typeof configuration, "education">;
export declare const allEducations: Array<Education>;

export {};
