import { Publisher, Subjects, TicketupdatedEvent } from "@mfstickets/common";
export class TicketUpdatedPublisher extends Publisher<TicketupdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
