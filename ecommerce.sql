CREATE DATABASE shopping_db;
USE shopping_db;

CREATE TABLE CustomerNames (
  CustomerID INT PRIMARY KEY AUTO_INCREMENT,
  FirstName VARCHAR(50),
  MiddleName VARCHAR(50),
  LastName VARCHAR(50)
);


CREATE TABLE CustomerPhoneNumbers (
  CustomerID INT,
  PhoneNumber VARCHAR(15),
  PRIMARY KEY (CustomerID, PhoneNumber),
  FOREIGN KEY (CustomerID) REFERENCES CustomerNames(CustomerID)
);


CREATE TABLE Categories (
  CategoryID INT PRIMARY KEY AUTO_INCREMENT,
  CategoryName VARCHAR(100)
);


CREATE TABLE Products (
  ProductID INT PRIMARY KEY AUTO_INCREMENT,
  ProductName VARCHAR(100),
  UnitPrice DECIMAL(10,2),
  CategoryID INT,
  FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);


CREATE TABLE Orders (
  OrderID INT PRIMARY KEY AUTO_INCREMENT,
  CustomerID INT,
  OrderDate DATE,
  TotalAmount DECIMAL(10,2),
  FOREIGN KEY (CustomerID) REFERENCES CustomerNames(CustomerID)
);


CREATE TABLE OrderDetails (
  OrderID INT,
  ProductID INT,
  Quantity INT,
  PriceAtOrder DECIMAL(10,2),
  PRIMARY KEY (OrderID, ProductID),
  FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
  FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);


INSERT INTO CustomerNames (FirstName, MiddleName, LastName) VALUES
('Aarav', 'Kumar', 'Sharma'),
('Kalpesh', NULL, 'Paliwal'),
('Rohan', 'Singh', 'Mehta'),
('Ishan', 'Rani', 'Patel'),
('Ishank', NULL, 'Goyal'),
('Kriti', 'Devi', 'Chopra'),
('Nikhil', 'Raj', 'Yadav'),
('Manika', NULL, 'Singla'),
('Arjun', 'K.', 'Deshmukh'),
('Aryan', NULL, 'Tyagi');

INSERT INTO CustomerPhoneNumbers (CustomerID, PhoneNumber) VALUES
(1, '9876543210'),
(2, '9823456789'),
(3, '9812345678'),
(4, '9898989898'),
(5, '9765432109'),
(6, '9123456780'),
(7, '9001122334'),
(8, '9988776655'),
(9, '9012345678'),
(10, '9090909090');

INSERT INTO Categories (CategoryName) VALUES
('Electronics'),
('Clothing'),
('Books'),
('Home Appliances'),
('Footwear');

INSERT INTO Products (ProductName, UnitPrice, CategoryID) VALUES
('Smartphone', 14999.00, 1),
('Bluetooth Speaker', 1999.00, 1),
('T-Shirt', 499.00, 2),
('Jeans', 999.00, 2),
('Novel - Fiction', 299.00, 3),
('Notebook Set', 149.00, 3),
('Toaster', 849.00, 4),
('Microwave Oven', 4599.00, 4),
('Running Shoes', 1999.00, 5),
('Sandals', 799.00, 5);


INSERT INTO Orders (CustomerID, OrderDate, TotalAmount) VALUES
(1, '2024-04-01', 1999.00),
(2, '2024-04-02', 499.00),
(3, '2024-04-03', 2298.00),
(4, '2024-04-04', 299.00),
(5, '2024-04-05', 4599.00),
(6, '2024-04-06', 999.00),
(7, '2024-04-07', 2798.00),
(8, '2024-04-08', 849.00),
(9, '2024-04-09', 2798.00),
(10, '2024-04-10', 799.00);

INSERT INTO OrderDetails (OrderID, ProductID, Quantity, PriceAtOrder) VALUES
(1, 32, 1, 1999.00),              -- Bluetooth Speaker
(2, 33, 1, 499.00),               -- T-Shirt
(3, 33, 1, 499.00),               -- T-Shirt
(3, 34, 1, 999.00),               -- Jeans
(4, 35, 1, 299.00),               -- Novel
(5, 38, 1, 4599.00),              -- Microwave
(6, 34, 1, 999.00),               -- Jeans
(7, 31, 1, 14999.00),             -- Smartphone
(7, 40, 1, 799.00),              -- Sandals
(8, 37, 1, 849.00),               -- Toaster
(9, 39, 1, 1999.00),              -- Running Shoes
(9, 32, 1, 1999.00),              -- Bluetooth Speaker
(10, 40, 1, 799.00);             -- Sandals


select * from CustomerNames;
select * from Products;
