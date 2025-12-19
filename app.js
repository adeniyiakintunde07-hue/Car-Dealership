// Default stock if localStorage is empty
const defaultCars = {
    "car1": { name: "Ferrari 488 GTB", price: 250000.00, img: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=800&q=80" },
    "car2": { name: "Lamborghini Huracán", price: 200000.00, img: "https://images.unsplash.com/photo-1544636331-e2685920319a?auto=format&fit=crop&w=800&q=80" }
};

let luxuryCars = JSON.parse(localStorage.getItem("luxuryCarInventory")) || defaultCars;

const currencyFormatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

const inventory = {
    save: () => localStorage.setItem("luxuryCarInventory", JSON.stringify(luxuryCars)),
    
    upload: (e) => {
        e.preventDefault();
        const id = "car" + Date.now(); // Unique ID
        luxuryCars[id] = {
            name: document.getElementById("car-name").value,
            price: parseFloat(document.getElementById("car-price").value),
            img: document.getElementById("car-img").value
        };
        inventory.save();
        cart.list(); // Refresh UI
        e.target.reset();
    },

    delete: (id) => {
        if(confirm("Are you sure you want to remove this car from the collection?")) {
            delete luxuryCars[id];
            inventory.save();
            cart.list();
        }
    }
};

const cart = {
    items: {},
    hList: document.getElementById("car-list"),
    hItems: document.getElementById("cart-items"),
    hCount: document.getElementById("cart-count"),
    hTotal: document.getElementById("cart-total-price"),
    hCart: document.getElementById("shopping-cart"),

    save: () => localStorage.setItem("luxuryCarCart", JSON.stringify(cart.items)),
    load: () => {
        const storedCart = localStorage.getItem("luxuryCarCart");
        cart.items = storedCart ? JSON.parse(storedCart) : {};
    },

    toggleDisplay: () => cart.hCart.classList.toggle("open"),

    add: (carId) => {
        cart.items[carId] = (cart.items[carId] || 0) + 1;
        cart.save();
        cart.list();
    },

    list: function() {
        cart.hList.innerHTML = "";
        cart.hItems.innerHTML = "";

        // Display Stock
        for (let id in luxuryCars) {
            const car = luxuryCars[id];
            const item = document.createElement("div");
            item.className = "car-item";
            item.innerHTML = `
                <img src="${car.img}" alt="${car.name}" class="car-img">
                <h3>${car.name}</h3>
                <p>${currencyFormatter.format(car.price)}</p>
                <button class="btn-buy" onclick="cart.add('${id}')">Add to Cart</button>
                <button class="btn-delete" onclick="inventory.delete('${id}')">Delete</button>
            `;
            cart.hList.appendChild(item);
        }

        // Display Cart
        let total = 0;
        let itemCount = 0;
        for (let id in cart.items) {
            if (!luxuryCars[id]) continue; // Skip if car was deleted from inventory
            const car = luxuryCars[id];
            const quantity = cart.items[id];
            const subtotal = quantity * car.price;

            const itemElement = document.createElement("li");
            itemElement.innerHTML = `${car.name} (x${quantity}) - ${currencyFormatter.format(subtotal)}`;
            cart.hItems.appendChild(itemElement);
            total += subtotal;
            itemCount += quantity;
        }

        cart.hCount.textContent = itemCount;
        cart.hTotal.textContent = currencyFormatter.format(total);
    },

    showCheckout: () => {
        if (Object.keys(cart.items).length === 0) return alert("Cart is empty");
        document.getElementById("checkout-summary").innerHTML = `Total Amount: ${cart.hTotal.textContent}`;
        document.getElementById("checkout-page").style.display = "flex";
    },

    closeCheckout: () => document.getElementById("checkout-page").style.display = "none",

    finalize: () => {
        alert("Transaction Successful. Welcome to the elite club.");
        cart.nuke();
        cart.closeCheckout();
    },

    nuke: () => {
        cart.items = {};
        cart.save();
        cart.list();
    }
};

window.addEventListener("DOMContentLoaded", () => {
    cart.load();
    cart.list();
});