import express from "express";
export const config = {
  api: {
    bodyParser: false,
  },
};
export default async function handler(req, res) {
  // Parse the request body using express.json() middleware
  const bodyPromise = new Promise((resolve, reject) => {
    express.json()(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(req.body);
      }
    });
  });

  if (req.method === "POST") {
    const body = await bodyPromise;

    // Process the webhook payload here...
    console.log(body?.entry[0].changes[0].value.contacts[0].profile);
    console.log(body?.entry[0].changes[0].value.contacts[0].wa_id);
    console.log(body?.entry[0].changes[0].value.messages[0].text.body);

    // Respond with a 200 OK status code to acknowledge receipt of the webhook
    res.status(200).end();
  } else if (req.method === "GET") {
    if (
      req.query["hub.mode"] === "subscribe" &&
      req.query["hub.verify_token"] === process.env.VERIFY_TOKEN
    ) {
      res.status(200).send(req.query["hub.challenge"]);
    } else {
      res.status(403).send("Invalid verify token");
    }
  } else {
    // Respond with a 405 Method Not Allowed status code for non-POST requests
    res.setHeader("Allow", "POST");
    res.status(405).end();
  }
}
