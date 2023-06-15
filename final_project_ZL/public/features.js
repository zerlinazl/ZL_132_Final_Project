/**
 * Zerlina Lai CS132 June 2023
 * This is the main client-side JS code file for my restaurant dish feature site. It contains functions to
 * toggle between login/register views, submit feedback, register for loyal user program, filter-by-category
 * views.
 */
(function() {
    "use strict";

    // set up event listeners
    function init() {
        let logRegBtns = qsa(".reg");
        for (let b of logRegBtns) {
            b.addEventListener("click", switchLogReg);
        }
        let r = id("load_r");
        if (r) {
            r.addEventListener("click", filterByCat);
            id("load_b").addEventListener("click", filterByCat);
            id("load_all").addEventListener("click", filterByCat);
        }

        if (id("inputf")) {
            id("inputf").addEventListener("submit", function(evt) {
                evt.preventDefault();
                registerUser();} 
            );
        }

        if (id("feedback-form")) {
            id("feedback-form").addEventListener("submit", function(evt) {
                evt.preventDefault();
                submitFeedback();} 
            );
        }

        if(id("showfaq")) {
            id("showfaq").addEventListener("click", loadFAQ);
        }
    }

    /**
     * toggle between login and register views
     */
    function switchLogReg() {
        id("register").classList.toggle("hidden");
        id("login").classList.toggle("hidden");
    }

    /**
     * registers a new user to the loyal customers list.
     * takes phone, name, email.
     */
    async function registerUser() {
        let params = new FormData(id("inputf"));
        console.log(params);
        try {
          let resp = await fetch("/discountloyalusers", { method : "POST", body : params });
          resp = checkStatus(resp);
          resp = await resp.text();
          let result = gen("p");
          result.textContent = resp;
          qs("main").appendChild(result);
        } catch (err) {
          handleRequestError(err);
        }
      }

      /**
       * Submit form info for feedback/customer service page.
       */
      async function submitFeedback() {
        let params = new FormData(id("feedback-form"));
        try {
            let resp = await fetch("/discountfeedback", { method : "POST", body : params });
            resp = checkStatus(resp);
            resp = await resp.text();
            let result = gen("p");
            result.textContent = resp;
            id("feedback").appendChild(result);
          } catch (err) {
            handleRequestError(err);
          }
    }

    /**
     * Fetch and display FAQ on page.
     */
    async function loadFAQ() {
        try {
            let resp = await fetch("/featurefaqs");
            resp = checkStatus(resp);
            resp = await resp.json();
            console.log(resp);
            for (let i=0; i<resp.faq.length; i++) {
                let f = resp.faq[i];
                console.log(f);
                let h4 = gen("h4");
                h4.textContent = f.question;
                let ans = gen("p");
                ans.textContent = f.answer;
                id("faq").appendChild(h4);
                id("faq").appendChild(ans);
                id("showfaq").classList.add("hidden");
            }
        } catch(err) {
            handleRequestError(err);
        }
    }

    /**
     * when user clicks on "restaurants" or "bakeries", features from
     * only the respective category will be displayed. 
     * Fetches a list of eatery names whose cards will be displayed, 
     * and toggles hidden class value for cards that should be hidden.
     */
    async function filterByCat() {
        const q = this.textContent.toLowerCase();
        console.log(q);
        let url = "http://localhost:8000/allfeatures";
        if (q == "restaurants" || q == "bakeries") {
            url = url + "?type=" + q;
        }
        console.log(url);
        try {
            let resp = await fetch(url); 
            resp = checkStatus(resp);
            let data = await resp.json(); // json of a list of restaurant names under the category

            const allCards = qsa(".card");
            for (let c=0; c<allCards.length; c++) {
                allCards[c].classList.add("hidden");
                for (let names=0; names<data.match.length; names++) {
                    if (allCards[c].textContent.includes(data.match[names])) {
                        // remove hidden attribute for the matching card
                        allCards[c].classList.remove("hidden");
                    }
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