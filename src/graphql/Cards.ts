import {
  extendType,
  intArg,
  nonNull,
  nullable,
  objectType,
  stringArg,
} from "nexus";

export const Card = objectType({
  name: "Card",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("title");
    t.nullable.string("content");
    t.nullable.boolean("done");
    t.field("user", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.card
          .findUnique({ where: { id: parent.id } })
          .user();
      },
    });
    t.field("category", {
      type: "Category",
      resolve(parent, args, context) {
        return context.prisma.card
          .findUnique({ where: { id: parent.id } })
          .Category();
      },
    });
  },
});

export const CardQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("cards", {
      type: "Card",
      resolve(parent, args, context, info) {
        return context.prisma.card.findMany();
      },
    });
  },
});
export const CategoryQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("categories", {
      type: "Category",
      resolve(parent, args, context, info) {
        return context.prisma.category.findMany();
      },
    });
  },
});

export const CardMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("newCard", {
      type: "Card",
      args: {
        title: nonNull(stringArg()),
        category: nonNull(intArg()),
        content: nonNull(stringArg()),
      },
      resolve(parent, args, context) {
        const { title, category, content } = args;
        const { userId } = context;

        if (!userId) {
          throw new Error("Login is required");
        }
        const card = context.prisma.card.create({
          data: {
            title,
            content: args.content ?? "",
            user: { connect: { id: userId } },
            Category: { connect: { id: category } },
          },
        });
        return card;
      },
    });
    t.nonNull.field("updateCard", {
      type: "Card",
      args: {
        id: nonNull(intArg()),
        description: nullable(stringArg()),
        title: nullable(stringArg()),
        content: nullable(stringArg()),
      },
      resolve(parent, args, context) {
        const { userId } = context;

        if (!userId) {
          throw new Error("Login is required");
        }
        const updatedCard = context.prisma.card.update({
          where: { id: args.id },
          data: {
            description: args?.description,
            title: args?.title || undefined,
            content: args?.content || undefined,
          },
        });
        return updatedCard;
      },
    });
    t.nonNull.field("deleteCard", {
      type: "Card",
      args: {
        id: nonNull(intArg()),
      },
      resolve(parent, args, context) {
        const { userId } = context;

        if (!userId) {
          throw new Error("Login is required");
        }
        const { id } = args;
        try {
          const deletedCard = context.prisma.card.delete({
            where: { id },
          });
          return deletedCard;
        } catch (error) {
          throw new Error("The card does not exist");
        }
      },
    });
    t.nonNull.field("markDone", {
      type: "Card",
      args: {
        id: nonNull(intArg()),
      },
      resolve(parent, args, context) {
        const { userId } = context;

        if (!userId) {
          throw new Error("Login is required");
        }
        const updatedCard = context.prisma.card.update({
          where: { id: args.id },
          data: {
            done: true,
          },
        });
        return updatedCard;
      },
    });
  },
});
