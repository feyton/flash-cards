import { extendType, nonNull, nullable, objectType, stringArg } from "nexus";

export const Category = objectType({
  name: "Category",
  definition(t) {
    t.nonNull.int("id"),
      t.nonNull.string("title"),
      t.nullable.string("summary"),
      t.nonNull.list.nonNull.field("cards", {
        type: "Card",
        resolve(parent, args, context) {
          return context.prisma.category
            .findUnique({ where: { id: parent.id } })
            .cards();
        },
      });
  },
});

export const CategoryMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("newCategory", {
      type: "Category",
      args: {
        title: nonNull(stringArg()),
        summary: nullable(stringArg()),
      },
      async resolve(parent, args, context) {
        const { title } = args;
        const { userId } = context;

        if (!userId) {
          throw new Error("Login is required");
        }
        try {
          const cat = await context.prisma.category.create({
            data: {
              title,
              summary: args?.summary ?? "",
            },
          });
          return cat;
        } catch (error) {
          throw new Error("The category title already exists");
        }
      },
    });
  },
});
