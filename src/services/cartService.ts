interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId: string | string[];
}

const getCartItems = (): CartItem[] => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

const addToCart = (dish: CartItem) => {
  const cart = getCartItems();
  const existingItem = cart.find((item) => item.id === dish.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...dish, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
};

const updateQuantity = (id: string, quantity: number) => {
  const cart = getCartItems();
  const updatedCart = cart.map((item) =>
    item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
  );
  localStorage.setItem('cart', JSON.stringify(updatedCart));
};

const removeFromCart = (id: string) => {
  const cart = getCartItems();
  const updatedCart = cart.filter((item) => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
};

const getCartItemCount = (): number => {
  const cart = getCartItems();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

export { getCartItems, addToCart, updateQuantity, removeFromCart, getCartItemCount };