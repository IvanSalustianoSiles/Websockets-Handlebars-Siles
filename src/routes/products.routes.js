import { exampleProductManager} from "../app.js";
import { Router } from "express";
import { uploader } from "../uploader.js";
let toSendObject = {};
const router = Router();
router.get("/", (req, res) => {
  if (req.query.limit) {
    try {
      toSendObject = {
        status: 1,
        payload: exampleProductManager.readFileAndSave().slice(0, +req.query.limit),
      }; // Aprovecho mi método preexistente "readFileAndSave" que lee el archivo y guarda su contenido en el array, retornándolo.
      
      res.send(toSendObject);
    } catch (error) {
      console.error(
        "Lo sentimos, ha ocurrido un error enviando la información que intentó capturar."
      );
    }
  } else {
    try {
      toSendObject = { status: 1, payload: exampleProductManager.readFileAndSave() };
      
      res.send(toSendObject);
    } catch (error) {
      console.error(
        "Lo sentimos, ha ocurrido un error enviando la información que intentó capturar."
      );
    }
  }
});
router.get("/:pid", (req, res) => {
  try {
    toSendObject = {
      status: 1,
      payload: exampleProductManager.readFileAndSave()[+req.params.pid - 1],
    }; // -1, puesto que lee desde la posición cero la id, que comienza en uno.

    res.send(toSendObject);
  } catch (error) {
    console.error(
      "Lo sentimos, ha ocurrido un error enviando la información que intentó capturar."
    );
  }
});
router.post("/", uploader.single("thumbnail"), (req, res) => {
  let newProduct = {...req.body, thumbnail: req.file.filename, status: true};
  exampleProductManager.addProduct(newProduct);
  const toSendObject = exampleProductManager.readFileAndSave();
  res.status(200).send(toSendObject);
});
router.put("/:pid", (req, res) => {
const {pid} = req.params;
  const {latestProduct} = req.body; // IMPORTANTE: Escribir los campos a modificar (latestProduct) en la forma "{campo1, campo2, campo3...}".
  exampleProductManager.updateProduct(pid, latestProduct); // Aquellos que no se pretenda actualizar sean reemplazados con "" (ej: {campo1, "", campo2, "",...}).
  res.status(200).send(`Producto de ID ${pid} actualizado.`);
});
router.delete("/:pid", (req, res) => {
  const {pid} = req.params;
  exampleProductManager.deleteProductById(pid);
  res.status(200).send(`Producto de ID ${pid} eliminado.`);
});

export default router;
