import { Publisher, OrderCreatedEvent, Subjects } from "@mfstickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
