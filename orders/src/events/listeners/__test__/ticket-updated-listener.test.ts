import { TicketUpdatedEvent } from "@mfstickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedListener } from "../ticket-updated-listener"

const setup = async () => {
    //create a listener
   const listener = new TicketUpdatedListener(natsWrapper.client);
   
    //create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString() ,
        title: "blah",
        price: 20
    })
    await ticket.save();

    //create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        userId: "adsf",
        title: "blah",
        price: 100
    };

    //create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    //return all 
    return {listener, ticket, data, msg};
}

it('finds, updates and saves a ticket', async () => {
    const {msg, data, ticket, listener} = await setup(); 

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
})

it('acks the message', async () => {
    const {msg, data, ticket, listener} = await setup(); 

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

it('does not call ack if the event has a skipped version number', async () => {
    const {msg, data, listener, ticket} = await setup();

    data.version = 10;

    try{
        await listener.onMessage(data, msg);
    }catch(err){}

    expect(msg.ack).not.toHaveBeenCalled();
})
