const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function getCartToken(): string {
  const key = "arua-cart-token";
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

function getPhone(): string | null {
  return localStorage.getItem("arua-phone");
}

async function fetchAPI(path: string, options?: RequestInit) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Cart-Token": getCartToken(),
  };

  const phone = getPhone();
  if (phone) {
    headers["X-Phone"] = phone;
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...headers,
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

export const api = {
  categories: {
    list: () => fetchAPI("/categories"),
  },
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "";
      return fetchAPI(`/products${qs}`);
    },
  },
  users: {
    lookup: (phone: string) =>
      fetchAPI("/users/lookup", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),
    register: (name: string, phone: string) =>
      fetchAPI("/users", {
        method: "POST",
        body: JSON.stringify({ name, phone }),
      }),
  },
  cart: {
    show: () => fetchAPI("/cart"),
    addItem: (variantId: number, quantity = 1) =>
      fetchAPI("/cart/add_item", {
        method: "POST",
        body: JSON.stringify({ variant_id: variantId, quantity }),
      }),
    updateItem: (id: number, quantity: number) =>
      fetchAPI(`/cart/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      }),
    removeItem: (id: number) =>
      fetchAPI(`/cart/items/${id}`, { method: "DELETE" }),
    clear: () => fetchAPI("/cart/clear", { method: "DELETE" }),
  },
  orders: {
    create: (data: {
      address: {
        street: string;
        neighborhood: string;
        city: string;
        state: string;
        zip: string;
      };
      payment_method: string;
      item_ids: number[];
    }) => fetchAPI("/orders", { method: "POST", body: JSON.stringify(data) }),
  },
  addresses: {
    list: () => fetchAPI("/addresses"),
    create: (data: {
      street: string;
      neighborhood?: string;
      city: string;
      state: string;
      zip: string;
    }) =>
      fetchAPI("/addresses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (
      id: number,
      data: {
        street?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        zip?: string;
        default?: boolean;
      },
    ) =>
      fetchAPI(`/addresses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    destroy: (id: number) => fetchAPI(`/addresses/${id}`, { method: "DELETE" }),
  },
};
