const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;


// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

//Request logger
const requestLogger = (req, res, next) => {
    const timeStamp = new Date().toISOString();
    console.log(`[${timeStamp}] ${req.method} ${req.originalUrl}`)

    if(req.method === "POST" || req.method === "PUT") {
        console.log("Request Body", JSON.stringify(req.body, null, 2))
    }

    next()
};

//Validation
const menuValidation = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),

  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('category')
    .isIn(['entree', 'appetizer', 'dessert', 'beverage'])
    .withMessage('Category must be entree, appetizer, dessert, or beverage'),

  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Ingredients must be an array with at least one item'),

  body('available')
    .isBoolean()
    .withMessage('Available must be true or false')
];


// Handle Validation Errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        
        return res.status(400).json({
        error: 'Validation failed',
        messages: errorMessages
        });
    }
     next();
  };


// Built-in middleware for parsing JSON
app.use(express.json());

// Custom logging middleware
app.use(requestLogger);

// Routes
app.get('/api/menus', (req,res) =>
{
  res.json(menuItems)
});



//GET by Id
app.get('/api/menus/:id', (req,res) =>{
  const menuId = parseInt(req.params.id);
  const menu = menuItems.find( m => m.id === menuId)

  if (menu){
    res.json(menu)
  } else {
    res.status(404).json({error: "Menu not found "})
  }
});


//Post| add new menu item
app.post('/api/menus', menuValidation, handleValidationErrors,(req,res) =>{
  const {name, description, price, category, ingredients, available} = req.body;

  const newMenuItem = {
    id: menuItems.length + 1,
    name,
    description,
    price,
    category,
    ingredients,
    available
  };

  //add menu item
  menuItems.push(newMenuItem);

  res.status(201).json(newMenuItem)
});

//PUT | Update an existing menu item
app.put('/api/menus/:id',  menuValidation, handleValidationErrors,(req,res) =>{
    const menuId = parseInt(req.params.id);
    const {name, description, price, category, ingredients, available} = req.body;

  // Validate ID format
  if (isNaN(menuId) || menuId <= 0) {
    return res.status(400).json({
      error: 'Invalid menu ID. ID must be a positive number.'
    });
  }
  
    //Find menu item to update
    const menuIndex = menuItems.findIndex(m => m.id === menuId)

    if (menuIndex === -1){
        return res.status(404).json({error: 'Menu item not found'})
    }

    //Update menuItems
    menuItems[menuIndex] ={
        id: menuId,
        name,
        description, 
        price, 
        category, 
        ingredients, 
        available};

    //Return the updated menuItems
    res.json(menuItems[menuIndex])
});

//DELETE
app.delete('/api/menus/:id', (req, res) => {
  const menuId = parseInt(req.params.id, 10);

  // Validate ID format
  if (isNaN(menuId) || menuId <= 0) {
    return res.status(400).json({
      error: 'Invalid menu ID. ID must be a positive number.'
    });
  }

  const menuIndex = menuItems.findIndex(m => m.id === menuId);

  // Check if item exists
  if (menuIndex === -1) {
    return res.status(404).json({
      error: `Menu item with id ${menuId} not found`
    });
  }

  const deletedMenuItem = menuItems.splice(menuIndex, 1)[0];

  return res.status(200).json({
    message: 'Menu item deleted successfully',
    menuItem: deletedMenuItem
  });
});


app.listen(port, () => {
    console.log(`Todo API running at http://localhost:${port}`);
});