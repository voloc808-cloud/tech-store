CREATE DATABASE TechStore;
GO

USE TechStore;
GO

CREATE TABLE Categories
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500)
);
GO

CREATE TABLE Users
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(200),
    Email NVARCHAR(200) UNIQUE,
    PasswordHash NVARCHAR(500),
    Role NVARCHAR(20)
);
GO

CREATE TABLE Products
(
    Id INT IDENTITY(1,1) PRIMARY KEY,

    ProductName NVARCHAR(200) NOT NULL,

    Price DECIMAL(18,2) NOT NULL,

    Description NVARCHAR(MAX),

    ImageUrl NVARCHAR(500),

    IsStockManaged BIT DEFAULT 1,

    StockQuantity INT DEFAULT 0,

    CategoryId INT NOT NULL,

    FOREIGN KEY (CategoryId)
        REFERENCES Categories(Id)
);
GO

CREATE TABLE Orders
(
    Id INT IDENTITY(1,1) PRIMARY KEY,

    UserId INT NOT NULL,

    OrderDate DATETIME DEFAULT GETDATE(),

    TotalAmount DECIMAL(18,2),

    Status NVARCHAR(50),

    FOREIGN KEY (UserId)
        REFERENCES Users(Id)
);
GO

CREATE TABLE OrderDetails
(
    Id INT IDENTITY(1,1) PRIMARY KEY,

    OrderId INT NOT NULL,

    ProductId INT NOT NULL,

    Quantity INT,

    UnitPrice DECIMAL(18,2),

    FOREIGN KEY (OrderId)
        REFERENCES Orders(Id),

    FOREIGN KEY (ProductId)
        REFERENCES Products(Id)
);
GO
