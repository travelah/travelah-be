# Travelah Backend API

![User Api](https://github.com/travelah/travelah-be/blob/main/arch.png?raw=true)

## Endpoint
Default Url: `"https://travelah-h7wjymk3wa-uc.a.run.app/api/v1"`

| Endpoint                      | Method | Description                           |
|-------------------------------|--------|---------------------------------------|
| `/auth/register`              | POST   | Register a new user                   |
| `/auth/login`                 | POST   | User login                            |
| `/users/profile`              | PUT    | Update user profile                   |
| `/users/profile`              | GET    | Get user profile                      |
| `/posts`                      | GET    | Get all posts                         |
| `/posts/detail/:postId`       | GET    | Get details of a post                 |
| `/posts/all-comments/:postId` | GET    | Get all comments of a specific post   |
| `/posts/mypost`               | GET    | Get posts created by the user         |
| `/posts/like/:postId`         | POST   | Like a specific post                  |
| `/posts/comment/:postId`      | POST   | Comment on a specific post            |
| `/posts/most-liked`           | GET    | Get posts sorted by most likes        |
| `/posts`                      | POST   | Create a new post                     |
| `/posts/:postId`              | DELETE | Delete a specific post                |
| `/posts/:postId`              | PATCH  | Update a specific post                |
| `/chats`                      | GET    | Get all chats                         |
| `/chats/group`                | POST   | Create a new group chat               |
| `/chats/group/:groupId`       | DELETE | Delete a specific group chat          |
| `/chats`                      | GET    | Get all chats                         |
| `/chats/group/:groupId`       | GET    | Get a specific group chat             |


### AUTHORIZATION

**Bearer Token**
Token
`<token>`

### Get All Group

**Endpoint**

`GET /chats/?page=1&take=10`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

- page: `<Number>`
- take: `<Number>`

**Example Response**

Status: 200 OK

```json
{
  "data": [
    {
      "id": 59,
      "userId": 4,
      "createdAt": "2023-06-16T10:31:05.993Z",
      "updatedAt": "2023-06-16T10:31:05.993Z",
      "chats": [
        {
          "id": 209,
          "groupChatId": 59,
          "question": "recomend",
          "response": "Hey there! Let's embark on an Indonesian journey together! I'm your virtual guide, excited and ready to go!",
          "altIntent1": null,
          "altIntent2": null,
          "followUpQuestion": null,
          "places": [],
          "userId": 4,
          "chatType": 0,
          "createdAt": "2023-06-16T11:56:30.622Z",
          "updatedAt": "2023-06-16T11:56:30.622Z",
          "bookmarked": false
        }
      ]
    },
  ],
  "message": "Your Group Chat with also the latest chat has been retrieved",
  "status": true
}
```
### Register

**Endpoint**

`POST /auth/register`

**Params**

- email: `<String>`
- password: `<String>`
- fullName: `<String>`

**Example Response**

Status: 201 OK

```json
{
  "data": {
    "fullName": "messi"
  },
  "message": "Registration success",
  "status": true
}
```
### Login

**Endpoint**

`POST /auth/login`

**Params**

- email: `<String>`
- password: `<String>`

**Example Response**

Status: 200 OK

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTY4NjgyNjY2MywiZXhwIjoxNzE4Mzg0MjYzfQ.sIqGTSB7ekARnOWV_VCnFSWi6qe9PeKy1rA5HKD0bVk"
  },
  "message": "Login succeed, enjoy your trip",
  "status": true
}
```
### Update Profile

**Endpoint**

`PUT /users/profile`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

- fullName: `<String>`
- aboutMe: `<String>`
- age: `<Number>`
- occupation: `<String>`
- location: `<String>`
- photo: `<File>`

**Example Response**

Status: 201 OK

```json
{
  "data": {
    "id": 1,
    "email": "test@test.com",
    "password": "$2b$12$6b4TT/1F/MlocIkZZx5pwOe81KRGMh2vr/ReYLyaSIcKXqEPGwJvC",
    "fullName": "yuriko",
    "isSignedByGoogle": false,
    "aboutMe": "dduaus",
    "age": 12,
    "occupation": "ysuh",
    "location": "sdd",
    "profilePicPath": "https://storage.googleapis.com/travelah-storage/public/images",
    "profilePicName": "1686826694101-img.png",
    "createdAt": "2023-06-14T17:37:13.987Z",
    "updatedAt": "2023-06-14T17:37:13.987Z"
  },
  "message": "Profile updated successfully",
  "status": true
}
```
### Create Post

**Endpoint**

`POST /posts`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

- title: `<String>`
- description: `<String>`
- longitude: `<String>`
- latitude: `<String>`
- photo: `<File>`

**Example Response**

Status: 201 OK

```json
{
  "data": {
    "id": 2,
    "userId": 4,
    "title": "Cloud Architecture",
    "description": "Ini adalah architecture gcloud yang kami gunakan",
    "longitude": "106.895632",
    "latitude": "-6.302577",
    "location": "MVXW+38F, Area Tmii Jl. Taman Mini Indonesia Indah, Ceger, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13820, Indonesia",
    "postPhotoPath": "https://storage.googleapis.com/travelah-storage/public/images",
    "postPhotoName": "1686840211564-Architecture- Gcloud.png",
    "createdAt": "2023-06-15T14:43:35.753Z",
    "updatedAt": "2023-06-15T14:43:35.753Z"
  },
  "message": "New Post has been created",
  "status": true
}
```
### Update Post

**Endpoint**

`PATCH /posts/:postId`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

- title: `<String>`
- description: `<String>`
- longitude: `<String>`
- latitude: `<String>`
- photo: `<File>`

**Example Response**

Status: 201 OK

```json
{
  "data": {
    "id": 2,
    "userId": 4,
    "title": "Cloud Architecture",
    "description": "Update Gcloud Architecture",
    "longitude": "106.895632",
    "latitude": "-6.302577",
    "location": "MVXW+38F, Area Tmii Jl. Taman Mini Indonesia Indah, Ceger, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13820, Indonesia",
    "postPhotoPath": "https://storage.googleapis.com/travelah-storage/public/images",
    "postPhotoName": "1686840211564-Architecture- Gcloud.png",
    "createdAt": "2023-06-15T14:43:35.753Z",
    "updatedAt": "2023-06-15T14:45:39.403Z"
  },
  "message": "Post with id 2 has been updated",
  "status": true
}
```
### Get All Post

**Endpoint**

`GET /posts/`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

- page: `<Number>`
- take: `<Number>`

**Example Response**

Status: 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "userId": 4,
      "title": "architecture",
      "description": "asdasfdsfsdfsdfdsfsfas",
      "longitude": "106.895632",
      "latitude": "-6.302577",
      "location": "MVXW+38F, Area Tmii Jl. Taman Mini Indonesia Indah, Ceger, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13820, Indonesia",
      "postPhotoPath": "https://storage.googleapis.com/travelah-storage/public/images",
      "postPhotoName": "1686840174496-Architecture- Gcloud.png",
      "createdAt": "2023-06-15T14:42:59.025Z",
      "updatedAt": "2023-06-15T14:42:59.025Z",
      "posterFullName": "messi",
      "profilePicOfUser": null,
      "likeCount": 0,
      "dontLikeCount": 0,
      "commentCount": 0,
      "isUserLike": false,
      "isUserDontLike": false
    },
    {
      "id": 2,
      "userId": 4,
      "title": "Cloud Architecture",
      "description": "Update Gcloud Architecture",
      "longitude": "106.895632",
      "latitude": "-6.302577",
      "location": "MVXW+38F, Area Tmii Jl. Taman Mini Indonesia Indah, Ceger, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13820, Indonesia",
      "postPhotoPath": "https://storage.googleapis.com/travelah-storage/public/images",
      "postPhotoName": "1686840211564-Architecture- Gcloud.png",
      "createdAt": "2023-06-15T14:43:35.753Z",
      "updatedAt": "2023-06-15T14:45:39.403Z",
      "posterFullName": "messi",
      "profilePicOfUser": null,
      "likeCount": 0,
      "dontLikeCount": 0,
      "commentCount": 0,
      "isUserLike": false,
      "isUserDontLike": false
    }
  ],
  "message": "All Post has been retrieved",
  "status": true
}
```
### Get Detail Post

**Endpoint**

`GET /posts/detail/:postId`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

- postId: `<Number>`

**Example Response**

Status: 200 OK

```json
{
  "data": {
    "id": 2,
    "userId": 4,
    "title": "Cloud Architecture",
    "description": "Update Gcloud Architecture",
    "longitude": "106.895632",
    "latitude": "-6.302577",
    "location": "MVXW+38F, Area Tmii Jl. Taman Mini Indonesia Indah, Ceger, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13820, Indonesia",
    "postPhotoPath": "https://storage.googleapis.com/travelah-storage/public/images",
    "postPhotoName": "1686840211564-Architecture- Gcloud.png",
    "createdAt": "2023-06-15T14:43:35.753Z",
    "updatedAt": "2023-06-15T14:45:39.403Z",
    "comments": [],
    "profilePicOfUser": null,
    "posterFullName": "messi",
    "likeCount": 0,
    "dontLikeCount": 0,
    "commentCount": 0,
    "isUserLike": false,
    "isUserDontLike": false
  },
  "message": "Post with id 2 has been retrieved",
  "status": true
}
```
### Delete Post

**Endpoint**

`DELETE /posts/:postId`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

- postId: `<Number>`

**Example Response**

Status: 201 OK

```json
{
  "data": {
    "id": 1,
    "userId": 4,
    "title": "architecture",
    "description": "asdasfdsfsdfsdfdsfsfas",
    "longitude": "106.895632",
    "latitude": "-6.302577",
    "location": "MVXW+38F, Area Tmii Jl. Taman Mini Indonesia Indah, Ceger, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13820, Indonesia",
    "postPhotoPath": "https://storage.googleapis.com/travelah-storage/public/images",
    "postPhotoName": "1686840174496-Architecture- Gcloud.png",
    "createdAt": "2023-06-15T14:42:59.025Z",
    "updatedAt": "2023-06-15T14:42:59.025Z"
  },
  "message": "Post with id 1 has been deleted",
  "status": true
}
```
### Like a Post

**Endpoint**

`POST /posts/like/:postId/`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

- likeType: `<String>`

**Example Response**

Status: 201 OK

```json
{
  "data": {
    "id": 2,
    "userId": 4,
    "likeType": "LIKE",
    "postId": 2,
    "createdAt": "2023-06-15T14:53:43.668Z",
    "updatedAt": "2023-06-15T14:53:43.668Z"
  },
  "message": "Post with id 2 has been liked or Disliked",
  "status": true
}
```
### Get 3 Most Liked Post

**Endpoint**

`GET /posts/most-liked`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

**Example Response**

Status: 201 OK

```json
{
  "data": [
    {
      "id": 2,
      "userId": 4,
      "title": "Cloud Architecture",
      "description": "Update Gcloud Architecture",
      "longitude": "106.895632",
      "latitude": "-6.302577",
      "location": "MVXW+38F, Area Tmii Jl. Taman Mini Indonesia Indah, Ceger, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13820, Indonesia",
      "postPhotoPath": "https://storage.googleapis.com/travelah-storage/public/images",
      "postPhotoName": "1686840211564-Architecture- Gcloud.png",
      "createdAt": "2023-06-15T14:43:35.753Z",
      "updatedAt": "2023-06-15T14:45:39.403Z",
      "posterFullName": "messi",
      "profilePicOfUser": null,
      "likeCount": 1,
      "dontLikeCount": 0,
      "commentCount": 0,
      "isUserLike": false,
      "isUserDontLike": false
    },
    {
      "id": 3,
      "userId": 4,
      "title": "Cloud Architecture",
      "description": "Ini adalah architecture gcloud yang kami gunakan",
      "longitude": "106.895632",
      "latitude": "-6.302577",
      "location": "MVXW+38F, Area Tmii Jl. Taman Mini Indonesia Indah, Ceger, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13820, Indonesia",
      "postPhotoPath": "https://storage.googleapis.com/travelah-storage/public/images",
      "postPhotoName": "1686840866707-Architecture- Gcloud.png",
      "createdAt": "2023-06-15T14:54:30.966Z",
      "updatedAt": "2023-06-15T14:54:30.966Z",
      "posterFullName": "messi",
      "profilePicOfUser": null,
      "likeCount": 1,
      "dontLikeCount": 0,
      "commentCount": 0,
      "isUserLike": false,
      "isUserDontLike": false
    },
    {
      "id": 4,
      "userId": 4,
      "title": "Cloud Architecture",
      "description": "Ini adalah architecture gcloud yang kami gunakan",
      "longitude": "106.895632",
      "latitude": "-6.302577",
      "location": "MVXW+38F, Area Tmii Jl. Taman Mini Indonesia Indah, Ceger, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13820, Indonesia",
      "postPhotoPath": "https://storage.googleapis.com/travelah-storage/public/images",
      "postPhotoName": "1686840873796-Architecture- Gcloud.png",
      "createdAt": "2023-06-15T14:54:38.186Z",
      "updatedAt": "2023-06-15T14:54:38.186Z",
      "posterFullName": "messi",
      "profilePicOfUser": null,
      "likeCount": 1,
      "dontLikeCount": 0,
      "commentCount": 0,
      "isUserLike": false,
      "isUserDontLike": false
    }
  ],
  "message": "3 most liked post has been retrieved",
  "status": true
}
```
### Comment a Post

**Endpoint**

`POST /posts/comments/postId`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

- description: `<String>`

**Example Response**

Status: 201 OK

```json
{
  "data": {
    "id": 1,
    "description": "Architecture yang rapih",
    "userId": 3,
    "postId": 3,
    "createdAt": "2023-06-15T14:59:17.644Z",
    "updatedAt": "2023-06-15T14:59:17.644Z"
  },
  "message": "Post with id 3 has been commented",
  "status": true
}
```
### Create GroupChat

**Endpoint**

`POST /chats/group/`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

**Example Response**

Status: 201 OK

```json
{
  "data": {
    "id": 13
  },
  "message": "New Group Chat has been created",
  "status": true
}
```
### Get All Group Chat

**Endpoint**

`POST /chats/`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**
- page: `<Number>`
- take: `<Number>`

**Example Response**

Status: 200 OK

```json
{
  "data": [
    {
      "id": 59,
      "userId": 4,
      "createdAt": "2023-06-16T10:31:05.993Z",
      "updatedAt": "2023-06-16T10:31:05.993Z",
      "chats": [
        {
          "id": 209,
          "groupChatId": 59,
          "question": "recomend",
          "response": "Hey there! Let's embark on an Indonesian journey together! I'm your virtual guide, excited and ready to go!",
          "altIntent1": null,
          "altIntent2": null,
          "followUpQuestion": null,
          "places": [],
          "userId": 4,
          "chatType": 0,
          "createdAt": "2023-06-16T11:56:30.622Z",
          "updatedAt": "2023-06-16T11:56:30.622Z",
          "bookmarked": false
        }
      ]
    },
    {
      "id": 62,
      "userId": 4,
      "createdAt": "2023-06-16T11:10:40.149Z",
      "updatedAt": "2023-06-16T11:10:40.149Z",
      "chats": [
        {
          "id": 175,
          "groupChatId": 62,
          "question": "indonesian",
          "response": "Great! Here's your itinerary for your trip:\nDay 1-6: Ubud\nWhen you are in Ubud, the Best Place to Stay based on your preference is in the The Sender Pool Suites or any other hotel of your choice. You can enjoy beach by exploring the Berawa Beach and Raja Lima. For food preferences, you can try eating at In Da Compound Warung.",
          "altIntent1": null,
          "altIntent2": null,
          "followUpQuestion": "can you recommend me holiday in ubud beaxh beach swimming pool indonesian",
          "places": [
            {
              "lat": -8.6637779,
              "lng": 115.1359348,
              "place": "Berawa Beach"
            },
            {
              "lat": -8.7787791,
              "lng": 115.6169247,
              "place": "Raja Lima"
            },
            {
              "lat": -8.5099276,
              "lng": 115.2584608,
              "place": "The Sender Pool Suites"
            },
            {
              "lat": -8.508572899999999,
              "lng": 115.2642564,
              "place": "In Da Compound Warung"
            }
          ],
          "userId": 4,
          "chatType": 2,
          "createdAt": "2023-06-16T11:11:04.200Z",
          "updatedAt": "2023-06-16T11:11:04.200Z",
          "bookmarked": false
        }
      ]
    }
  ],
  "message": "Your Group Chat with also the latest chat has been retrieved",
  "status": true
}
```

### Get GroupChat by Id

**Endpoint**

`GET /chats/group/1?page=1&take=3`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Params**

- page: `<Number>`
- take: `<Number>`

**Example Response**

Status: 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "userId": 3,
      "createdAt": "2023-06-15T10:38:11.192Z",
      "updatedAt": "2023-06-15T10:38:11.192Z",
      "chats": [
        {
          "id": 25,
          "groupChatId": 1,
          "question": "asd",
          "response": "sdf",
          "altIntent1": null,
          "altIntent2": null,
          "followUpQuestion": null,
          "places": null,
          "userId": 2,
          "chatType": 2,
          "createdAt": "2023-06-14T19:40:55.761Z",
          "updatedAt": "2023-06-14T19:40:55.761Z",
          "bookmarked": false
        }
      ]
    }
  ],
  "message": "GroupChat with id 1 has been retrieved",

"status": true
}
```

### Delete Group Chat

**Endpoint**

`DELETE /chats/group/1`

**Headers**

- AUTHORIZATION: Bearer Token `<token>`

**Example Response**

Status: 201 CREATED

```json
{
  "message": "Group Chat with id 75 has been deleted",
  "status": true
}
```

## Socket.io 
Realtime connection with client `in this term, the client is android.`

Default Url: `"https://travelah-h7wjymk3wa-uc.a.run.app"`

| Event Listener                | Description                                   |
|-------------------------------|-----------------------------------------------|
| createGroupChat               | Create new group chat                         |
| getGroupChat                  | Get one spesific groupChat by groupId         |
| getAllChatFromGroupChat       | Get all chat from spesific groupChat          |
| createChatByGroup             | Create new chat from spesific groupChat       |
| deleteChat                    | Delete spesific chat                          |
| deleteGroupChat               | Delete groupChat                              |
