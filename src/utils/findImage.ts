import { Glob } from "bun";
import { ImageTypes } from "../middleware/mediaMiddlewares";

export const findImage = async (type: ImageTypes, hash: string) => {
    const glob = new Glob("media/" + hash + `/${type}.*`);
    let avatarFile = null;
    for await (const file of glob.scan()) {
        avatarFile = Bun.file(file);
        console.log("Avatar file search: ", file);
    }
    return avatarFile
} 