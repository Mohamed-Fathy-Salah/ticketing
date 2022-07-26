import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@mfstickets/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("ticketid must be provided"),
    body("title").not().isEmpty().withMessage("title must be supplied"),
    body("price").isFloat({ gt: 0 }).withMessage("price must be > 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // find the ticket to order
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // make sure ticket is not reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("ticket is already reserved");
    }

    // calculate expire date for order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    // publish an event that order is created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      version: order.version,
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
