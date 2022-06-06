import { extendType, nonNull, nullable, objectType, stringArg } from "nexus";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

const SECRET = "test_token";

export const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.nonNull.string("token");
    t.field("user", {
      type: "User",
    });
  },
});

export const AuthMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("signup", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        role: nullable(stringArg()),
      },
      async resolve(parent, args, context) {
        const { email } = args;
        const password = await bcrypt.hash(args.password, 10);
        const user = await context.prisma.user.create({
          data: { email, password, role: args.role ?? "USER" },
        });
        const token = jwt.sign({ userId: user.id, role: user.role }, SECRET);
        return { token, user };
      },
    });
    t.nonNull.field("login", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(parent, args, context) {
        const user = await context.prisma.user.findUnique({
          where: { email: args.email },
        });
        if (!user) {
          throw new Error("No such user found");
        }
        const valid = await bcrypt.compare(args.password, user.password);
        if (!valid) {
          throw new Error("Invalid password");
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, SECRET);
        return { token, user };
      },
    });
  },
});
