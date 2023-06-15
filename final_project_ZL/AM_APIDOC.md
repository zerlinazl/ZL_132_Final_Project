# Pasadena/Glendale Food Products API Documentation
This API contains information about food-related products regarding food 
establishments in the Pasadena/Glendale area. These products primarily include
discounts on products across various food establishments as well as (Zerlina's
products). There is also functionality to contact the creators of the associated
websites with this API, and become a loyal user (for the discount website)! For 
all the endpoints, 500 level errors signal server-side issues, which result in
a generic server error message being sent, while 400 level errors signal client-side
issues, which prompt specific error messages being sent based off of the client-side
error associated with that endpoint.

All endpoints:
* GET /alldiscounts
* GET /discount
* GET /discountfaqs
* POST /discountfeedback
* POST /discountloyalusers
* (@zerlina add your endpoints!)

## *GET /alldiscounts*
**Returned Data Format**: JSON

**Description:** Returns a JSON array of every discount product in the API, such
that each product has the following information available: name, icon, and id.

**Supported Parameters** 
* type (optional)
    * This parameter filters the products for ones that are being offered by restaurants
    * or cafes and returns only those products. Takes "restaurants" or "cafes" as a value.
    * and returns only those products.

**Example Request:** `/alldiscounts?type=restaurants`

**Example Response:**
```json
[
    {
        "name":"Nick's: Saving on Salads",
        "icon":"salad.png",
        "id":"4"
    },
    {
        "name":"Nick's: Fleecing Flatbreads",
        "icon":"roti-canai.png",
        "id":"5"
    },
    {
        "name":"Nick's: Stay Green",
        "icon":"vegetables.png",
        "id":"6"
    },
    {
        "name":"Raffi's: Going Krazy with Chicken Kabobs",
        "icon":"chicken.png",
        "id":"1"
    },
    {
        "name":"Raffi's: Domestic Beer Soup",
        "icon":"beer.png",
        "id":"2"
    },
    {
        "name":"Raffi's: Go Fish",
        "icon":"fish.png",
        "id":"3"
    }
]
```

**Error Handling:**
A 400 error is thrown if the request is given a type query parameter that isn't
"restaurants" or "cafes".

**Example Request:** `/alldiscounts?type=stores`

**Example Response:**
```Invalid query parameter: please put one of the following: restaurants, cafes.```

## *GET /discount*
**Returned Data Format**: JSON

**Description:** Returns a JSON object that represents a discount product, which
contains the following information: price, name, description, items (food items that
the discount can be applied to), icon, type (whether the discount is a combo or not),
id, and rating. To get a specific discount product, one must specify the id of the 
product in the GET request.

**Supported Parameters** 
* id (required)
    * This parameter specifies the product that should be returned from the API.

**Example Request:** `/discount?id=1`

**Example Response:**
```json
{
    "price":"$20",
    "name":"Raffi's: Going Krazy with Chicken Kabobs",
    "description":"Get any chicken kabob for just $20.00!",
    "items":["Chicken Barg Kabob","Chicken Boneless Kabob","Chicken with Bone Kabob","Chicken Koobideh Kabob"],
    "icon":"chicken.png",
    "type":"regular",
    "id":"1",
    "rating":"5/5"
}
```

**Error Handling:**
A 400 error is thrown if the request is given a id parameter that isn't an id of
any discount product.

**Example Request:** `/discount?id=16`

**Example Response:**
```Invalid query parameter: please put one of the following: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15.```

## *GET /discountfaqs*
**Returned Data Format**: JSON

**Description:** Returns a JSON array where each element of the array is a JSON object
that contains a frequently asked question and its corresponding answer regarding the
discount website.

**Example Request:** `/discountfaqs`

**Example Response:**
```json
[
    {
        "question": "Will this site partner with ...",
        "answer": "Yes, we ..."
    },
    {
        "question": "If you become a loyal user, can you get free discounts?",
        "answer": "Unfortunately you can't at the time, but we ..."
    },
    {
        "question": "Can I purchase these discounts at each food place, or only on here?",
        "answer": "As of now, you can only purchase these discounts on this website."
    },
    {
        "question": "Will ...",
        "answer": "Yes, we ..."
    },
    {
        "question": "How long do these discounts last for?",
        "answer": "Each discount expires exactly 1 year after its purchase."
    }
]
```


## *POST /discountfeedback*
**Returned Data Format**: Plain Text

**Description:** This endpoint sends information regarding customer feedback to
this API's web service, specifically including the customer's name, email, and
message that they would like to pass on. If the information was successfully sent,
a success message is sent, otherwise sends details about why the request was invalid.

**Supported Parameters** 
* POST body parameters:
    * name - (required) Customer's name (first and last)
    * email - (required) Customer's email address
    * message - (required) Customer's feedback/questions

**Example Request:** `/discountfeedback`
* POST body parameters: 
    * `name='Ashvin Maheshwar'`
    * `email='amaheshw@caltech.edu'`
    * `message='This website should have more discounts, please add more!'`

**Example Response:**
```Your information has been processed!```

**Error Handling:**
A 400 error is thrown if any of the body parameters (name, email, message) are
missing.

**Example Request:** `/discountfeedback`
* POST body parameters: 
    * `name='Ashvin Maheshwar'`
    * `message='This website should have more discounts, please add more!'`

**Example Response:**
```Missing parameter name, email, or message.```

## *POST /discountloyalusers*
**Returned Data Format**: Plain Text

**Description:** This endpoint sends information regarding customers that have
indicated they want to be loyal users to this API's web service, specifically 
including the customer's name, email, and phone number. If the information was successfully sent,
a success message is sent, otherwise sends details about why the request was invalid.

**Supported Parameters** 
* POST body parameters:
    * name - (required) Customer's name (first and last)
    * email - (required) Customer's email address
    * phone - (required) Customer's phone number (XXX-XXX-XXXX)

**Example Request:** `/discountloyalusers`
* POST body parameters: 
    * `name='Ashvin Maheshwar'`
    * `email='amaheshw@caltech.edu'`
    * `phone='444-333-4445'`

**Example Response:**
```Your information has been processed!```

**Error Handling:**
A 400 error is thrown if any of the body parameters (name, email, phone) are
missing.

**Example Request:** `/discountfeedback`
* POST body parameters: 
    * `name='Ashvin Maheshwar'`
    * `phone='444-333-4445'`

**Example Response:**
```Missing parameter name, email, or phone number.```