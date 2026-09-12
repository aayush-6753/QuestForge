import { describe, expect, it } from "vitest";
import { queryKeys } from "./query-keys";

describe("query keys", () => {
  it("keeps gameplay caches named consistently", () => {
    expect(queryKeys.me).toEqual(["me"]);
    expect(queryKeys.quests).toEqual(["quests"]);
    expect(queryKeys.shop).toEqual(["shop"]);
  });
});
