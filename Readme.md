# User-API

User-API is a rest api which stores user data, get user data and authenticate user. It stores the data in mongodb. Password hashing and image upload functionality is also provided.

## Installation

Start the server by:

```bash
yarn start
```

To start in dev mode:

```bash
yarn run dev
```

## API Endpoints

### GET User

Get user details

```bash
http://localhost:9000/:email
```

### POST User

Create a user

```bash
http://localhost:9000/
```

#### Body

Data type: mulltipart/form-data

```json
{
  "firstName": "first name",
  "lastName": "last name",
  "profilePic": "upload file",
  "email": "email",
  "password": "password",
  "mobileNumber": "mobileNumber"
}
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
