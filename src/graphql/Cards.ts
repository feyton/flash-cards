import { extendType, nonNull, nullable, objectType, stringArg } from "nexus";

export const Card = objectType({
  name: "Card",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("title");
    t.nonNull.string("url");
    t.nullable.string("description");
    t.field("user", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.card
          .findUnique({ where: { id: parent.id } })
          .user();
      },
    });
  },
});

export const CardQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Card",
      resolve(parent, args, context, info) {
        return context.prisma.card.findMany();
      },
    });
  },
});

export const CardMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Card",
      args: {
        title: nonNull(stringArg()),
        url: nonNull(stringArg()),
        description: nullable(stringArg()),
      },
      resolve(parent, args, context) {
        const { title,  url } = args;
        const {userId} = context

        if (!userId) {
          throw new Error("Login is required")
        }
        const card = context.prisma.card.create({
          data: {
            title,
            url,
            description: args.description ?? "",
            user: {connect:{id: userId}}
          },
        });
        return card;
      },
    });
  },
});
