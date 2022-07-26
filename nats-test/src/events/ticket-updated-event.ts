import { Subjects } from "./subjects";

export interface TicketupdatedEvent {
  subject: Subjects.TicketUpdated;
  data: {
    id: string;
    userId: string;
    title: string;
    price: number;
  };
}
