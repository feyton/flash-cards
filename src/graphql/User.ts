import { objectType } from "nexus";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("email");
    t.nullable.string("role");
    t.nonNull.string("password");
    t.nonNull.list.nonNull.field("cards", {
      type: "Card",
      resolve(parent, args, context) {
        return context.prisma.user
          .findUnique({ where: { id: parent.id } })
          .cards();
      },
    });
  },
});

