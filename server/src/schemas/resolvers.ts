import { signToken } from '../services/auth.js';
import { AuthenticationError } from 'apollo-server-express';
import { User } from '../models/index.js';
import fetch from 'node-fetch';

interface SearchGoogleBooksArgs {
  query: string;
}

const resolvers = {
  Query: {
    // Get the logged-in user's data
    me: async (_parent: any, _args: any, context: any) => {
      if (context.user) {
        const userData = await User.findById(context.user._id).select('-__v -password');
        return userData;
      }
      throw new AuthenticationError('Not logged in');
    },

    // Get a single user by ID or username
    getSingleUser: async (_parent: any, { id, username }: any) => {
      const user = await User.findOne({ $or: [{ _id: id }, { username }] }).select('-__v -password');
      return user;
    },

    // Search Google Books API
    searchGoogleBooks: async (_parent: any, { query }: SearchGoogleBooksArgs) => {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data from Google Books API');
        }

        const data = await response.json();
        return data.items.map((item: any) => ({
          bookId: item.id,
          title: item.volumeInfo.title || 'No title available',
          authors: item.volumeInfo.authors || ['No authors available'],
          description: item.volumeInfo.description || 'No description available',
          image: item.volumeInfo.imageLinks?.thumbnail || '',
          link: item.volumeInfo.infoLink || '',
        }));
      } catch (err) {
        console.error('Error fetching books:', err);
        throw new Error('Failed to fetch books from Google Books API');
      }
    },
  },

  Mutation: {
    // Create a new user and sign a token
    addUser: async (_parent: any, { username, email, password }: any) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },

    // Login user and return token
    login: async (_parent: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Wrong password!");
      }

      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },

    // Save a book to the user's savedBooks
    saveBook: async (_parent: any, { input }: any, context: any) => {
      console.log("User in saveBook:", context.user); // Debugging

      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("You need to be logged in!");
    },

    // Remove a book from savedBooks
    removeBook: async (_parent: any, { bookId }: any, context: any) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

export default resolvers;