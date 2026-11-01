

import { useEffect, useState } from "react";

import Admin from "./Admin";

import "./App.css";

import dishImages from "./dishImages";



const categories = [

  "All",

  "Starters",

  "Main Course",

  "Rice & Biryani",

  "Breads",

  "Drinks",

];



function RestaurantApp() {

  const [dishes, setDishes] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cart, setCart] = useState([]);

  const [cartOpen, setCartOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [menuError, setMenuError] = useState("");



  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [placingOrder, setPlacingOrder] = useState(false);

  const [orderMessage, setOrderMessage] = useState("");

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");



  useEffect(() => {

    async function fetchMenu() {

      try {

        const response = await fetch("https://kandari-dhabha.onrender.com/api/menu");

        const result = await response.json();



        if (!response.ok || !result.success) {

          throw new Error("Could not load menu.");

        }



        const formattedDishes = result.data.map((dish) => ({

          ...dish,

          id: dish._id,

          image: dishImages[dish.name] || dish.image || "",

          category: [

            "Chicken Biryani",

            "Veg Biryani",

            "Jeera Rice",

            "Veg Fried Rice",

          ].includes(dish.name)

            ? "Rice & Biryani"

            : dish.category,

          tag:

            dish.name === "Butter Chicken" ||

            dish.name === "Chicken Biryani"

              ? "Bestseller"

              : dish.name === "Paneer Tikka"

                ? "Popular"

                : "",

        }));



        setDishes(formattedDishes);

      } catch (error) {

        console.error("Menu loading failed:", error);

        setMenuError(

          "Unable to load dishes. Make sure the backend is running on port 5000."

        );

      } finally {

        setLoading(false);

      }

    }



    fetchMenu();

  }, []);



  const visibleDishes =

    selectedCategory === "All"

      ? dishes

      : dishes.filter((dish) => dish.category === selectedCategory);



  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);



  const cartTotal = cart.reduce(

    (sum, item) => sum + item.price * item.quantity,

    0

  );



  function addToCart(dish) {

    setOrderMessage("");

    setOrderSuccess(false);



    setCart((current) => {

      const existing = current.find((item) => item.id === dish.id);



      if (existing) {

        return current.map((item) =>

          item.id === dish.id

            ? { ...item, quantity: item.quantity + 1 }

            : item

        );

      }



      return [...current, { ...dish, quantity: 1 }];

    });

  }



  function changeQuantity(id, amount) {

    setCart((current) =>

      current

        .map((item) =>

          item.id === id

            ? { ...item, quantity: item.quantity + amount }

            : item

        )

        .filter((item) => item.quantity > 0)

    );

  }



  async function placeOrder(event) {

    event.preventDefault();

    setOrderMessage("");

    setOrderSuccess(false);



    if (cart.length === 0) {

      setOrderMessage("Your cart is empty.");

      return;

    }



    setPlacingOrder(true);



    try {

      const response = await fetch("https://kandari-dhabha.onrender.com/api/orders", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          customerName,

          phone,

          address,

          items: cart.map((item) => ({

            menuItemId: item.id,

            quantity: item.quantity,

          })),

        }),

      });



      const result = await response.json();



      if (!response.ok || !result.success) {

        throw new Error(result.message || "Could not place your order.");

      }



      const orderId = result.data._id;



      window.alert(

        `Order placed successfully!\n\nOrder ID: ${orderId}\nTotal: ₹${result.data.totalAmount}\nStatus: ${result.data.status}`

      );



      setCart([]);

      setCustomerName("");

      setPhone("");

      setAddress("");

      setCheckoutOpen(false);

      setCartOpen(false);

      setOrderMessage(`Order placed successfully! Order ID: ${orderId}`);

      setOrderSuccess(true);

    } catch (error) {

      console.error("Order submission failed:", error);

      setOrderMessage(

        error.message || "Could not connect to the server. Please try again."

      );

      setOrderSuccess(false);

    } finally {

      setPlacingOrder(false);

    }

  }



  async function trackOrder(event) {
    event.preventDefault();
    setTrackedOrder(null);
    setTrackingError("");
    const id = trackingId.trim();

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      setTrackingError("Please enter a valid 24-character order ID.");
      return;
    }

    setTrackingLoading(true);
    try {
      const response = await fetch(`https://kandari-dhabha.onrender.com/api/orders/track/${id}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Order not found.");
      }
      setTrackedOrder(result.data);
    } catch (error) {
      setTrackingError(error.message || "Unable to track your order.");
    } finally {
      setTrackingLoading(false);
    }
  }

  return (

    <div className="site-shell">

      <div className="top-strip">

        <span>GOOD FOOD. GOOD MOOD.</span>

        <span>Made with desi heart ♥</span>

      </div>



      <header className="navbar">

        <a href="#home" className="brand">

          <span className="brand-mark">K</span>

          <span>

            KANDARI <b>DHABHA</b>

            <small>THE DESI FOOD HOUSE</small>

          </span>

        </a>



        <nav className="nav-links">

          <a href="#home">Home</a>

          <a href="#menu">Our Menu</a>

          <a href="#story">Our Story</a>
          <a href="#track-order">Track Order</a>
          <a href="#track-order">Track Order</a>

        </nav>



        <button className="cart-button" onClick={() => setCartOpen(true)}>

          ♧ <span>My Cart</span> <b>{cartCount}</b>

        </button>

      </header>



      <main>

        <section className="hero" id="home">

          <div className="hero-copy">

            <div className="hero-kicker">

              <span /> A LITTLE SPICE, A LOT OF SOUL

            </div>



            <h1>

              BIG FLAVOUR.

              <br />

              <em>DESI SOUL.</em>

            </h1>



            <p>

              From the first bite to the last, experience the warmth of Indian

              comfort food made to bring everyone to the table.

            </p>



            <div className="hero-actions">

              <a className="primary-button" href="#menu">

                Explore Our Menu <span>↗</span>

              </a>

              <a className="text-button" href="#story">

                Discover our story ↓

              </a>

            </div>



            <div className="hero-note">

              <span className="note-icon">✦</span>

              <span>

                <b>Real ingredients. Real flavour.</b>

                <small>Good food, the way it should be.</small>

              </span>

            </div>

          </div>



          <div className="hero-visual">

            <div

              className="hero-photo"

              role="img"

              aria-label="Indian curry and naan"

            />

            <div className="hero-stamp">

              <span>MADE WITH</span>

              <b>♥</b>

              <span>DESI SOUL</span>

            </div>

            <div className="hero-caption">

              <span>01 /</span> YOUR NEXT FAVOURITE MEAL

            </div>

          </div>



          <div className="hero-watermark">DESI</div>

        </section>



        <section className="promise-row">

          <div>

            <span className="promise-icon">✳</span>

            <span>

              <b>Bold Desi Flavours</b>

              <small>Every bite tells a story</small>

            </span>

          </div>

          <div>

            <span className="promise-icon">♨</span>

            <span>

              <b>Freshly Prepared</b>

              <small>Made fresh when you order</small>

            </span>

          </div>

          <div>

            <span className="promise-icon">♡</span>

            <span>

              <b>Made to Share</b>

              <small>Good food brings us together</small>

            </span>

          </div>

        </section>



        <section className="menu-section" id="menu">

          <div className="section-topline">

            <span>STRAIGHT FROM OUR KITCHEN</span>

            <span>01 — THE MENU</span>

          </div>



          <div className="menu-heading">

            <div>

              <h2>

                Hungry? <em>Good.</em>

              </h2>

              <p>

                Comfort food, big portions, and flavours worth coming back for.

              </p>

            </div>

            <span className="menu-count">

              {dishes.length}

              <small>

                DELICIOUS

                <br />

                REASONS

              </small>

            </span>

          </div>



          <div className="category-filters">

            {categories.map((category) => (

              <button

                key={category}

                className={

                  selectedCategory === category ? "filter active" : "filter"

                }

                onClick={() => setSelectedCategory(category)}

              >

                {category}

              </button>

            ))}

          </div>



          {loading ? (

            <p className="menu-message">Loading delicious dishes...</p>

          ) : menuError ? (

            <p className="menu-message">{menuError}</p>

          ) : visibleDishes.length === 0 ? (

            <p className="menu-message">

              No dishes available in this category.

            </p>

          ) : (

            <div className="dish-grid">

              {visibleDishes.map((dish, index) => (

                <article className="dish-card" key={dish.id}>

                  <div className="dish-image-wrap">

                    <img

                      src={dish.image || undefined}

                      alt={dish.name}

                      className="dish-image"

                      loading="lazy"

                      onError={(event) => {

                        event.currentTarget.style.display = "none";

                        event.currentTarget.nextElementSibling.style.display =

                          "flex";

                      }}

                    />



                    <div

                      className="dish-image dish-image-placeholder"

                      role="img"

                      aria-label={`Image unavailable for ${dish.name}`}

                      style={{ display: "none" }}

                    >

                      <span>🍽️</span>

                    </div>



                    {dish.tag && <span className="dish-tag">{dish.tag}</span>}

                    <span className="dish-number">

                      {String(index + 1).padStart(2, "0")}

                    </span>

                  </div>



                  <div className="dish-details">

                    <span className="dish-category">{dish.category}</span>

                    <h3>{dish.name}</h3>

                    <p>{dish.description}</p>



                    <div className="dish-footer">

                      <strong>₹{dish.price}</strong>

                      <button

                        className="add-button"

                        onClick={() => addToCart(dish)}

                        aria-label={`Add ${dish.name} to cart`}

                      >

                        + Add

                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>



        <section className="story-section" id="story">

          <div className="story-image">

            <img

              src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1100&q=85"

              alt="Indian food served fresh"

              loading="lazy"

            />

            <div className="story-badge">

              A TASTE OF

              <br />

              <b>HOME</b> ♥

            </div>

          </div>



          <div className="story-copy">

            <span className="eyebrow">OUR KIND OF COMFORT</span>

            <h2>

              Food tastes better

              <br />

              when it feels like <em>home.</em>

            </h2>

            <p>

              At Kandari Dhabha, we believe a good meal is more than what’s on

              your plate. It’s the aroma of spices, the joy of sharing, and

              that first bite that makes you smile.

            </p>

            <p>

              Come hungry. Leave happy. And always save room for one more bite.

            </p>

            <a href="#menu" className="story-link">

              FIND YOUR FAVOURITE <span>↗</span>

            </a>

          </div>

        </section>



        <section className="menu-section" id="track-order">
          <div className="section-topline">
            <span>YOUR ORDER, YOUR WAY</span>
            <span>02 — ORDER TRACKING</span>
          </div>
          <div className="menu-heading">
            <div>
              <h2>Track your <em>order.</em></h2>
              <p>Enter your order ID to check its latest status.</p>
            </div>
          </div>
          <form className="checkout-form" onSubmit={trackOrder}>
            <label htmlFor="trackingId">Order ID</label>
            <input
              id="trackingId"
              type="text"
              value={trackingId}
              onChange={(event) => setTrackingId(event.target.value)}
              placeholder="Paste your order ID"
              required
            />
            <button type="submit" className="primary-button checkout-button" disabled={trackingLoading}>
              {trackingLoading ? "Checking..." : "Track My Order"}
            </button>
          </form>
          {trackingError && <p className="menu-message" role="alert">{trackingError}</p>}
          {trackedOrder && (
            <div className="dish-details">
              <h3>Order Details</h3>
              <p>Order ID: <strong>{trackedOrder._id}</strong></p>
              <p>Current Status: <strong>{trackedOrder.status}</strong></p>
              <h3>Items</h3>
              {trackedOrder.items.map((item) => (
                <p key={item._id}>{item.name} × {item.quantity} — ₹{item.price * item.quantity}</p>
              ))}
              <h3>Total: ₹{trackedOrder.totalAmount}</h3>
            </div>
          )}
        </section>

        <section className="closing-banner">

          <span>YOUR TABLE IS WAITING</span>

          <h2>

            Bring your appetite.

            <br />

            <em>We'll bring the flavour.</em>

          </h2>

          <a href="#menu" className="primary-button">

            Order Something Delicious ↗

          </a>

          <div className="banner-deco">खाना</div>

        </section>

      </main>



      <footer className="footer">

        <a href="#home" className="brand footer-brand">

          <span className="brand-mark">K</span>

          <span>

            KANDARI <b>DHABHA</b>

            <small>THE DESI FOOD HOUSE</small>

          </span>

        </a>



        <p>Big flavour. Desi soul. Always.</p>

        <a href="#home" className="back-top">

          BACK TO TOP ↑

        </a>



        <div className="footer-bottom">

          <span>© {new Date().getFullYear()} Kandari Dhabha</span>

          <span>MADE FOR THE LOVE OF FOOD ♥</span>

        </div>

      </footer>



      {cartOpen && (

        <div

          className="cart-overlay"

          onClick={() => {

            if (!placingOrder) setCartOpen(false);

          }}

        >

          <aside

            className="cart-panel"

            onClick={(event) => event.stopPropagation()}

          >

            <div className="cart-heading">

              <div>

                <span className="eyebrow">YOUR ORDER</span>

                <h2>

                  Your Cart <em>({cartCount})</em>

                </h2>

              </div>

              <button

                className="close-cart"

                disabled={placingOrder}

                onClick={() => setCartOpen(false)}

              >

                ×

              </button>

            </div>



            {cart.length === 0 ? (

              <div className="empty-cart">

                <span>♡</span>

                <h3>Your cart is hungry.</h3>

                <p>Add something delicious from our menu.</p>

                <button

                  className="primary-button"

                  onClick={() => {

                    setCartOpen(false);

                    document

                      .getElementById("menu")

                      ?.scrollIntoView({ behavior: "smooth" });

                  }}

                >

                  Explore Menu ↗

                </button>

              </div>

            ) : (

              <>

                <div className="cart-items">

                  {cart.map((item) => (

                    <div className="cart-item" key={item.id}>

                      {item.image && <img src={item.image} alt={item.name} />}



                      <div className="cart-item-info">

                        <b>{item.name}</b>

                        <span>₹{item.price} each</span>

                        <div className="quantity-controls">

                          <button onClick={() => changeQuantity(item.id, -1)}>

                            −

                          </button>

                          <span>{item.quantity}</span>

                          <button onClick={() => changeQuantity(item.id, 1)}>

                            +

                          </button>

                        </div>

                      </div>



                      <strong>₹{item.price * item.quantity}</strong>

                    </div>

                  ))}

                </div>



                <div className="cart-total">

                  <span>Subtotal</span>

                  <b>₹{cartTotal}</b>

                </div>



                <p className="cart-note">

                  Delivery charges, if applicable, are not included.

                </p>



                <button

                  className="primary-button checkout-button"

                  disabled={placingOrder}

                  onClick={() => {

                    setOrderMessage("");

                    setOrderSuccess(false);

                    setCheckoutOpen((current) => !current);

                  }}

                >

                  {checkoutOpen

                    ? "Hide Delivery Details ↑"

                    : "Continue to Checkout ↗"}

                </button>



                {checkoutOpen && (

                  <form className="checkout-form" onSubmit={placeOrder}>

                    <h3>Delivery Details</h3>



                    <label htmlFor="customerName">Full Name</label>

                    <input

                      id="customerName"

                      type="text"

                      value={customerName}

                      onChange={(event) => setCustomerName(event.target.value)}

                      required

                      autoComplete="name"

                      placeholder="Enter your full name"

                    />



                    <label htmlFor="phone">Phone Number</label>

                    <input

                      id="phone"

                      type="tel"

                      value={phone}

                      onChange={(event) => setPhone(event.target.value)}

                      required

                      autoComplete="tel"

                      pattern="[0-9]{10}"

                      title="Enter a 10-digit phone number"

                      placeholder="10-digit mobile number"

                    />



                    <label htmlFor="address">Delivery Address</label>

                    <textarea

                      id="address"

                      value={address}

                      onChange={(event) => setAddress(event.target.value)}

                      required

                      autoComplete="street-address"

                      placeholder="House number, street, area, city"

                      rows={3}

                    />



                    <p>

                      Total to pay: <strong>₹{cartTotal}</strong>

                    </p>



                    <button

                      type="submit"

                      className="primary-button checkout-button"

                      disabled={placingOrder}

                    >

                      {placingOrder ? "Placing Order..." : "Place Order"}

                    </button>

                  </form>

                )}

              </>

            )}



            {orderMessage && (

              <p

                className="menu-message"

                role="status"

                style={{

                  color: orderSuccess ? "green" : "inherit",

                  overflowWrap: "anywhere",

                }}

              >

                {orderMessage}

              </p>

            )}

          </aside>

        </div>

      )}

    </div>

  );

}



export default function App() {

  const [showAdmin, setShowAdmin] = useState(false);



  return (

    <>

      <div className="app-switcher">

        <button

          className={!showAdmin ? "app-switch active" : "app-switch"}

          onClick={() => setShowAdmin(false)}

        >

          Restaurant Website

        </button>

        <button

          className={showAdmin ? "app-switch active" : "app-switch"}

          onClick={() => setShowAdmin(true)}

        >

          Admin Dashboard

        </button>

      </div>



      {showAdmin ? <Admin /> : <RestaurantApp />}

    </>

  );

}
