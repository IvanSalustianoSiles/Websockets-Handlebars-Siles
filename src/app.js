// Importaciones
import fs from "fs";
import { myProducts } from "../products-mock.js";
import { myCarts } from "../carts-mock.js";
import express from "express";
import productRoutes from "./routes/products.routes.js";
import config from "./config.js";
import cartRoutes from "./routes/carts.routes.js";
import handlebars from "express-handlebars";
import viewRoutes from "./routes/views.routes.js";
import { Server } from "socket.io";
import { log } from "console";
// Productos de ejemplo para agregar y probar el algoritmo.
const [product1, product2, product3, productCambiado] = myProducts;
const [cart1, cart2, cart3, cart4] = myCarts;

// Clase para controlar los métodos referentes a los productos.
class ProductManager {
  constructor() {
    this.productsArray = [];
    this.id = 0;
    this.path = `./product.json`;
    this.getting = false;
  }
  addProduct({ title, description, price, code, stock, category, status, thumbnail }) {
    this.readFileAndSave();
    let newProduct = {
      title: title,
      description: description,
      price: price,
      code: code,
      stock: stock,
      category: category,
      status: status,
      thumbnail: thumbnail
    };

    let codeExists = this.productsArray.some(
      (product) => product.code == newProduct.code
    );

    if (codeExists == false && !Object.keys(newProduct).includes(undefined)) {
      // Validamos que no se repita el code y que los campos sean obligatorios.

      const idsArray = this.productsArray.map((product) => {
        return product.id;
      });
      idsArray.sort((a, b) => a - b); // En caso de que se desordene el array, si sumamos de uno en uno podemos encontrarnos con IDs repetidos, así que, para evitar problemas, lo ordenamos
      if (idsArray != "") {
        // de menor a mayor y a la última posición del array le sumamos uno, para siempre tener un número mayor en la siguiente ID, no importa en qué orden se borre o agregue productos.
        this.id = idsArray[idsArray.length - 1] + 1;
      } else {
        this.id = this.id + 1;
      }
      newProduct = { ...newProduct, id: this.id };
      this.productsArray.push(newProduct);
      this.updateFile(this.productsArray);
      console.log(`El producto de ID "${newProduct.id}" fue agregado.`);
    }
  }
  getProducts() {
    this.getting = true;
    this.readFileAndSave();
    if (this.productsArray.length != 0) {
      console.log(this.productsArray);
    } else {
      console.log("Su array está vacío.");
    }
    this.getting = false;
  }
  getProductById(id) {
    this.getting = true;
    this.readFileAndSave();
    let gottenProduct = this.productsArray.find((product) => product.id == id);
    if (gottenProduct) {
      return gottenProduct;
    } else {
      console.log(`No se encontró el producto que coincida con la id "${id}".`);
    }
    this.getting = false;
  }
  deleteProductById(id) {
    this.readFileAndSave();
    let toDeleteProduct = this.productsArray.find(
      (product) => product.id == id
    );
    if (toDeleteProduct) {
      const forDeleteIndex = this.productsArray.indexOf(toDeleteProduct);
      this.productsArray.splice(forDeleteIndex, 1);
      this.updateFile(this.productsArray);
      console.log(`Producto "${toDeleteProduct.title}" eliminado.`);
    } else {
      console.log(`No se encontró el producto que coincida con la ID "${id}".`);
    }
  }
  updateProduct(id, latestProduct = {}) {
    this.readFileAndSave();
    let toUpdateProduct = this.productsArray.find(
      (product) => product.id == id
    );
    if (toUpdateProduct) {
      Object.values(toUpdateProduct).forEach((value, i) => {
        if (Object.values(latestProduct)[i] == "") {
          Object.values(latestProduct)[i] == value;
        }
      });
      latestProduct = { ...latestProduct, id: id };
      let indexToUpdate = this.productsArray.indexOf(toUpdateProduct);
      this.productsArray.splice(indexToUpdate, 1, latestProduct);
      this.updateFile(this.productsArray);
      console.log(`Producto de ID "${toUpdateProduct.id}" actualizado.`);
    } else {
      console.log(`No se encontró el producto que coincida con la ID "${id}".`);
    }
  }
  updateFile(array) {
    fs.writeFileSync(`${this.path}`, JSON.stringify(array));
  }
  readFileAndSave() {
    if (fs.existsSync(this.path)) {
      let fileContent = fs.readFileSync(this.path, "utf-8");
      let parsedFileContent = JSON.parse(fileContent);
      this.productsArray = parsedFileContent;
    } else if (this.getting) {
      console.log("ERROR: El archivo que intentas leer no existe.");
    }
    return this.productsArray;
  }
}

// Clase para controlar los métodos referentes a los carritos.
class CartManager {
  constructor() {
    this.cartsArray = [];
    this.id = 0;
    this.path = `./cart.json`;
    this.getting = false;
  }
  createCart() {
    this.readFileAndSave();

    let newCart = {
      id: "",
      products: [],
    };
    const CartIdsArray = this.cartsArray.map((cart) => {
      return cart.id;
    });
    CartIdsArray.sort((a, b) => a - b); // En caso de que se desordene el array, si sumamos de uno en uno podemos encontrarnos con IDs repetidos, así que, para evitar problemas, lo ordenamos
    if (CartIdsArray != "") {
      // de menor a mayor y a la última posición del array le sumamos uno, para siempre tener un número mayor en la siguiente ID, no importa en qué orden se borre o agregue productos.
      this.id = CartIdsArray[CartIdsArray.length - 1] + 1;
    } else {
      this.id = this.id + 1;
    }
    newCart = { ...newCart, id: this.id };
    this.cartsArray.push(newCart);
    this.updateFile(this.cartsArray);
    console.log(`El producto de ID "${newCart.id}" fue agregado.`);

    return newCart;
  }
  getProdsOfCartById(cid) {
    this.getting = true;
    this.readFileAndSave();
    let gottenCart = this.cartsArray.find((cart) => cart.id == cid);
    if (gottenCart) {
      return gottenCart["products"];
    } else {
      console.log(`No se encontró el producto que coincida con la id "${cid}".`);
    }
    this.getting = false;
  }
  addProduct(id, cid) {
    this.readFileAndSave();
    let newProduct = {
      id: id,
      quantity: 1
    }
    if (!Object.values(newProduct).includes(undefined)) {
      let myCart = this.cartsArray.find(cart => cart.id == cid);
      if (myCart) {
        let myProduct = myCart["products"].find(product => product.id == id);
        if (myProduct) {
          let indexOfProd = myCart["products"].indexOf(myProduct);
          newProduct["quantity"] = myProduct["quantity"] + newProduct.quantity;
          myCart["products"].splice(indexOfProd, 1);
          myCart["products"].push(newProduct);
          console.log(`Ahora hay ${myProduct["quantity"]} productos de ID ${id} en el carrito de ID ${cid}.`);
        } else {
          console.log(`Producto de ID ${id} agregado.`);
          myCart["products"].push(newProduct);
        }
        this.updateFile(this.cartsArray);
        return myCart;
      } else {
        console.log(`El carrito de ID ${cid} no fue encontrado.`);
      }
    } else {
      console.log(`El producto que intentabas ingresar no contiene las propiedades adecuadas.`);
    }
  }
  updateFile(array) {
    fs.writeFileSync(`${this.path}`, JSON.stringify(array));
  }
  readFileAndSave() {
    if (fs.existsSync(this.path)) {
      let fileContent = fs.readFileSync(this.path, "utf-8");
      let parsedFileContent = JSON.parse(fileContent);
      this.cartsArray = parsedFileContent;
    } else if (this.getting) {
      console.log("ERROR: El archivo que intentas leer no existe.");
    }
    return this.cartsArray;
  }
}

export let exampleProductManager = new ProductManager(); // ProductManager de ejemplo para probar el algoritmo.
export let exampleCartManager = new CartManager(); // CartManager de ejemplo para probar el algoritmo.

// Métodos a utilizar:

// Para productos:
// exampleProductManager.addProduct();
// exampleProductManager.getProducts();
// exampleProductManager.getProductById();
// exampleProductManager.deleteProductById();
// exampleProductManager.updateProduct();
// exampleProductManager.readFileAndSave();

// Para carritos:
// exampleCartManager.createCart();
// exampleCartManager.getProdsOfCartById();
// exampleCartManager.addProduct();
// exampleCartManager.updateFile();
// exampleCartManager.readFileAndSave();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

app.use(viewRoutes);
app.use('/api/products/', productRoutes);
app.use("/api/carts", cartRoutes);
app.use('/static', express.static(`${config.DIRNAME}/public`));

const httpServer = app.listen(config.PORT, () => {
  console.log(`Servidor activo en el puerto ${config.PORT}.`);
});

const socketServer = new Server(httpServer);

socketServer.on('connection', socket => {
  console.log(`Cliente conectado, id ${socket.id} desde ${socket.ad}.`);
  socket.on("newMessage", data => {
    console.log(data);

    socket.emit("secondMessage", "Mensaje recibido.");
  })
})