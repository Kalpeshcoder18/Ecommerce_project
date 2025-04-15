const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const mysql = require("mysql2");
const session = require("express-session");
const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'secretKey', 
  resave: false, 
  saveUninitialized: true
}));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Kalpesh@01",
  database: "shopping_db",
});

// Home
app.get("/", (req, res) => res.render("home"));

// View all products
app.get("/products", (req, res) => {
  const q = `
    SELECT p.ProductID, p.ProductName, p.UnitPrice, c.CategoryName
    FROM Products p
    JOIN Categories c ON p.CategoryID = c.CategoryID`;
  db.query(q, (err, products) => {
    if (err) throw err;
    console.log(products);
    res.render("products", { products });
  });
});

// Add product to cart
app.post("/cart/add", (req, res) => {
  const { product_id, quantity } = req.body;
  const cart = req.session.cart || [];
  
  // Check  the product already exists in the cart ya nahi
  const productIndex = cart.findIndex(item => item.product_id === product_id);
  if (productIndex > -1) {
    cart[productIndex].quantity += parseInt(quantity);
  } else {
    cart.push({ product_id, quantity });
  }

  req.session.cart = cart;
  res.redirect("/cart");
});

// View cart
app.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  const productIDs = cart.map(item => item.product_id).join(',');

  if (productIDs) {
    const q = `SELECT ProductID, ProductName, UnitPrice FROM Products WHERE ProductID IN (${productIDs})`;
    db.query(q, (err, products) => {
      if (err) throw err;
      const cartDetails = cart.map(cartItem => {
        const product = products.find(p => p.ProductID == cartItem.product_id);
        return {
          ...cartItem,
          product_name: product.ProductName,
          price: product.UnitPrice,
          total: product.UnitPrice * cartItem.quantity
        };
      });
      res.render("cart", { cart: cartDetails });
    });
  } else {
    res.render("cart", { cart: [] });
  }
});

// Order form: Ask if the customer is existing or new
app.get("/order/new", (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect("/cart");  // Cart should not be empty

  res.render("order_customer_type");
});

  // Handle customer choice (new or existing)
  app.post("/order/customer", (req, res) => {
    const { customer_type } = req.body;
    if (customer_type === 'new') {
      res.redirect("/order/new_customer");
    } else {
      res.redirect("/order/existing_customer");
    }
  });

// New customer form
app.get("/order/new_customer", (req, res) => {
  res.render("order_new_customer");
});

// Existing customer form (email/phone)
app.get("/order/existing_customer", (req, res) => {
  res.render("order_existing_customer");
});

// Process new customer order
app.post("/order/new_customer", (req, res) => {
  const { first_name, middle_name, last_name, phone } = req.body;
  const cart = req.session.cart || [];

  if (cart.length === 0) return res.redirect("/cart");

  const nameQ = `INSERT INTO CustomerNames (FirstName, MiddleName, LastName) VALUES (?, ?, ?)`;
  db.query(nameQ, [first_name, middle_name, last_name], (err, result) => {
    if (err) throw err;

    const customerID = result.insertId;

    const phoneQ = `INSERT INTO CustomerPhoneNumbers (CustomerID, PhoneNumber) VALUES (?, ?)`;
    db.query(phoneQ, [customerID, phone], (err2) => {
      if (err2) throw err2;

      let totalAmount = 0;
      const orderQ = `INSERT INTO Orders (CustomerID, OrderDate, TotalAmount) VALUES (?, CURDATE(), ?)`;
      db.query(orderQ, [customerID, totalAmount], (err3, orderResult) => {
        if (err3) throw err3;

        const orderID = orderResult.insertId;

        // Process each product in the cart
        let itemsProcessed = 0;
        cart.forEach(item => {
          const priceQ = `SELECT UnitPrice FROM Products WHERE ProductID = ?`;
          db.query(priceQ, [item.product_id], (err4, results) => {
            if (err4) throw err4;

            const unitPrice = results[0].UnitPrice;
            const total = unitPrice * item.quantity;
            totalAmount += total;

            const detailsQ = `INSERT INTO OrderDetails (OrderID, ProductID, Quantity, PriceAtOrder) VALUES (?, ?, ?, ?)`;
            db.query(detailsQ, [orderID, item.product_id, item.quantity, unitPrice], (err5) => {
              if (err5) throw err5;

              itemsProcessed++;
              if (itemsProcessed === cart.length) {
                // All items done, now update total
                const updateTotalQ = `UPDATE Orders SET TotalAmount = ? WHERE OrderID = ?`;
                db.query(updateTotalQ, [totalAmount, orderID], (err6) => {
                  if (err6) throw err6;
                  req.session.cart = []; // Clear cart
                  res.redirect(`/order/confirmation/${orderID}`);
                });
              }
            });
          });
        });
      });
    });
  });
});




// Process existing customer order
app.post("/order/existing_customer", (req, res) => {
  const { phone } = req.body;
  const cart = req.session.cart || [];

  if (cart.length === 0) return res.redirect("/cart");

  const findCustomerQ = `
    SELECT cn.CustomerID, cn.FirstName, cn.LastName
    FROM CustomerNames cn
    JOIN CustomerPhoneNumbers cp ON cn.CustomerID = cp.CustomerID
    WHERE cp.PhoneNumber = ?`;

  db.query(findCustomerQ, [phone], (err, customers) => {
    if (err) throw err;
    if (customers.length === 0) {
      return res.send("Customer not found. Try again or register as a new customer.");
    }

    const customerID = customers[0].CustomerID;
    let totalAmount = 0;

    const orderQ = `INSERT INTO Orders (CustomerID, OrderDate, TotalAmount) VALUES (?, CURDATE(), ?)`;
    db.query(orderQ, [customerID, totalAmount], (err2, orderResult) => {
      if (err2) throw err2;

      const orderID = orderResult.insertId;

      // Loop over cart items
      let itemsProcessed = 0;
      cart.forEach(item => {
        const priceQ = `SELECT UnitPrice FROM Products WHERE ProductID = ?`;
        db.query(priceQ, [item.product_id], (err3, results) => {
          if (err3) throw err3;

          const unitPrice = results[0].UnitPrice;
          const total = unitPrice * item.quantity;
          totalAmount += total;

          const detailsQ = `INSERT INTO OrderDetails (OrderID, ProductID, Quantity, PriceAtOrder) VALUES (?, ?, ?, ?)`;
          db.query(detailsQ, [orderID, item.product_id, item.quantity, unitPrice], (err4) => {
            if (err4) throw err4;

            itemsProcessed++;
            if (itemsProcessed === cart.length) {
              // Update order total after all items
              const updateQ = `UPDATE Orders SET TotalAmount = ? WHERE OrderID = ?`;
              db.query(updateQ, [totalAmount, orderID], (err5) => {
                if (err5) throw err5;
                req.session.cart = []; // Clear cart
                res.redirect(`/order/confirmation/${orderID}`);
              });
            }
          });
        });
      });
    });
  });
});


// Order confirmation page
app.get("/order/confirmation/:orderID", (req, res) => {
  const orderID = req.params.orderID;
  const q = `
    SELECT o.OrderID, CONCAT(n.FirstName, ' ', n.LastName) AS CustomerName, o.TotalAmount, CONVERT_TZ(OrderDate, '+00:00', '+05:30') AS OrderDate
    FROM Orders o
    JOIN CustomerNames n ON o.CustomerID = n.CustomerID
    WHERE o.OrderID = ?`;

  db.query(q, [orderID], (err, orders) => {
    if (err) throw err;
    res.render("order_confirmation", { order: orders[0] });
  });
});

//final report
app.get("/report", (req, res) => {
  const q = `
    SELECT 
      cn.CustomerID,
      CONCAT(cn.FirstName, ' ', cn.LastName) AS CustomerName,
      o.OrderDate,
      p.ProductName,
      od.Quantity,
      od.PriceAtOrder AS UnitPrice,
      (od.Quantity * od.PriceAtOrder) AS TotalPrice
    FROM Orders o
    JOIN CustomerNames cn ON o.CustomerID = cn.CustomerID
    JOIN OrderDetails od ON o.OrderID = od.OrderID
    JOIN Products p ON od.ProductID = p.ProductID
    ORDER BY o.OrderDate DESC`;

  db.query(q, (err, results) => {
    if (err) throw err;
    res.render("report", { records: results });
  });
});



// Server start
app.listen(8080, () => console.log("Server running on http://localhost:8080"));
