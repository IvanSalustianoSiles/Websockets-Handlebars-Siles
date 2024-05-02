import { exampleCartManager } from "../app.js";
import { Router } from "express";
let toSendObject = {};
const router = Router();

router.post("/", (req, res) => {
    toSendObject = exampleCartManager.createCart();
    res.status(200).send("Carrito creado.");
});
router.get("/:cid", (req, res) => {
    const {cid} = req.params;
    toSendObject = exampleCartManager.getProdsOfCartById(+cid);
    res.status(200).send(toSendObject);
});
router.post("/:cid/product/:pid", (req, res) => {
  const {pid, cid} = req.params;
  toSendObject = exampleCartManager.addProduct(+pid, +cid);
  res.status(200).send(toSendObject);
});

export default router;