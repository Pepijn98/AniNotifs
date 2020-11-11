import { Command } from "~/types";

export const command: Command = {
    name: "ping",
    async run(msg): Promise<void> {
        await msg.channel.createMessage("Pong!");
    }
};
