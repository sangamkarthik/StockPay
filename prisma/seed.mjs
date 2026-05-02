import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

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
    description:
      "A rich and comforting pasta made with garlic, cream, parmesan, and fresh spinach. Perfect for busy weeknights.",
    prepTime: "10 min",
    cookTime: "15 min",
    totalTime: "25 min",
    servings: 4,
    difficulty: "Easy",
    rating: "4.8",
    reviews: 126,
    likes: 142,
    saves: 116,
    tags: ["Easy", "Vegetarian", "Pasta"],
  },
  {
    title: "Teriyaki Tofu Stir Fry",
    imageUrl: "/images/pasta-hero.png",
    cookTime: "30 min",
    rating: "4.6",
    reviews: 89,
    tags: ["Easy", "Vegan", "High Protein"],
  },
  {
    title: "Hearty Minestrone Soup",
    imageUrl: "/images/pasta-thumb.png",
    cookTime: "40 min",
    rating: "4.7",
    reviews: 112,
    tags: ["Vegetarian", "Soup", "Meal Prep"],
  },
  {
    title: "Chicken Tacos",
    imageUrl: "/images/pasta-hero.png",
    cookTime: "20 min",
    rating: "4.5",
    reviews: 78,
    tags: ["Easy", "High Protein", "Weeknight"],
  },
  {
    title: "Roasted Veggie Grain Bowl",
    imageUrl: "/images/pasta-thumb.png",
    cookTime: "35 min",
    rating: "4.9",
    reviews: 143,
    tags: ["Healthy", "Vegetarian", "Meal Prep"],
  },
  {
    title: "Lemon Herb Salmon",
    imageUrl: "/images/pasta-hero.png",
    cookTime: "22 min",
    rating: "4.8",
    reviews: 101,
    tags: ["Seafood", "High Protein", "Quick"],
  },
];

const creamyGarlicPastaIngredients = [
  {
    name: "Spaghetti",
    category: "Pasta",
    price: "1.99",
    amount: "200",
    unit: "g",
    displayQuantity: "200 g",
    pantryStatus: "HAVE_ALL",
    sortOrder: 1,
  },
  {
    name: "Garlic",
    category: "Produce",
    price: "0.79",
    amount: "4",
    unit: "cloves",
    displayQuantity: "4 cloves",
    pantryStatus: "HAVE_ALL",
    sortOrder: 2,
  },
  {
    name: "Cherry Tomatoes",
    category: "Produce",
    price: "3.49",
    amount: "1",
    unit: "cup",
    displayQuantity: "1 cup",
    pantryStatus: "HAVE_ALL",
    sortOrder: 3,
  },
  {
    name: "Olive Oil",
    category: "Pantry",
    price: "8.99",
    amount: "2",
    unit: "tbsp",
    displayQuantity: "2 tbsp",
    pantryStatus: "HAVE_ALL",
    sortOrder: 4,
  },
  {
    name: "Spinach",
    category: "Produce",
    price: "3.29",
    amount: "2",
    unit: "cups",
    displayQuantity: "2 cups",
    pantryStatus: "HAVE_ALL",
    sortOrder: 5,
  },
  {
    name: "Heavy Cream",
    category: "Dairy",
    price: "4.99",
    amount: "1/2",
    unit: "cup",
    displayQuantity: "1/2 cup",
    pantryStatus: "HAVE_SOME",
    note: "Need 1/2 cup",
    sortOrder: 6,
  },
  {
    name: "Parmesan Cheese",
    category: "Dairy",
    price: "5.49",
    amount: "1/2",
    unit: "cup",
    displayQuantity: "1/2 cup",
    pantryStatus: "HAVE_SOME",
    note: "Need 1/4 cup",
    sortOrder: 7,
  },
  {
    name: "Butter",
    category: "Dairy",
    price: "4.29",
    amount: "2",
    unit: "tbsp",
    displayQuantity: "2 tbsp",
    pantryStatus: "MISSING",
    sortOrder: 8,
  },
  {
    name: "Salt",
    category: "Pantry",
    price: "1.49",
    displayQuantity: "To taste",
    pantryStatus: "MISSING",
    sortOrder: 9,
  },
  {
    name: "Black Pepper",
    category: "Pantry",
    price: "3.99",
    displayQuantity: "To taste",
    pantryStatus: "MISSING",
    sortOrder: 10,
  },
];

async function main() {
  const seededRecipes = new Map();

  for (const recipe of recipes) {
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        title: recipe.title,
      },
    });

    if (existingRecipe) {
      const updatedRecipe = await prisma.recipe.update({
        where: {
          id: existingRecipe.id,
        },
        data: recipe,
      });

      seededRecipes.set(updatedRecipe.title, updatedRecipe);
      continue;
    }

    const createdRecipe = await prisma.recipe.create({
      data: recipe,
    });

    seededRecipes.set(createdRecipe.title, createdRecipe);
  }

  const creamyGarlicPasta = seededRecipes.get("Creamy Garlic Pasta");

  for (const recipeIngredient of creamyGarlicPastaIngredients) {
    const ingredient = await prisma.ingredient.upsert({
      where: {
        name: recipeIngredient.name,
      },
      update: {
        category: recipeIngredient.category,
        price: recipeIngredient.price,
      },
      create: {
        category: recipeIngredient.category,
        name: recipeIngredient.name,
        price: recipeIngredient.price,
      },
    });

    await prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: creamyGarlicPasta.id,
          ingredientId: ingredient.id,
        },
      },
      update: {
        amount: recipeIngredient.amount,
        displayQuantity: recipeIngredient.displayQuantity,
        note: recipeIngredient.note,
        pantryStatus: recipeIngredient.pantryStatus,
        sortOrder: recipeIngredient.sortOrder,
        unit: recipeIngredient.unit,
      },
      create: {
        amount: recipeIngredient.amount,
        displayQuantity: recipeIngredient.displayQuantity,
        ingredientId: ingredient.id,
        note: recipeIngredient.note,
        pantryStatus: recipeIngredient.pantryStatus,
        recipeId: creamyGarlicPasta.id,
        sortOrder: recipeIngredient.sortOrder,
        unit: recipeIngredient.unit,
      },
    });
  }

  console.log(
    `Seeded ${recipes.length} recipes and ${creamyGarlicPastaIngredients.length} ingredients.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
