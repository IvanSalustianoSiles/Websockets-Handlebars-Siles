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
router.post("/realtimeproducts", uploader.single("archivo"), (req, res) => {
  const socketServer = req.app.get("socketServer");  
  const {newProduct, productAction} = JSON.parse(req.body.json); 
  const {id} = newProduct;
  if (productAction == "add") {
    let toAddProduct = {...newProduct, thumbnail: req.file.filename, status: true};
    exampleProductManager.addProduct(toAddProduct);
    let toAddId = exampleProductManager.readFileAndSave()[exampleProductManager.readFileAndSave().length-1].id
    socketServer.emit("addConfirmed", {msg: "Producto agregado.", toAddId});
  } else if (productAction == "delete") {
    exampleProductManager.deleteProductById(+id);
    
    socketServer.emit("deleteConfirmed", {msg: `Producto de ID ${id} eliminado.`, pid: id});
  }

  res.render('realTimeProducts', {toSendObject: toSendObject});
});
router.get("/chat", (req, res) => {
  res.render("chat", {});
});
export default router;
