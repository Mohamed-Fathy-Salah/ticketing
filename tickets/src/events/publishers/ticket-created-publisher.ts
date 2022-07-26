import { Publisher, Subjects, TicketCreatedEvent } from "@mfstickets/common";
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
