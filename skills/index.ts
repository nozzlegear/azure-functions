import { Express } from "express";

// Skills
import configureStages from "./stages";

export default async function configureSkills(app: Express) {
    [configureStages].forEach(async configure => await configure(app));
}