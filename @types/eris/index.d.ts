import { Collection as RealCollection } from "@kurozero/collection";
import { Command as RealCommand } from "~/types";

declare module "eris" {
    interface Client {
        commands: RealCollection<RealCommand>
    }
}
