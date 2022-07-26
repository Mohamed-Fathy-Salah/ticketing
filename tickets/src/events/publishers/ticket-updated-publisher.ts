import { Publisher, Subjects, TicketUpdatedEvent } from "@mfstickets/common";
export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
