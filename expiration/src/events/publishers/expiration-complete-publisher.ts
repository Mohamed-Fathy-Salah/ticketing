import { ExpirationCompleteEvent, Publisher, Subjects } from "@mfstickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete ;
}
