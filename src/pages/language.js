import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      home: "Home",
      products: "Products",
      cart: "Cart",
      contact: "Contact Us",
      orderHistory: "Order History",
      login: "Login",
      logout: "Logout",
      signup: "Signup",
      addToCart: "Add to Cart",
      price: "Price",
      searchPlaceholder: "Search for products...",
      welcome: "Welcome to E-Shop",
      trending: "Trending Products",
      bestDeals: "Best Electronics Deals",
      featuredBrands: "Featured Brands",
      maxPrice: "Max Price",
      sortBy: "Sort By",
      lowToHigh: "Price: Low → High",
      highToLow: "Price: High → Low",
      all: "All",
      cartEmpty: "Your cart is empty.",
      sku: "SKU",
      remove: "Remove",
      total: "Total",
      proceedCheckout: "Proceed to Checkout",
      payment: "Payment",
      language: "Language",

      // ✅ Grouped under "categories"
      categories: {
        mensClothing: "Men's Clothing",
        womensClothing: "Women's Clothing",
        jewelery: "Jewelery",
        electronics: "Electronics",
      },
    },
  },
  hi: {
    translation: {
      home: "होम",
      products: "उत्पाद",
      cart: "कार्ट",
      contact: "संपर्क करें",
      orderHistory: "ऑर्डर हिस्ट्री",
      login: "लॉगिन",
      logout: "लॉगआउट", // ✅ Updated as per your request
      signup: "साइनअप",
      addToCart: "कार्ट में जोड़ें",
      price: "कीमत",
      searchPlaceholder: "उत्पाद खोजें...",
      welcome: "ई-शॉप में आपका स्वागत है",
      trending: "ट्रेंडिंग प्रोडक्ट्स",
      bestDeals: "सर्वश्रेष्ठ इलेक्ट्रॉनिक्स डील्स",
      featuredBrands: "फीचर्ड ब्रांड्स",
      maxPrice: "अधिकतम कीमत",
      sortBy: "क्रमबद्ध करें",
      lowToHigh: "कीमत: कम → ज़्यादा",
      highToLow: "कीमत: ज़्यादा → कम",
      all: "सभी",
      cartEmpty: "आपका कार्ट खाली है।",
      sku: "SKU",
      remove: "हटाएँ",
      total: "कुल",
      proceedCheckout: "चेकआउट पर जाएँ",
      payment: "भुगतान",
      language: "भाषा",

      // ✅ Grouped under "categories"
      categories: {
        mensClothing: "पुरुषों के कपड़े",
        womensClothing: "महिलाओं के कपड़े",
        jewelery: "गहने",
        electronics: "इलेक्ट्रॉनिक्स",
      },
    },
  },
};

// ✅ Get saved language from localStorage
const savedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  interpolation: { escapeValue: false },
});

export default i18n;
