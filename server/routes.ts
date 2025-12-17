import type { Express } from "express";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  // Menu Items
  app.get("/api/menu-items", async (req, res) => {
    try {
      const items = await storage.getMenuItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  app.post("/api/menu-items", async (req, res) => {
    try {
      const item = await storage.createMenuItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ error: "Failed to create menu item" });
    }
  });

  app.put("/api/menu-items/:itemId", async (req, res) => {
    try {
      const item = await storage.updateMenuItem(req.params.itemId, req.body);
      if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu-items/:itemId", async (req, res) => {
    try {
      const deleted = await storage.deleteMenuItem(req.params.itemId);
      if (!deleted) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ error: "Failed to delete menu item" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:categoryId", async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.categoryId, req.body);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:categoryId", async (req, res) => {
    try {
      const deleted = await storage.deleteCategory(req.params.categoryId);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Extras
  app.get("/api/extras", async (req, res) => {
    try {
      const extras = await storage.getExtras();
      res.json(extras);
    } catch (error) {
      console.error("Error fetching extras:", error);
      res.status(500).json({ error: "Failed to fetch extras" });
    }
  });

  app.post("/api/extras", async (req, res) => {
    try {
      const extra = await storage.createExtra(req.body);
      res.status(201).json(extra);
    } catch (error) {
      console.error("Error creating extra:", error);
      res.status(500).json({ error: "Failed to create extra" });
    }
  });

  app.put("/api/extras/:extraId", async (req, res) => {
    try {
      const extra = await storage.updateExtra(req.params.extraId, req.body);
      if (!extra) {
        return res.status(404).json({ error: "Extra not found" });
      }
      res.json(extra);
    } catch (error) {
      console.error("Error updating extra:", error);
      res.status(500).json({ error: "Failed to update extra" });
    }
  });

  app.delete("/api/extras/:extraId", async (req, res) => {
    try {
      const deleted = await storage.deleteExtra(req.params.extraId);
      if (!deleted) {
        return res.status(404).json({ error: "Extra not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting extra:", error);
      res.status(500).json({ error: "Failed to delete extra" });
    }
  });

  // Drink Options
  app.get("/api/drink-options", async (req, res) => {
    try {
      const drinks = await storage.getDrinkOptions();
      res.json(drinks);
    } catch (error) {
      console.error("Error fetching drink options:", error);
      res.status(500).json({ error: "Failed to fetch drink options" });
    }
  });

  app.post("/api/drink-options", async (req, res) => {
    try {
      const drink = await storage.createDrinkOption(req.body);
      res.status(201).json(drink);
    } catch (error) {
      console.error("Error creating drink option:", error);
      res.status(500).json({ error: "Failed to create drink option" });
    }
  });

  app.put("/api/drink-options/:drinkId", async (req, res) => {
    try {
      const drink = await storage.updateDrinkOption(req.params.drinkId, req.body);
      if (!drink) {
        return res.status(404).json({ error: "Drink option not found" });
      }
      res.json(drink);
    } catch (error) {
      console.error("Error updating drink option:", error);
      res.status(500).json({ error: "Failed to update drink option" });
    }
  });

  app.delete("/api/drink-options/:drinkId", async (req, res) => {
    try {
      const deleted = await storage.deleteDrinkOption(req.params.drinkId);
      if (!deleted) {
        return res.status(404).json({ error: "Drink option not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting drink option:", error);
      res.status(500).json({ error: "Failed to delete drink option" });
    }
  });

  // Acai Turbine
  app.get("/api/acai-turbine", async (req, res) => {
    try {
      const items = await storage.getAcaiTurbine();
      res.json(items);
    } catch (error) {
      console.error("Error fetching acai turbine items:", error);
      res.status(500).json({ error: "Failed to fetch acai turbine items" });
    }
  });

  app.post("/api/acai-turbine", async (req, res) => {
    try {
      const item = await storage.createAcaiTurbineItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating acai turbine item:", error);
      res.status(500).json({ error: "Failed to create acai turbine item" });
    }
  });

  app.put("/api/acai-turbine/:id", async (req, res) => {
    try {
      const item = await storage.updateAcaiTurbineItem(parseInt(req.params.id), req.body);
      if (!item) {
        return res.status(404).json({ error: "Acai turbine item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating acai turbine item:", error);
      res.status(500).json({ error: "Failed to update acai turbine item" });
    }
  });

  app.delete("/api/acai-turbine/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAcaiTurbineItem(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Acai turbine item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting acai turbine item:", error);
      res.status(500).json({ error: "Failed to delete acai turbine item" });
    }
  });

  // Checkout Steps
  app.get("/api/checkout-steps", async (req, res) => {
    try {
      const steps = await storage.getCheckoutSteps();
      res.json(steps);
    } catch (error) {
      console.error("Error fetching checkout steps:", error);
      res.status(500).json({ error: "Failed to fetch checkout steps" });
    }
  });

  app.post("/api/checkout-steps", async (req, res) => {
    try {
      const step = await storage.createCheckoutStep(req.body);
      res.status(201).json(step);
    } catch (error) {
      console.error("Error creating checkout step:", error);
      res.status(500).json({ error: "Failed to create checkout step" });
    }
  });

  app.put("/api/checkout-steps/:stepId", async (req, res) => {
    try {
      const step = await storage.updateCheckoutStep(req.params.stepId, req.body);
      if (!step) {
        return res.status(404).json({ error: "Checkout step not found" });
      }
      res.json(step);
    } catch (error) {
      console.error("Error updating checkout step:", error);
      res.status(500).json({ error: "Failed to update checkout step" });
    }
  });

  app.delete("/api/checkout-steps/:stepId", async (req, res) => {
    try {
      const deleted = await storage.deleteCheckoutStep(req.params.stepId);
      if (!deleted) {
        return res.status(404).json({ error: "Checkout step not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting checkout step:", error);
      res.status(500).json({ error: "Failed to delete checkout step" });
    }
  });

  // Design Config
  app.get("/api/design-config", async (req, res) => {
    try {
      const config = await storage.getDesignConfigFormatted();
      res.json(config);
    } catch (error) {
      console.error("Error fetching design config:", error);
      res.status(500).json({ error: "Failed to fetch design config" });
    }
  });

  app.put("/api/design-config", async (req, res) => {
    try {
      await storage.saveDesignConfigFormatted(req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving design config:", error);
      res.status(500).json({ error: "Failed to save design config" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:orderId/status", async (req, res) => {
    try {
      const order = await storage.updateOrderStatus(req.params.orderId, req.body.status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.delete("/api/orders/:orderId", async (req, res) => {
    try {
      const deleted = await storage.deleteOrder(req.params.orderId);
      if (!deleted) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  // Full Menu Config (combined endpoint for frontend compatibility)
  app.get("/api/menu-config", async (req, res) => {
    try {
      const config = await storage.getMenuConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching menu config:", error);
      res.status(500).json({ error: "Failed to fetch menu config" });
    }
  });

  // Save full Menu Config
  app.put("/api/menu-config", async (req, res) => {
    try {
      await storage.saveMenuConfig(req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving menu config:", error);
      res.status(500).json({ error: "Failed to save menu config" });
    }
  });

  // Checkout Config (combined endpoint)
  app.get("/api/checkout-config", async (req, res) => {
    try {
      const config = await storage.getCheckoutConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching checkout config:", error);
      res.status(500).json({ error: "Failed to fetch checkout config" });
    }
  });

  app.put("/api/checkout-config", async (req, res) => {
    try {
      await storage.saveCheckoutConfig(req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving checkout config:", error);
      res.status(500).json({ error: "Failed to save checkout config" });
    }
  });
}
