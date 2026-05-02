"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "recipe-remix:user-ingredients";
const STORAGE_CHANGE_EVENT = "recipe-remix:ingredients-change";

const DEFAULT_INGREDIENTS: string[] = [];

let lastStoredIngredients: string | null = null;
let lastIngredientsSnapshot = DEFAULT_INGREDIENTS;

type IngredientsContextValue = {
  ingredients: string[];
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  setIngredients: (ingredients: string[]) => void;
  hasIngredient: (ingredient: string) => boolean;
};

const IngredientsContext = createContext<IngredientsContextValue | null>(null);

export function normalizeIngredient(ingredient: string) {
  return ingredient
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\b(tomatoes|potatoes)\b/g, (match) => match.slice(0, -2))
    .replace(/\bs\b/g, "")
    .replace(/s$/g, "");
}

function uniqueIngredients(ingredients: string[]) {
  const seen = new Set<string>();

  return ingredients
    .map((ingredient) => ingredient.trim())
    .filter(Boolean)
    .filter((ingredient) => {
      const normalized = normalizeIngredient(ingredient);

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

function getStoredIngredients() {
  if (typeof window === "undefined") {
    return DEFAULT_INGREDIENTS;
  }

  const savedIngredients = window.localStorage.getItem(STORAGE_KEY);

  if (savedIngredients === lastStoredIngredients) {
    return lastIngredientsSnapshot;
  }

  if (!savedIngredients) {
    lastStoredIngredients = savedIngredients;
    lastIngredientsSnapshot = DEFAULT_INGREDIENTS;
    return lastIngredientsSnapshot;
  }

  try {
    const parsedIngredients = JSON.parse(savedIngredients);

    if (Array.isArray(parsedIngredients)) {
      lastStoredIngredients = savedIngredients;
      lastIngredientsSnapshot = uniqueIngredients(
        parsedIngredients.filter(
          (ingredient): ingredient is string => typeof ingredient === "string",
        ),
      );
      return lastIngredientsSnapshot;
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  lastStoredIngredients = null;
  lastIngredientsSnapshot = DEFAULT_INGREDIENTS;
  return lastIngredientsSnapshot;
}

function subscribeToIngredients(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_CHANGE_EVENT, onStoreChange);
  };
}

function writeIngredients(ingredients: string[]) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(uniqueIngredients(ingredients)),
  );
  window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
}

export function IngredientsProvider({ children }: { children: ReactNode }) {
  const ingredients = useSyncExternalStore(
    subscribeToIngredients,
    getStoredIngredients,
    () => DEFAULT_INGREDIENTS,
  );

  const setIngredients = useCallback((nextIngredients: string[]) => {
    writeIngredients(nextIngredients);
  }, []);

  const addIngredient = useCallback(
    (ingredient: string) => {
      writeIngredients([...ingredients, ingredient]);
    },
    [ingredients],
  );

  const removeIngredient = useCallback(
    (ingredient: string) => {
      const normalizedIngredient = normalizeIngredient(ingredient);

      writeIngredients(
        ingredients.filter(
          (currentIngredient) =>
            normalizeIngredient(currentIngredient) !== normalizedIngredient,
        ),
      );
    },
    [ingredients],
  );

  const normalizedIngredients = useMemo(
    () => new Set(ingredients.map(normalizeIngredient)),
    [ingredients],
  );

  const hasIngredient = useCallback(
    (ingredient: string) =>
      normalizedIngredients.has(normalizeIngredient(ingredient)),
    [normalizedIngredients],
  );

  const value = useMemo(
    () => ({
      ingredients,
      addIngredient,
      removeIngredient,
      setIngredients,
      hasIngredient,
    }),
    [addIngredient, hasIngredient, ingredients, removeIngredient, setIngredients],
  );

  return (
    <IngredientsContext.Provider value={value}>
      {children}
    </IngredientsContext.Provider>
  );
}

export function useIngredients() {
  const context = useContext(IngredientsContext);

  if (!context) {
    throw new Error("useIngredients must be used inside IngredientsProvider");
  }

  return context;
}
