import "./game/game.css";
import { mountGame } from "./game/mount";

const host = document.getElementById("app");
if (!host) throw new Error("Missing #app");
mountGame(host);
