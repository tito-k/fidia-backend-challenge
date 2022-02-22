import bcrypt from "bcrypt";
import {
  UserInputError,
  AuthenticationError,
  ValidationError,
  ForbiddenError,
} from "apollo-server";
import User from "../../model/user.model.js";
import Token from "../../model/token.model.js";
import { generateAuthToken } from "../../helper/auth.helper.js";
import { verifyAuthToken } from "../../middleware/auth.middleware.js";
import { sendMail } from "../../helper/mailer.helper.js";

const resolvers = {
  Query: {
    getAllRegisteredUsers: async () => {
      const registeredUsers = await User.find({ emailVerified: true });
      return registeredUsers;
    },
    userVerified: async (parent, args, context, info) => {
      const { token, email } = args;

      const verifyToken = await Token.findOne({ token });

      if (!verifyToken) {
        throw new ValidationError("Invalid token.");
      }

      const user = await User.findOne({
        _id: verifyToken.userId,
        email: email,
      });

      if (!user) {
        throw new ValidationError(
          "We were unable to find a user for this link. Please signup."
        );
      }

      if (user.emailVerified) {
        return "Your email has already been verified.";
      }

      const checkToken = await verifyAuthToken(token);

      if (!checkToken) {
        return `Your token has expired. Go the the link to resend a new verification email: http://localhost:3427/graphql?query=query{sendVerificationMail(token:"${token}")}`;
      }

      user.emailVerified = true;
      user.save();

      return "Your email has been verified.";
    },
    sendVerificationMail: async (parent, args, context, info) => {
      const { token } = args;

      const verifyToken = await Token.findOne({ token });

      if (!verifyToken) {
        throw new ValidationError("Invalid token.");
      }

      const user = await User.findOne({
        _id: verifyToken.userId,
      });

      if (!user) {
        throw new ValidationError(
          "We were unable to find a user for this link. Please signup."
        );
      }

      const newToken = generateAuthToken({
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
      });

      await Token.findOneAndUpdate(
        {
          _id: verifyToken._id,
        },
        {
          $set: {
            token: newToken,
          },
        },
        {
          new: true,
        }
      ).then((token) => {
        sendMail({
          to: user.email,
          subject: "Verify your Fidia Account!",
          html: `<p>Hello, <strong>${user.name}.</strong></p><p>Please verify your account by clicking the link: <a href="http://localhost:3427/graphql?query=query{userVerified(token:"${token.token}"email:"${user.email}")}">verify my Fidia account</a> or copy the url below: <p><center>http://localhost:3427/graphql?query=query{userVerified(token:"${token.token}"email:"${user.email}")}</center></p><p>Thank you!</p>`,
        });
      });

      return "Verification email sent successfully.";
    },
  },
  Mutation: {
    createUser: async (parent, args, context, info) => {
      const { name, email, password, mobileNumber, country } = args.user;

      const user = await User.findOne({ email });

      if (user) {
        throw new ForbiddenError("User already exists");
      }

      try {
        const user = await User.create({
          name,
          email,
          password,
          mobileNumber,
          country,
        });
        const token = generateAuthToken({
          id: user._id,
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
        });
        await Token.create({
          userId: user._id,
          token: token,
        }).then((token) => {
          sendMail({
            to: email,
            subject: "Welcome to Fidia!",
            html: `<p>Hello, <strong>${name}.</strong></p><p>Welcome to <strong><em>Fidia</em></strong>.<p><h3>We are the best at what we do!</h3></p></p><p>Please verify your account by clicking the link: <a href="http://localhost:3427/graphql?query=query{userVerified(token:"${token.token}"email:"${email}")}">verify my Fidia account</a> or copy the url below: <p><center>http://localhost:3427/graphql?query=query{userVerified(token:"${token.token}"email:"${email}")}</center></p><p>Thank you!</p>`,
          });
        });
        return user;
      } catch (error) {
        throw new ValidationError(
          "User could not be created. Please try again later."
        );
      }
    },
    verifyUser: async (parent, args, context, info) => {
      const { token, email } = args;

      const verifyToken = await Token.findOne({ token });

      if (!verifyToken) {
        throw new ValidationError("Invalid token.");
      }

      const user = await User.findOne({
        _id: verifyToken.userId,
        email: email,
      });

      if (!user) {
        throw new ValidationError(
          "We were unable to find a user for this link. Please signup."
        );
      }

      if (user.emailVerified) {
        return "Your email has already been verified.";
      }

      user.emailVerified = true;
      user.save();

      return "Your email has been verified.";
    },
    resendVerificationMail: async (parent, args, context, info) => {
      const { token } = args;

      const verifyToken = await Token.findOne({ token });

      if (!verifyToken) {
        throw new ValidationError("Invalid token.");
      }

      const user = await User.findOne({
        _id: verifyToken.userId,
      });

      if (!user) {
        throw new ValidationError(
          "We were unable to find a user for this link. Please signup."
        );
      }

      const newToken = generateAuthToken({
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
      });

      await Token.findOneAndUpdate(
        {
          _id: verifyToken._id,
        },
        {
          $set: {
            token: newToken,
          },
        },
        {
          new: true,
        }
      ).then((token) => {
        sendMail({
          to: user.email,
          subject: "Verify your Fidia Account!",
          html: `<p>Hello, <strong>${user.name}.</strong></p><p>Please verify your account by clicking the link: <a href="http://localhost:3427/graphql?query=query{userVerified(token:"${token.token}"email:"${user.email}")}">verify my Fidia account</a> or copy the url below: <p><center>http://localhost:3427/graphql?query=query{userVerified(token:"${token.token}"email:"${user.email}")}</center></p><p>Thank you!</p>`,
        });
      });

      return "Verification email sent successfully.";
    },
    loginUser: async (parent, args, context, info) => {
      const { email, password } = args;

      const user = await User.findOne({ email: email });

      if (!user) {
        throw new UserInputError("Email or password is incorrect.");
      }

      if (!user.emailVerified) {
        throw new AuthenticationError(
          "Email is not verified. Please check your email to verify your account."
        );
      }

      const validatePassword = bcrypt.compareSync(password, user.password);

      if (!validatePassword) {
        throw new AuthenticationError("Email or password is incorrect.");
      }

      const token = generateAuthToken({
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
      });

      return {
        user,
        token,
      };
    },
  },
};

export default resolvers;
