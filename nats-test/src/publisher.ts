import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();

// client
const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", async () => {
  console.log("publisher connected to nats");

  const publisher = new TicketCreatedPublisher(stan);
  try{
      await publisher.publish({
          id: "123",
          title: "adsf",
          price: 20,
      });
  } catch (err) {
      console.log(err);
  }
});
