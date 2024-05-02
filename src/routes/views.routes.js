import { Router } from "express";
import { exampleProductManager } from "../app.js";
import { uploader } from "../uploader.js";
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
  toSendObject = exampleProductManager.readFileAndSave();
  res.render('realTimeProducts', {toSendObject: toSendObject});
});
router.post("/realtimeproducts", uploader.single("thumbnail"), (req, res) => {
  const socketServer = req.app.get("socketServer");

  let newProduct = {...req.body, thumbnail: req.file.filename, status: true};
  exampleProductManager.addProduct(newProduct);
  toSendObject = exampleProductManager.readFileAndSave();
  

  socketServer.on("receivedProducts", msg => {
    console.log(msg);
  })

  socketServer.emit("changedProducts", toSendObject);

  res.render('realTimeProducts', {toSendObject: toSendObject});
});
router.get("/chat", (req, res) => {
  res.render("chat", {});
})
export default router;
