import request from "supertest";
import { app } from "../../app";
import { signin } from "../../test/signin";

it("responds with details about current user", async () => {
  const cookie = await signin();

  const res = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(res.body.currentUser.email).toEqual("test@test.com");
});

it("responds with null if not authenticated", async () => {
  const res = await request(app).get("/api/users/currentuser").send();

  console.log(res.body);
  expect(res.body.currentUser).toEqual(null);
});
