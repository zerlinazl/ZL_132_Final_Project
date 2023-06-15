/**
 * CS 132
 * Name: Ashvin Maheshwar, Zerlina Lai
 * Date: June 5th, 2023
 * Description: GET and POST endpoints for our API.
 */

"use strict";
const express = require("express");
const fs = require("fs/promises");
const multer = require("multer");
const globby = require("globby");
const { response } = require("express");


const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());                       
app.use(multer().none());   

const ERROR = "There seems to be a problem with the server, please try again later!";
const CLIENT_CODE = 400;
const SERVER_CODE = 500;

/**
* This function checks if a query parameter is invalid or not.
* @param {string} queryEntry
* @param {Array} validQueryParams
* @returns {boolean} true if the query was invalid, false if it's not
*/
function invalidQueryChecker(queryEntry, validQueryParams) {
    for (let i = 0; i < validQueryParams.length; i++) {
        if (queryEntry == validQueryParams[i]) {
            return false;
        }
    } 
    return true;
}

/**
* This function sends an appropriate error response depending on whether the
* error was a client-side or server issue, which is identified by the validity
* of the query parameters. Returns a 400 error if the query parameters are invalid,
* and returns a 500 error for any other issues.
* @param {string} queryEntry
* @param {Array} validQueryParams
* @param {Response} res 
*/
function handleError(queryEntry, validQueryParams, res) {
    res.type("text");
    if (invalidQueryChecker(queryEntry, validQueryParams)) {
        res.status(CLIENT_CODE).send("Invalid query parameter:" + 
            " please put one of the following: " + validQueryParams.join(", "));
    }
    else {
        res.status(SERVER_CODE).send(ERROR);
    }
}

/**
* This is a GET endpoint that returns all products' name and icon to be 
* displayed on the associated e-commerice website's "All Products" page.
* It also can filter products based on whether they are from restaurants or
* cafes.
*/
app.get("/alldiscounts", async (req, res) => {
    try {
        let products = [];
        let allProductsJSONFiles;
        if (req.query.type == 'restaurants') {
            allProductsJSONFiles = await globby("base-dir/discounts/restaurants/*/*.json");
        }
        else if (req.query.type == 'cafes') {
            allProductsJSONFiles = await globby("base-dir/discounts/cafes/*/*.json");
        }
        else {
            allProductsJSONFiles = await globby("base-dir/discounts/*/*/*.json");
        }
        for (let i = 0; i < allProductsJSONFiles.length; i++) {
            let productsJSONFile = await fs.readFile(allProductsJSONFiles[i], "utf-8");
            const productsJSON = JSON.parse(productsJSONFile);
            let discounts = productsJSON.discounts;
            for (let j = 0; j < discounts.length; j++) {
                const product = {
                    "name": discounts[j].name, 
                    "icon": discounts[j].icon,
                    "id": discounts[j].id
                };
                products.push(product);
            }
        }
        res.json(products);
    } catch (err) {
        handleError(req.query.type, ["restaurants", "cafes"], res);
    }
});

/**
 * HELPER FUNCTION: Gets a list of all of the active featured tags.
 * @param {boolean} byFeature : whether to return a nested array with feature tags indexed at their feature number
 * @returns list of tags
 */
async function getTagsList(byFeature) {
    try {
        let criteria = [];
        // add feature tags to criteria
        let f = await fs.readFile("base-dir/z_features/featurelist.json");
        f = JSON.parse(f);
        for (let i=0; i<f.features.length; i++) {
            let c = [];
            for (let t=0; t<f.features[i].tags.length; t++) {
                if(byFeature) { 
                    c.push(f.features[i].tags[t]); 
                } else { 
                    criteria.push(f.features[i].tags[t]); 
                }
            }
            if(byFeature) { criteria.push(c); }
        }
        return criteria;
    } catch (err) {
    }
}

/**
 * HELPER FUNCTION: filter JSON from database for sections that match the relevant
 * tags and search params.
 * @param {string} type : type of restaurant to be filtered (bakeries or restaurants)
 * @param {list} criteria : returned from getTagsList. a list of tags to search for
 * @returns JSON of the relevant menu items.
 */
async function filterFeatures(type, criteria) {
    try {
        criteria = criteria.flat(1);
        let allFeatures = [];
        let matchFiles = await globby(["base-dir/" + type + "/*.json", '!base-dir/z_features/*']);
        for (let i=0; i<matchFiles.length; i++) {
            let matchList = await fs.readFile(matchFiles[i]);
            let matchParsed = JSON.parse(matchList);
            for (let mInd=0; mInd<matchParsed.menu.length; mInd++) {
                // check if the menu item matches any of the featured tags
                let isFeature = false;
                for (let a=0; a< criteria.length; a++) {
                    let c = criteria[a];
                    for (let b=0; b<matchParsed.menu[mInd].tags.length; b++) {
                        let tag = matchParsed.menu[mInd].tags[b];
                        if (c == tag) {
                            isFeature = true;
                        }
                    }
                }
                if (isFeature) {
                    allFeatures.push(matchParsed.menu[mInd]);
                }
            }
        }
        return allFeatures;
    } catch (err) {
        res.type("text");
        res.status(SERVER_CODE).send(ERROR);
    }
}

/**
 * Gets the JSON of all featured menu items if no query, and JSON of items from only the relevant type of 
 * eatery otherwise.
 */
app.get("/allfeatures", async(req, res) => {
    try {
        let type;
        if ((req.query.type == "bakeries") || (req.query.type == "restaurants")) {
            type = "z_" + req.query.type;
        }
        else {
            type = "*";
        }
        let matchCatNames = [];
        let matchFiles = await globby(["base-dir/" + type + "/*.json", '!base-dir/z_features/*']);
        for (let i=0; i<matchFiles.length; i++) {
            let m = await fs.readFile(matchFiles[i]);
            m = JSON.parse(m);
            matchCatNames.push(m.menu[0].source);
        }
        res.json({"match" : matchCatNames});

    } catch(err) {
        handleError(req.query.type, ["bakeries", "restaurants"], res);
    }
})

/**
 * returns a list containing the list of the tags for each of the active features.
 * Helps if you want to sort items by feature.
 */
app.get("/indexedTags", async(req, res) => {
    try {
        let tagsList = await getTagsList(true);
        res.json({"tags" : tagsList});
    } catch (err) {
        res.type("text");
        res.status(SERVER_CODE).send(ERROR);
    }
})

/**
 * Returns the menu items matching tags for a specific feature.
 */
app.get("/z_features/:tags", async (req, res) => {
    try {
        const tagsList = await getTagsList(true);
        let validTags = false;
        for (let i=0; i< tagsList.length; i++) {
            let subList = tagsList[i];
            if (subList.join(' ') == req.params.tags) {
                validTags = true;
            }
        }
        if (!validTags) {
            res.status(CLIENT_CODE).send("Invalid tags");
        }
        let response = await filterFeatures("*", req.params.tags.split(" "))
        res.json(response);
    } catch (err) {
        res.type("text");
        res.status(SERVER_CODE).send(ERROR);
    }
})

/**
 * Get the JSON description (theme, hook line) for a given feature by supplying its tags.
 */
 app.get("/z_features/:tags/details", async(req, res) => {
    try {
        const tagsList = await getTagsList(true);
        let validTags = false;
        for (let i=0; i< tagsList.length; i++) {
            let subList = tagsList[i];
            if (subList.join(' ') == req.params.tags) {
                validTags = true;
            }
        }
        if (!validTags) {
            res.status(CLIENT_CODE).send("Invalid tags");
        }
        else {
            let featuresFile = await fs.readFile("base-dir/z_features/featurelist.json");
            const f = JSON.parse(featuresFile);
            let target;
            for (let i=0; i<f.features.length; i++) {
                let feat = f.features[i];
                if (feat.tags.join(" ") == req.params.tags) {
                    target = feat;
                }
            }
            res.json(target);
        }
    } catch (err) {
        res.type("text");
        res.status(SERVER_CODE).send(ERROR);
    }
})

/**
* This function returns the ids of every discount product.
* @returns {Array} Array containing all the product ids.
*/
async function getIds() {
    try {
        let ids = [];
        let allProductsJSONFiles = await globby("base-dir/discounts/*/*/*.json");
        for (let i = 0; i < allProductsJSONFiles.length; i++) {
            let productsJSONFile = await fs.readFile(allProductsJSONFiles[i], "utf-8");
            const productsJSON = JSON.parse(productsJSONFile);
            let discounts = productsJSON.discounts;
            for (let j = 0; j < discounts.length; j++) {
                ids.push(discounts[j].id);
            }
        }
        return ids;
    } catch(err) {
        res.type("text");
        res.status(SERVER_CODE).send(ERROR);
    }
}

/**
* This is a GET endpoint that returns information about a specific product, specified
* by its id value. The product information is returned in JSON format.
*/
app.get("/discount", async (req, res) => {
    try {
        let productId = req.query.id;
        let product;
        let foundProduct = false;
        let allProductsJSONFiles = await globby("base-dir/discounts/*/*/*.json");
        for (let i = 0; i < allProductsJSONFiles.length; i++) {
            if (foundProduct) {
                break;
            }
            let productsJSONFile = await fs.readFile(allProductsJSONFiles[i], "utf-8");
            const productsJSON = JSON.parse(productsJSONFile);
            let discounts = productsJSON.discounts;
            for (let j = 0; j < discounts.length; j++) {
                if (discounts[j].id == productId) {
                    product = discounts[j];
                    foundProduct = true;
                    break;
                }
            }
        }
        res.json(product);
    } catch (err) {
        handleError(req.query.id, getIds(), res);
    }
});

/**
* This function writes provided content to a JSON file, keeping its existing content,
* and handling any error appropriately.
* @param {JSON} newContent
* @param {string} jsonFile
* @param {Response} res
*/
async function writeToJSONFile(newContent, jsonFile, res) {
    res.type("text");
    try {
        let fileContent = await fs.readFile(jsonFile, "utf-8");
        let content = JSON.parse(fileContent);
        content.push(newContent);
        await fs.writeFile(jsonFile, JSON.stringify(content));
        res.send("Your information has been processed!");
    } catch (err1) {
        if (err1.code === "ENOENT") {
            try {
                await fs.writeFile(jsonFile, JSON.stringify([newContent]));
                res.send("Your information has been processed!");
            } catch (err2) {
                res.status(SERVER_CODE).send(ERROR);
            }
        }
        else {
            res.status(SERVER_CODE).send(ERROR);
        }
    }
}

/**
* This is a POST endpoint that takes customer complaint information using their name,
* email, and message, and then stores this in a feedback.json file. 
* Required POST parameters: name, email, message
* Returns a 400 error if any parameters are missing, and a 500 error if there
* are any other issues.
*/
app.post("/discountfeedback", (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let message = req.body.message;
    if (!(name && email && message)) {
        res.status(CLIENT_CODE).send("Missing parameter name, email, or message.");
    }
    else {
        let feedback = {
            "name": name,
            "email": email,
            "message": message
        };
        // let feedbackJSONFile = "base-dir/discounts/feedback.json";
        let feedbackJSONFile = "base-dir/z_features/feedback.json";
        writeToJSONFile(feedback, feedbackJSONFile, res);
    }
});

/**
* This is a GET endpoint that returns all FAQs that have been asked by
* customers as a JSON array. Sends a 500 error if there is an error in retrieving
* this data.
*/
app.get("/discountfaqs", async (req, res) => {
    try {
        let faqFile = await fs.readFile("base-dir/discounts/faq.json");
        let faqJSON = JSON.parse(faqFile);
        res.json(faqJSON);
    } catch (err) {
        res.status(SERVER_CODE).send(ERROR);
    }
});

/**
* This is a GET endpoint that returns all FAQs that have been asked by
* customers as a JSON array. Sends a 500 error if there is an error in retrieving
* this data. names changed for features rather than discounts
*/
app.get("/featurefaqs", async (req, res) => {
    try {
        let faqFile = await fs.readFile("base-dir/z_features/faq.json");
        let faqJSON = JSON.parse(faqFile);
        res.json(faqJSON);
    } catch (err) {
        res.status(SERVER_CODE).send(ERROR);
    }
});

/**
* This is a POST endpoint that takes loyal customer information using their name,
* email, and phone number, and then stores this in a loyal-users.json file. 
* Required POST parameters: name, email, phone
* Returns a 400 error if any parameters are missing, and a 500 error if there
* are any other issues.
*/
app.post("/discountloyalusers", (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    if (!(name && email && phone)) {
        res.status(CLIENT_CODE).send("Missing parameter name, email, or phone number.");
    }
    else {
        let loyalUser = {
            "name": name,
            "email": email,
            "phone": phone
        };
        // let loyalUserJSONFile = "base-dir/discounts/loyal-users.json";
        let loyalUserJSONFile = "base-dir/z_features/loyal-users.json";
        writeToJSONFile(loyalUser, loyalUserJSONFile, res);
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT);