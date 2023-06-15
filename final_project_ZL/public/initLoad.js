/**
 * Zerlina Lai CS132 June 2023
 * This is the main JS client-side code for loading the homepage. It sets up all the menu item cards,
 * and all the functionalities stemming from those cards such as add to cart and single item view.
 */
(function () {

    "use strict";

    function init() {
        // load initial cards
        loadInitDisplay();
    }

    /**
     * Creates DOM element for card. This is what it should look like:
     * <div class="card">
            <img src="imgs/img1.jpg" alt="TODO">
            <h3>Restaurant Name</h3>
            <p>Details about this</p>
        </div>
     * 
     * @param {JSON} data : a menu item. has name, price, tag, and source attribs.
     * @returns {DOM element} a card to add
     */
    function genCard(data) { 
        let cardWrapper = gen("div");
        cardWrapper.setAttribute("class", "card");
        cardWrapper.setAttribute("id", data.name);
        let photo = gen("img");
        photo.src = "imgs/" + data.image;
        photo.alt = data.name;
        let h3 = gen("h3");
        h3.textContent = data.source;
        let detail = gen("p");
        detail.textContent = data.name;
        let price = gen("p");
        price.textContent = "$" + data.price;
        cardWrapper.appendChild(photo);
        cardWrapper.appendChild(h3);
        cardWrapper.appendChild(detail);
        cardWrapper.appendChild(price);
        let addBtn = gen("button");
        addBtn.textContent = "See Details";
        cardWrapper.appendChild(addBtn);
        // add event listener
        addBtn.addEventListener("click", function(){
            singleView(data.name);
        }, false);
        return cardWrapper;
    }

    /**
     * Expands selected card into single item view and hides all other cards.
     * @param {DOM element} cardName matches the small individual card displayed on the main page.
     */
    function singleView(cardName) {
        let item = id(cardName).cloneNode(true);
        item.setAttribute("class", "focusedCard");
        
        qs("article").classList.add("hidden");
        if (!id("leaveSingleView")) {
            let backBtn = gen("button");
            backBtn.setAttribute("id", "leaveSingleView");
            backBtn.textContent = "Back to All";
            qs("main").appendChild(backBtn);
            backBtn.addEventListener("click", function() {
                qs("article").classList.remove("hidden");
                backBtn.classList.add("hidden");
                qs(".focusedCard").innerHTML = "";
                qs(".focusedCard").classList.remove("focusedCard");
                // remove add to cart btn
                let btns = qsa("button");
                for (let i=0; i<btns.length; i++) {
                    if (btns[i].textContent == "Add to Cart") {
                        btns[i].parentElement.removeChild(btns[i]);
                    }
                }
            })
        }
        else {
            id("leaveSingleView").classList.remove("hidden");
        }        
        qs("main").appendChild(item);
        let cartBtn = gen("button");
        cartBtn.textContent = "Add to Cart";
        qs("main").appendChild(cartBtn);
        cartBtn.addEventListener("click", function() {
            addToCart(item);
        })
    }

    /**
     * Adds an item to cart using local storage.
     * @param {DOM element} domElem 
     */
    function addToCart(domElem) {  
        let itemInfo = {
            "item" : domElem.getElementsByTagName("h3")[0].textContent + ": " + domElem.getElementsByTagName("p")[0].textContent,
            "price" : domElem.getElementsByTagName("p")[1].textContent
        }
        let cartContents = {"contents" : ""};
        if (window.localStorage.getItem("cart")) {
            cartContents = JSON.parse(window.localStorage.getItem("cart"));
        }
        cartContents["contents"] = cartContents["contents"] + JSON.stringify(itemInfo) + "|";
        window.localStorage.setItem("cart", JSON.stringify(cartContents));
    }
    /**
     * loads the initial display of the homepage.
     * It shows each of the features, with their themes and descriptions,
     * as well as a selection of menu items from various restaurants that fall 
     * under each feature.
     */
     async function loadInitDisplay() {
        try {
            // create section and display cards for each feature
            let article = gen("article"); // container
            qs("main").appendChild(article);
            let h1 = gen("h1");
            h1.textContent = "Take a look at today's featured menu selection!"
            article.appendChild(h1);
            let resp = await fetch("http://localhost:8000/indexedTags");
            resp = checkStatus(resp);
            let tagsList = await resp.json();
            tagsList = tagsList.tags;
            for (let i=0; i<tagsList.length; i++) {
                let subList = tagsList[i];
                // iterate through number of features
                let sect = gen("div");
                let h2 = gen("h2");
                let param = encodeURIComponent(subList.join(" "));
                let featDet = await fetch("/z_features/" + param + "/details"); 
                featDet = checkStatus(featDet);
                featDet = await featDet.json();
                h2.textContent = featDet.theme;
                let p = gen("p");
                p.textContent = featDet.descrip;
                sect.appendChild(h2);
                sect.appendChild(p);
                qs("article").appendChild(sect);

                let cardDisp = gen("div");
                cardDisp.setAttribute("class", "featured");
                qs("article").appendChild(cardDisp);
                // generate cards 

                let r = await fetch("/z_features/" + param);
                r = checkStatus(r);
                let itemsToCard = await r.json();
                for (let i=0; i<itemsToCard.length; i++) {
                    let data = itemsToCard[i];
                    let card = genCard(data);
                    cardDisp.appendChild(card);
                }
            }
        } catch (err) {
            handleRequestError(err);
        }
    }

    /**
     * error handling
     * @param {error} err 
     */
     function handleRequestError(err) {
        // TODO
        console.log(err.message);
        let disp = gen("p");
        disp.textContent = "Sorry, we couldn't load your request. Please try again later.";
        qs("main").appendChild(disp);
    }

    /**
     * Checks status of response. if not ok, throws error, otherwise returns the response.
     * @param {response} resp 
     * @returns response
     */
     function checkStatus(resp) {
        if (!resp.ok) {
          throw Error(resp.status + " Error: " + resp.statusText);
        }
        return resp;
    }

    init();
})();