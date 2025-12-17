import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import * as schema from "../shared/schema";

export interface IStorage {
  getMenuItems(): Promise<schema.MenuItem[]>;
  getMenuItem(itemId: string): Promise<schema.MenuItem | undefined>;
  createMenuItem(item: schema.InsertMenuItem): Promise<schema.MenuItem>;
  updateMenuItem(itemId: string, item: Partial<schema.InsertMenuItem>): Promise<schema.MenuItem | undefined>;
  deleteMenuItem(itemId: string): Promise<boolean>;

  getCategories(): Promise<schema.Category[]>;
  createCategory(category: schema.InsertCategory): Promise<schema.Category>;
  updateCategory(categoryId: string, category: Partial<schema.InsertCategory>): Promise<schema.Category | undefined>;
  deleteCategory(categoryId: string): Promise<boolean>;

  getExtras(): Promise<schema.Extra[]>;
  createExtra(extra: schema.InsertExtra): Promise<schema.Extra>;
  updateExtra(extraId: string, extra: Partial<schema.InsertExtra>): Promise<schema.Extra | undefined>;
  deleteExtra(extraId: string): Promise<boolean>;

  getDrinkOptions(): Promise<schema.DrinkOption[]>;
  createDrinkOption(drink: schema.InsertDrinkOption): Promise<schema.DrinkOption>;
  updateDrinkOption(drinkId: string, drink: Partial<schema.InsertDrinkOption>): Promise<schema.DrinkOption | undefined>;
  deleteDrinkOption(drinkId: string): Promise<boolean>;

  getAcaiTurbine(): Promise<schema.AcaiTurbineItem[]>;
  createAcaiTurbineItem(item: schema.InsertAcaiTurbineItem): Promise<schema.AcaiTurbineItem>;
  updateAcaiTurbineItem(id: number, item: Partial<schema.InsertAcaiTurbineItem>): Promise<schema.AcaiTurbineItem | undefined>;
  deleteAcaiTurbineItem(id: number): Promise<boolean>;

  getCheckoutSteps(): Promise<schema.CheckoutStep[]>;
  createCheckoutStep(step: schema.InsertCheckoutStep): Promise<schema.CheckoutStep>;
  updateCheckoutStep(stepId: string, step: Partial<schema.InsertCheckoutStep>): Promise<schema.CheckoutStep | undefined>;
  deleteCheckoutStep(stepId: string): Promise<boolean>;

  getDesignConfig(): Promise<schema.DesignConfig | undefined>;
  saveDesignConfig(config: schema.InsertDesignConfig): Promise<schema.DesignConfig>;

  getOrders(): Promise<schema.Order[]>;
  getOrder(orderId: string): Promise<schema.Order | undefined>;
  createOrder(order: schema.InsertOrder): Promise<schema.Order>;
  updateOrderStatus(orderId: string, status: string): Promise<schema.Order | undefined>;
  deleteOrder(orderId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getMenuItems(): Promise<schema.MenuItem[]> {
    return db.select().from(schema.menuItems);
  }

  async getMenuItem(itemId: string): Promise<schema.MenuItem | undefined> {
    const [item] = await db.select().from(schema.menuItems).where(eq(schema.menuItems.itemId, itemId));
    return item;
  }

  async createMenuItem(item: schema.InsertMenuItem): Promise<schema.MenuItem> {
    const [created] = await db.insert(schema.menuItems).values(item).returning();
    return created;
  }

  async updateMenuItem(itemId: string, item: Partial<schema.InsertMenuItem>): Promise<schema.MenuItem | undefined> {
    const [updated] = await db.update(schema.menuItems).set(item).where(eq(schema.menuItems.itemId, itemId)).returning();
    return updated;
  }

  async deleteMenuItem(itemId: string): Promise<boolean> {
    const result = await db.delete(schema.menuItems).where(eq(schema.menuItems.itemId, itemId)).returning();
    return result.length > 0;
  }

  async getCategories(): Promise<schema.Category[]> {
    return db.select().from(schema.categories);
  }

  async createCategory(category: schema.InsertCategory): Promise<schema.Category> {
    const [created] = await db.insert(schema.categories).values(category).returning();
    return created;
  }

  async updateCategory(categoryId: string, category: Partial<schema.InsertCategory>): Promise<schema.Category | undefined> {
    const [updated] = await db.update(schema.categories).set(category).where(eq(schema.categories.categoryId, categoryId)).returning();
    return updated;
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    const result = await db.delete(schema.categories).where(eq(schema.categories.categoryId, categoryId)).returning();
    return result.length > 0;
  }

  async getExtras(): Promise<schema.Extra[]> {
    return db.select().from(schema.extras);
  }

  async createExtra(extra: schema.InsertExtra): Promise<schema.Extra> {
    const [created] = await db.insert(schema.extras).values(extra).returning();
    return created;
  }

  async updateExtra(extraId: string, extra: Partial<schema.InsertExtra>): Promise<schema.Extra | undefined> {
    const [updated] = await db.update(schema.extras).set(extra).where(eq(schema.extras.extraId, extraId)).returning();
    return updated;
  }

  async deleteExtra(extraId: string): Promise<boolean> {
    const result = await db.delete(schema.extras).where(eq(schema.extras.extraId, extraId)).returning();
    return result.length > 0;
  }

  async getDrinkOptions(): Promise<schema.DrinkOption[]> {
    return db.select().from(schema.drinkOptions);
  }

  async createDrinkOption(drink: schema.InsertDrinkOption): Promise<schema.DrinkOption> {
    const [created] = await db.insert(schema.drinkOptions).values(drink).returning();
    return created;
  }

  async updateDrinkOption(drinkId: string, drink: Partial<schema.InsertDrinkOption>): Promise<schema.DrinkOption | undefined> {
    const [updated] = await db.update(schema.drinkOptions).set(drink).where(eq(schema.drinkOptions.drinkId, drinkId)).returning();
    return updated;
  }

  async deleteDrinkOption(drinkId: string): Promise<boolean> {
    const result = await db.delete(schema.drinkOptions).where(eq(schema.drinkOptions.drinkId, drinkId)).returning();
    return result.length > 0;
  }

  async getAcaiTurbine(): Promise<schema.AcaiTurbineItem[]> {
    return db.select().from(schema.acaiTurbine);
  }

  async createAcaiTurbineItem(item: schema.InsertAcaiTurbineItem): Promise<schema.AcaiTurbineItem> {
    const [created] = await db.insert(schema.acaiTurbine).values(item).returning();
    return created;
  }

  async updateAcaiTurbineItem(id: number, item: Partial<schema.InsertAcaiTurbineItem>): Promise<schema.AcaiTurbineItem | undefined> {
    const [updated] = await db.update(schema.acaiTurbine).set(item).where(eq(schema.acaiTurbine.id, id)).returning();
    return updated;
  }

  async deleteAcaiTurbineItem(id: number): Promise<boolean> {
    const result = await db.delete(schema.acaiTurbine).where(eq(schema.acaiTurbine.id, id)).returning();
    return result.length > 0;
  }

  async getCheckoutSteps(): Promise<schema.CheckoutStep[]> {
    return db.select().from(schema.checkoutSteps).orderBy(schema.checkoutSteps.sortOrder);
  }

  async createCheckoutStep(step: schema.InsertCheckoutStep): Promise<schema.CheckoutStep> {
    const [created] = await db.insert(schema.checkoutSteps).values(step).returning();
    return created;
  }

  async updateCheckoutStep(stepId: string, step: Partial<schema.InsertCheckoutStep>): Promise<schema.CheckoutStep | undefined> {
    const [updated] = await db.update(schema.checkoutSteps).set(step).where(eq(schema.checkoutSteps.stepId, stepId)).returning();
    return updated;
  }

  async deleteCheckoutStep(stepId: string): Promise<boolean> {
    const result = await db.delete(schema.checkoutSteps).where(eq(schema.checkoutSteps.stepId, stepId)).returning();
    return result.length > 0;
  }

  async getDesignConfig(): Promise<schema.DesignConfig | undefined> {
    const [config] = await db.select().from(schema.designConfig).limit(1);
    return config;
  }

  async saveDesignConfig(config: schema.InsertDesignConfig): Promise<schema.DesignConfig> {
    const existing = await this.getDesignConfig();
    if (existing) {
      const [updated] = await db.update(schema.designConfig).set(config).where(eq(schema.designConfig.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(schema.designConfig).values(config).returning();
      return created;
    }
  }

  async getOrders(): Promise<schema.Order[]> {
    return db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
  }

  async getOrder(orderId: string): Promise<schema.Order | undefined> {
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.orderId, orderId));
    return order;
  }

  async createOrder(order: schema.InsertOrder): Promise<schema.Order> {
    const [created] = await db.insert(schema.orders).values(order).returning();
    return created;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<schema.Order | undefined> {
    const [updated] = await db.update(schema.orders).set({ status }).where(eq(schema.orders.orderId, orderId)).returning();
    return updated;
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    const result = await db.delete(schema.orders).where(eq(schema.orders.orderId, orderId)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
