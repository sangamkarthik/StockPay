import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Missing DATABASE_URL environment variable");

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const recipes = [
  {
    title: "Creamy Garlic Pasta",
    imageUrl: "/images/pasta-thumb.png",
    imageUrls: [
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1200&q=85",
    ],
    description: "A rich and comforting pasta made with garlic, cream, parmesan, and fresh spinach. Perfect for busy weeknights.",
    prepTime: "10 min", cookTime: "15 min", totalTime: "25 min",
    servings: 4, difficulty: "Easy", rating: "4.8", reviews: 126, likes: 142, saves: 116,
    tags: ["Easy", "Vegetarian", "Pasta"],
  },
  {
    title: "Teriyaki Tofu Stir Fry",
    imageUrl: "/images/pasta-hero.png",
    description: "Crispy tofu glazed in homemade teriyaki sauce with stir-fried broccoli, bell pepper, and fluffy white rice.",
    prepTime: "10 min", cookTime: "20 min", totalTime: "30 min",
    servings: 2, difficulty: "Easy", rating: "4.6", reviews: 89, likes: 104, saves: 87,
    tags: ["Easy", "Vegan", "High Protein"],
  },
  {
    title: "Hearty Minestrone Soup",
    imageUrl: "/images/pasta-thumb.png",
    description: "A classic Italian vegetable soup loaded with seasonal veggies, beans, and pasta in a rich tomato broth.",
    prepTime: "15 min", cookTime: "25 min", totalTime: "40 min",
    servings: 6, difficulty: "Easy", rating: "4.7", reviews: 112, likes: 130, saves: 98,
    tags: ["Vegetarian", "Soup", "Meal Prep"],
  },
  {
    title: "Chicken Tacos",
    imageUrl: "/images/pasta-hero.png",
    description: "Juicy seasoned chicken in warm flour tortillas, topped with cheddar, salsa, and a squeeze of lime.",
    prepTime: "10 min", cookTime: "10 min", totalTime: "20 min",
    servings: 4, difficulty: "Easy", rating: "4.5", reviews: 78, likes: 92, saves: 71,
    tags: ["Easy", "High Protein", "Weeknight"],
  },
  {
    title: "Roasted Veggie Grain Bowl",
    imageUrl: "/images/pasta-thumb.png",
    description: "Nourishing quinoa bowl with roasted mixed vegetables, creamy tahini dressing, and crumbled feta.",
    prepTime: "10 min", cookTime: "25 min", totalTime: "35 min",
    servings: 2, difficulty: "Easy", rating: "4.9", reviews: 143, likes: 168, saves: 141,
    tags: ["Healthy", "Vegetarian", "Meal Prep"],
  },
  {
    title: "Lemon Herb Salmon",
    imageUrl: "/images/pasta-hero.png",
    description: "Flaky pan-seared salmon with fresh dill, lemon butter sauce, and roasted asparagus on the side.",
    prepTime: "5 min", cookTime: "17 min", totalTime: "22 min",
    servings: 2, difficulty: "Easy", rating: "4.8", reviews: 101, likes: 119, saves: 95,
    tags: ["Seafood", "High Protein", "Quick"],
  },
];

// Scan detects only basic staples — specialty items below will be MISSING
const recipeIngredients = {
  "Creamy Garlic Pasta": [
    { name: "Spaghetti",      category: "Pasta",   price: "1.99", displayQuantity: "200 g",    sortOrder: 1 },
    { name: "Garlic",         category: "Produce", price: "0.79", displayQuantity: "4 cloves", sortOrder: 2 },
    { name: "Cherry Tomatoes",category: "Produce", price: "3.49", displayQuantity: "1 cup",    sortOrder: 3 },
    { name: "Olive Oil",      category: "Pantry",  price: "8.99", displayQuantity: "2 tbsp",   sortOrder: 4 },
    { name: "Spinach",        category: "Produce", price: "3.29", displayQuantity: "2 cups",   sortOrder: 5 },
    { name: "Heavy Cream",    category: "Dairy",   price: "4.99", displayQuantity: "1/2 cup",  sortOrder: 6 },
    { name: "Parmesan Cheese",category: "Dairy",   price: "5.49", displayQuantity: "1/2 cup",  sortOrder: 7 },
    { name: "Butter",         category: "Dairy",   price: "4.29", displayQuantity: "2 tbsp",   sortOrder: 8 },
    { name: "Salt",           category: "Pantry",  price: "1.49", displayQuantity: "To taste", sortOrder: 9 },
    { name: "Black Pepper",   category: "Pantry",  price: "3.99", displayQuantity: "To taste", sortOrder: 10 },
  ],
  "Teriyaki Tofu Stir Fry": [
    { name: "Tofu",           category: "Protein", price: "3.99", displayQuantity: "14 oz",    sortOrder: 1 },
    { name: "Soy Sauce",      category: "Pantry",  price: "4.49", displayQuantity: "3 tbsp",   sortOrder: 2 },
    { name: "Teriyaki Sauce", category: "Pantry",  price: "5.99", displayQuantity: "1/4 cup",  sortOrder: 3 },
    { name: "Broccoli",       category: "Produce", price: "2.49", displayQuantity: "2 cups",   sortOrder: 4 },
    { name: "Bell Pepper",    category: "Produce", price: "1.99", displayQuantity: "1 large",  sortOrder: 5 },
    { name: "Sesame Oil",     category: "Pantry",  price: "6.99", displayQuantity: "1 tsp",    sortOrder: 6 },
    { name: "Garlic",         category: "Produce", price: "0.79", displayQuantity: "3 cloves", sortOrder: 7 },
    { name: "Ginger",         category: "Produce", price: "1.49", displayQuantity: "1 tsp",    sortOrder: 8 },
    { name: "Rice",           category: "Grains",  price: "2.99", displayQuantity: "1 cup",    sortOrder: 9 },
  ],
  "Hearty Minestrone Soup": [
    { name: "Olive Oil",       category: "Pantry",  price: "8.99", displayQuantity: "2 tbsp",  sortOrder: 1 },
    { name: "Onion",           category: "Produce", price: "0.99", displayQuantity: "1 large", sortOrder: 2 },
    { name: "Garlic",          category: "Produce", price: "0.79", displayQuantity: "4 cloves",sortOrder: 3 },
    { name: "Celery",          category: "Produce", price: "1.99", displayQuantity: "2 stalks",sortOrder: 4 },
    { name: "Carrots",         category: "Produce", price: "1.49", displayQuantity: "2 medium",sortOrder: 5 },
    { name: "Canned Tomatoes", category: "Pantry",  price: "2.49", displayQuantity: "14 oz",   sortOrder: 6 },
    { name: "Kidney Beans",    category: "Pantry",  price: "1.79", displayQuantity: "15 oz",   sortOrder: 7 },
    { name: "Pasta",           category: "Pasta",   price: "1.99", displayQuantity: "1 cup",   sortOrder: 8 },
    { name: "Vegetable Broth", category: "Pantry",  price: "3.49", displayQuantity: "4 cups",  sortOrder: 9 },
    { name: "Salt",            category: "Pantry",  price: "1.49", displayQuantity: "To taste",sortOrder: 10 },
    { name: "Black Pepper",    category: "Pantry",  price: "3.99", displayQuantity: "To taste",sortOrder: 11 },
  ],
  "Chicken Tacos": [
    { name: "Chicken Breast",  category: "Protein", price: "7.99", displayQuantity: "1 lb",    sortOrder: 1 },
    { name: "Flour Tortillas", category: "Grains",  price: "3.99", displayQuantity: "8 small",  sortOrder: 2 },
    { name: "Cheddar Cheese",  category: "Dairy",   price: "4.49", displayQuantity: "1 cup",   sortOrder: 3 },
    { name: "Garlic",          category: "Produce", price: "0.79", displayQuantity: "2 cloves", sortOrder: 4 },
    { name: "Onion",           category: "Produce", price: "0.99", displayQuantity: "1 medium", sortOrder: 5 },
    { name: "Olive Oil",       category: "Pantry",  price: "8.99", displayQuantity: "1 tbsp",  sortOrder: 6 },
    { name: "Cumin",           category: "Spice",   price: "2.99", displayQuantity: "1 tsp",   sortOrder: 7 },
    { name: "Lime",            category: "Produce", price: "0.79", displayQuantity: "2 limes", sortOrder: 8 },
    { name: "Salsa",           category: "Pantry",  price: "4.99", displayQuantity: "1/2 cup", sortOrder: 9 },
    { name: "Salt",            category: "Pantry",  price: "1.49", displayQuantity: "To taste",sortOrder: 10 },
  ],
  "Roasted Veggie Grain Bowl": [
    { name: "Quinoa",          category: "Grains",  price: "5.99", displayQuantity: "1 cup",   sortOrder: 1 },
    { name: "Mixed Vegetables",category: "Produce", price: "4.99", displayQuantity: "2 cups",  sortOrder: 2 },
    { name: "Olive Oil",       category: "Pantry",  price: "8.99", displayQuantity: "2 tbsp",  sortOrder: 3 },
    { name: "Lemon",           category: "Produce", price: "0.79", displayQuantity: "1 lemon", sortOrder: 4 },
    { name: "Tahini",          category: "Pantry",  price: "7.99", displayQuantity: "2 tbsp",  sortOrder: 5 },
    { name: "Garlic",          category: "Produce", price: "0.79", displayQuantity: "2 cloves",sortOrder: 6 },
    { name: "Feta Cheese",     category: "Dairy",   price: "4.99", displayQuantity: "1/4 cup", sortOrder: 7 },
    { name: "Salt",            category: "Pantry",  price: "1.49", displayQuantity: "To taste",sortOrder: 8 },
    { name: "Black Pepper",    category: "Pantry",  price: "3.99", displayQuantity: "To taste",sortOrder: 9 },
  ],
  "Lemon Herb Salmon": [
    { name: "Salmon Fillet",   category: "Protein", price: "12.99", displayQuantity: "2 fillets",sortOrder: 1 },
    { name: "Lemon",           category: "Produce", price: "0.79",  displayQuantity: "1 lemon",  sortOrder: 2 },
    { name: "Garlic",          category: "Produce", price: "0.79",  displayQuantity: "3 cloves", sortOrder: 3 },
    { name: "Olive Oil",       category: "Pantry",  price: "8.99",  displayQuantity: "2 tbsp",   sortOrder: 4 },
    { name: "Dill",            category: "Herb",    price: "2.99",  displayQuantity: "2 tbsp",   sortOrder: 5 },
    { name: "Butter",          category: "Dairy",   price: "4.29",  displayQuantity: "2 tbsp",   sortOrder: 6 },
    { name: "Asparagus",       category: "Produce", price: "3.99",  displayQuantity: "1 bunch",  sortOrder: 7 },
    { name: "Salt",            category: "Pantry",  price: "1.49",  displayQuantity: "To taste", sortOrder: 8 },
    { name: "Black Pepper",    category: "Pantry",  price: "3.99",  displayQuantity: "To taste", sortOrder: 9 },
  ],
};

async function seedRecipeWithIngredients(recipeRecord, ingredients) {
  for (const item of ingredients) {
    const ingredient = await prisma.ingredient.upsert({
      where: { name: item.name },
      update: { category: item.category, price: item.price },
      create: { name: item.name, category: item.category, price: item.price },
    });

    await prisma.recipeIngredient.upsert({
      where: { recipeId_ingredientId: { recipeId: recipeRecord.id, ingredientId: ingredient.id } },
      update: { displayQuantity: item.displayQuantity, sortOrder: item.sortOrder },
      create: {
        recipeId: recipeRecord.id,
        ingredientId: ingredient.id,
        displayQuantity: item.displayQuantity,
        sortOrder: item.sortOrder,
      },
    });
  }
}

async function main() {
  const seededRecipes = new Map();

  for (const recipe of recipes) {
    const existing = await prisma.recipe.findFirst({ where: { title: recipe.title } });
    const record = existing
      ? await prisma.recipe.update({ where: { id: existing.id }, data: recipe })
      : await prisma.recipe.create({ data: recipe });
    seededRecipes.set(record.title, record);
  }

  let totalIngredients = 0;
  for (const [title, ingredients] of Object.entries(recipeIngredients)) {
    const recipeRecord = seededRecipes.get(title);
    if (!recipeRecord) continue;
    await seedRecipeWithIngredients(recipeRecord, ingredients);
    totalIngredients += ingredients.length;
  }

  console.log(`Seeded ${recipes.length} recipes and ${totalIngredients} recipe-ingredient links.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
