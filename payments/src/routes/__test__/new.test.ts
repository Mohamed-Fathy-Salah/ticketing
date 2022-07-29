import { OrderStatus } from "@mfstickets/common";
import mongoose from "mongoose";
import { app } from "../../app";
import { Order } from "../../models/order";
import request from "supertest";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payments";

//jest.mock("../../stripe");

it("return 404 when puchase order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "adfdaf",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns 401 when purchasing order that doesnot belong to the user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: "afdsaf",
    version: 0,
    status: OrderStatus.Created,
    price: 20,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "adfdaf",
      orderId: order.id,
    })
    .expect(401);
});

it("return 400 when purchasing a cencelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: userId,
    userId,
    version: 0,
    status: OrderStatus.Cancelled,
    price: 20,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "adfdaf",
      orderId: userId,
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: userId,
    userId,
    version: 0,
    status: OrderStatus.Created,
    price: price,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  // using mock
  //const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  //expect(chargeOptions.source).toEqual("tok_visa");
  //expect(chargeOptions.amount).toEqual(20 * 100);
  //expect(chargeOptions.currency).toEqual("usd");

  // using realistic request
  const stripeCharges = await stripe.charges.list({ limit: 50 });

  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual("usd");

  const payment = await Payment.findOne({
      orderId: order.id,
      stripeId: stripeCharge!.id
  })

  expect(payment).not.toBeNull();
});
