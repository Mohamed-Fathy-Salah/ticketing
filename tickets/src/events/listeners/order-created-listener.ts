import { Listener, OrderCreatedEvent, Subjects } from "@mfstickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(
    data: OrderCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    // find ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket, throw error
    if (!ticket) {
      throw new Error("ticket not found");
    }

    // mark the ticket as reserved by setting its orderid property
    ticket.set({ orderId: data.id });

    // save the ticket
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
        id: ticket.id,
        version: ticket.version,
        userId: ticket.userId,
        title: ticket.title,
        price: ticket.price,
        orderId: ticket.orderId
    });

    // ack the message
    msg.ack();
  }
}
