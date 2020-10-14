import bodyParser from "body-parser";
import * as core from "express-serve-static-core";
import { Db } from "mongodb";
import * as platformController from "./controllers/platform";
import { PlatformModel } from "./models/platform";
import * as gameController from "./controllers/game";
import { GameModel } from "./models/game";
import express, { NextFunction, Request, Response } from "express";
import * as nunjucks from "nunjucks";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.use("/assets", express.static("public"));

app.set("view engine", "njk");

export function makeApp(db: Db): core.Express {
  const jsonParser = bodyParser.json();
  const platformModel = new PlatformModel(db.collection("platforms"));
  const gameModel = new GameModel(db.collection("games"));

  app.get("/", (request, response) => {
    response.render("home");
  });

  app.get("/platforms", platformController.index(platformModel));
  app.get("/platforms/:slug", platformController.show(platformModel));
  app.post("/platforms", jsonParser, platformController.create(platformModel));
  app.delete(
    "/platforms/:slug",
    jsonParser,
    platformController.destroy(platformModel)
  );
  app.put(
    "/platforms/:slug",
    jsonParser,
    platformController.update(platformModel)
  );

  app.get(
    "/platforms/:slug/games",
    gameController.indexPlatformSlug(gameModel)
  );

  app.get("/games", gameController.index(gameModel));
  app.get("/games/:slug", gameController.show(gameModel));
  app.post(
    "/games",
    jsonParser,
    gameController.create(gameModel, platformModel)
  );
  app.delete("/games/:slug", jsonParser, gameController.destroy(gameModel));
  app.put("/games/:slug", jsonParser, gameController.update(gameModel));

  // This should be the last call to `app` in this file
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    next();
  });

  return app;
}
