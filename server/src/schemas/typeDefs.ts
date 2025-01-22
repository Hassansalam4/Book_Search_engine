import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks: [Book]
  }

  type Book {
    bookId: String!
    title: String!
    authors: [String]
    description: String
    image: String
    link: String
  }

  # Auth payload: returns a token and user
  type Auth {
    token: ID!
    user: User
  }

  # Input type for saving a book
  input BookInput {
    bookId: String!
    title: String!
    authors: [String]
    description: String
    image: String
    link: String
  }

  type Query {
    # Return the current logged-in user
    me: User

    # Get a user by ID or username
    getSingleUser(id: ID, username: String): User

    # Search Google Books API
    searchGoogleBooks(query: String!): [Book]
  }

  type Mutation {
    # Register a new user
    addUser(username: String!, email: String!, password: String!): Auth

    # Login a user
    login(email: String!, password: String!): Auth

    # Save a book to user's savedBooks
    saveBook(input: BookInput!): User

    # Remove a book by bookId
    removeBook(bookId: String!): User
  }
`;

export default typeDefs;