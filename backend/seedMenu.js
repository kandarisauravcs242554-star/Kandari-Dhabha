
require("dotenv").config();

const mongoose = require("mongoose");
const Menu = require("./models/Menu");

const menuItems = [
  {
    name: "Butter Chicken",
    category: "Main Course",
    price: 299,
    description: "Creamy tomato gravy with tender chicken.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398"
  },
  {
    name: "Tandoori Roti",
    category: "Breads",
    price: 25,
    description: "Freshly baked Indian flatbread.",
    image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/09/tandoori-roti-recipe.jpg"
  },
  {
    name: "Paneer Tikka",
    category: "Starters",
    price: 229,
    description: "Grilled paneer with aromatic spices.",
    image: ""
  },
  {
    name: "Chicken Biryani",
    category: "Main Course",
    price: 279,
    description: "Fragrant rice cooked with chicken and spices.",
    image: "https://www.licious.in/blog/wp-content/uploads/2022/06/chicken-hyderabadi-biryani-01.jpg"
  },
  {
    name: "Dal Makhani",
    category: "Main Course",
    price: 199,
    description: "Slow-cooked black lentils in rich gravy.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGAGukPwBgyVSJkFwDd-_qUkSsae3hW1jz-ep7lMxMD3IKLl0kov-vsFxN&s=10"
  },
  {
    name: "Masala Chaas",
    category: "Drinks",
    price: 49,
    description: "Refreshing spiced buttermilk.",
    image: "https://www.spiceupthecurry.com/wp-content/uploads/2020/07/masala-chaas-1.jpg"
  },
  {
    name: "Paneer Butter Masala",
    category: "Main Course",
    price: 249,
    description: "Paneer in creamy tomato gravy.",
    image: ""
  },
  {
    name: "Chicken Handi",
    category: "Main Course",
    price: 329,
    description: "Chicken cooked in traditional handi gravy.",
    image: ""
  },
  {
    name: "Kadai Paneer",
    category: "Main Course",
    price: 239,
    description: "Paneer tossed with peppers and kadai spices.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbT-zDC08xo3BlWUrgKMb3npaLGTZ-ANvTeLmLWAOroJK9zABwzNLB1uA&s=10"
  },
  {
    name: "Egg Curry",
    category: "Main Course",
    price: 179,
    description: "Boiled eggs in spicy Indian gravy.",
    image: "https://sinfullyspicy.com/wp-content/uploads/2014/10/Punjabi-Egg-Curry-Featured-Image.jpg"
  },
  {
    name: "Chicken Tikka",
    category: "Starters",
    price: 269,
    description: "Smoky chicken tikka with Indian spices.",
    image: ""
  },
  {
    name: "Chicken Lollipop",
    category: "Starters",
    price: 249,
    description: "Crispy, spicy chicken lollipops.",
    image: ""
  },
  {
    name: "Veg Manchurian",
    category: "Starters",
    price: 179,
    description: "Vegetable balls tossed in Indo-Chinese sauce.",
    image: "https://www.mygingergarlickitchen.com/wp-content/rich-markup-images/4x3/4x3-veg-manchurian-recipe.jpg"
  },
  {
    name: "Veg Biryani",
    category: "Main Course",
    price: 199,
    description: "Aromatic rice with vegetables and spices.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmoU-yhSmWOzOxmuxqRVi8YtovA0u--BeZHbehru9-Yo3wcASC1q0Ix0fz&s=10"
  },
  {
    name: "Jeera Rice",
    category: "Main Course",
    price: 149,
    description: "Fragrant rice tempered with cumin.",
    image: ""
  },
  {
    name: "Butter Naan",
    category: "Breads",
    price: 45,
    description: "Soft naan brushed with butter.",
    image: "https://maayeka.com/wp-content/uploads/2025/10/butter-naan-tawa-naan-1-of-1.jpg"
  },
  {
    name: "Garlic Naan",
    category: "Breads",
    price: 65,
    description: "Naan topped with aromatic garlic.",
    image: "https://thewhiskaddict.com/wp-content/uploads/2021/02/IMG_6493-1-scaled.jpg"
  },
  {
    name: "Sweet Lassi",
    category: "Drinks",
    price: 79,
    description: "Sweet, creamy yogurt-based drink.",
    image: "https://www.whiskaffair.com/wp-content/uploads/2021/07/Sweet-Lassi-served-in-a-glass.jpg"
  },
  {
    name: "Fresh Lime Soda",
    category: "Drinks",
    price: 59,
    description: "Refreshing lime soda.",
    image: "https://sattvakitchen.com/wp-content/uploads/2024/05/SWEET-LIME-SODA-shutterstock_2309599743-copy-Copy-copy.jpg"
  },
  {
    name: "Veg Fried Rice",
    category: "Main Course",
    price: 189,
    description: "Fried rice with fresh vegetables.",
    image: ""
  }
];

async function seedMenu() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected!");

    await Menu.deleteMany({});
    await Menu.insertMany(menuItems);

    console.log(`${menuItems.length} menu items saved to MongoDB!`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedMenu();
