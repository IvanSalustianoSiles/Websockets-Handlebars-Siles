import { Router } from "express";
import { exampleProductManager } from "../app.js";

let toSendObject = {};

const router = Router();

router.get("/welcome", (req, res) => {
  const user = {
    name: "Iván",
    surname: "Siles"
  }
  res.render('index', user);
});
router.get("/products", (req, res) => {

    toSendObject = { payload: exampleProductManager.readFileAndSave() };
    res.render('home', toSendObject);
});
router.get("/realtimeproducts", (req, res) => {

  toSendObject = { payload: exampleProductManager.readFileAndSave() };
  res.render('home', toSendObject);
});
router.get("/chat", (req, res) => {
  res.render("chat", {});
})
export default router;
