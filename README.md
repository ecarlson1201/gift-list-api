## GiftList API
This is the api for GiftList. If you would like to know more about the app, visit the frontend code [here](https://github.com/ecarlson1201/gift-list-client).

### Technology Used
Built with Node, Express, and Mongo/Mongoose.
Deployed using Heroku and TravisCI.

### API Documentation

- POST '/api/users' - create user account (provide valid username and password)
- DELETE '/api/users/delete/:id' - delete account
- POST '/api/auth/login' - login (provide valid username and password)

- GET '/api/accounts/lists/protected' - access account information for authenticated user
- POST '/api/accounts/gifts/search' - search for gifts in database (provide search params in req.body)
- POST '/api/accounts/carousel' - carousel generator
- POST '/api/accounts/gifts' - post gift to database (provide required fields in req.body)
- POST '/api/accounts/lists/protected' - add list to account for authenticated user (provide list title in req.body)
- DELETE '/api/accounts/lists/protected' - delete list from account for authenticated user (provide list id in req.body)
- POST '/api/accounts/giftsave/protected' - save gift to list for authenticated user (provide list and gift ids in req.body)
- PUT '/api/accounts/lists/protected' - remove gift from list for authenticated user (provide list and gift ids in req.body)