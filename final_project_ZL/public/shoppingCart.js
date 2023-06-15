/**
 * Zerlina Lai CS132
 * June 2023
 * This is the client-side JS for the shopping cart page. I pulled these functions out to
 * place in their own file because it is uniquely only for the cart.html page.
 */
(function() {
    "use strict";

    function init() {
        // run function on load
        window.addEventListener( "load", showCart);
        id("clear").addEventListener("click", clearCart);
    }

    /**
     * Gets cart items from local storage and displays them.
     * DOM element for display should be in the format:
     * <div class="cart-entry">
            <p>Food 1</p>
            <p>1</p>
            <p>$0.50</p>
        </div>
     */
    function showCart() {
        console.log(window.localStorage.getItem("cart"));
        let cartContents = {"contents" : ""};
        if (window.localStorage.getItem("cart")) {
            cartContents = JSON.parse(window.localStorage.getItem("cart"))["contents"].split("|").slice(0,-1);
        }
        for (let i=0; i<cartContents.length; i++) {
            let info = JSON.parse(cartContents[i]);
            let entryWrapper = gen("div");
            entryWrapper.setAttribute("class", "cart-entry");
            let food = gen("p");
            let price = gen("p");
            let qty = gen("p");
            qty.textContent = "1";
            price.textContent = info.price;
            price.setAttribute("class", "sellprice");
            food.textContent = info.item;
            entryWrapper.appendChild(food);
            entryWrapper.appendChild(qty);
            entryWrapper.appendChild(price);
            qs("section").appendChild(entryWrapper);
        }
        displayTotal();
    }

    /**
     * Creates DOM element to display the total cost of items in cart, and do some tax calculations
     * for a final total as well.
     */
    function displayTotal() {
        let allP = qsa(".sellprice");
        let subtotal = 0;
        for (let i=0; i<allP.length; i++) {
            subtotal = subtotal + parseInt(allP[i].textContent.slice(1,)); // remove $
        }
        let total = subtotal * 1.2 * 1.1025;
        let totalDisp = id("total-info");
        let sub = gen("h4");
        sub.textContent = "Subtotal: $" + subtotal;
        totalDisp.appendChild(sub);
        let p1 = gen("p");
        p1.textContent = "+ 20% Gratuity"
        let p2 = gen("p");
        p2.textContent = "+ 10.25% Sales Tax (CA)"
        let tot = gen("h3");
        tot.textContent = "Total: $" + total.toString().substring(0,5);
        totalDisp.appendChild(p1);
        totalDisp.appendChild(p2);
        totalDisp.appendChild(tot);
    }

    /**
     * removes all items in cart and refreshes page to show empty cart
     */
    function clearCart() {
        let empty = {"contents" : ""};
        window.localStorage.setItem("cart", JSON.stringify(empty));
        location.reload();
    }

    init();

})();