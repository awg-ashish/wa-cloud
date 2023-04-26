import express from "express";
import axios from "axios";
import app from "../../../firebase";
import {
  addDoc,
  collection,
  getFirestore,
  doc,
  setDoc,
} from "firebase/firestore";
const db = getFirestore(app);
export const config = {
  api: {
    bodyParser: false,
  },
};
// Function to fetch media from WhatsApp Cloud API
async function fetchMedia(mediaId, accessToken) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v16.0/${mediaId}/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const mediaUrl = response.data?.url;
    return mediaUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
}
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

    //response and status of sent messages

    //receiving messages

    // 1. Text Messages

    console.log(body.entry[0].changes[0].value);
    if (
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0].type === "text"
    ) {
      console.log(
        "----------------------INCOMING MESSAGE - TEXT---------------------------"
      );
      console.log(
        "Name->",
        body?.entry[0].changes[0].value.contacts[0].profile.name
      );
      console.log(
        "Phone Number->",
        `+${body?.entry[0].changes[0].value.contacts[0].wa_id}`
      );
      console.dir(body.entry[0].changes[0].value.messages[0]);
      console.log(
        "---------------------------------------------------------------------------"
      );
      //adding data to firebase
      const messageRef = doc(
        db,
        "messages",
        "ashish.blackhawk@gmail.com",
        body.entry[0].changes[0].value.contacts[0].wa_id,
        body.entry[0].changes[0].value.messages[0].id
      );
      setDoc(messageRef, body.entry[0].changes[0].value.messages[0].text, {
        merge: true,
      });
    }

    // 2. Media Messages

    if (
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0].type === "image"
    ) {
      const mediaId = body?.entry[0].changes[0].value.messages[0].image?.id;
      if (mediaId) {
        const mediaUrl = await fetchMedia(mediaId, process.env.WHATSAPP_TOKEN);
        // Now you can use the media URL to download the media file
        const config = {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          },
          responseType: "arraybuffer", // specify the response type as arraybuffer
        };

        try {
          const response = await axios.get(mediaUrl, config);
          const mediaData = response.data; // Binary data of media. Now the mediaData can be used to display the media or can be saved in the database

          console.log(
            "-----------------------------INCOMING MESSAGE - MEDIA------------------------------"
          );
          console.log(
            "Name->",
            body?.entry[0].changes[0].value.contacts[0].profile.name
          );
          console.log(
            "Phone Number->",
            `+${body?.entry[0].changes[0].value.contacts[0].wa_id}`
          );
          body.entry[0].changes[0].value.messages[0].image.caption
            ? console.log(
                "Caption->",
                body.entry[0].changes[0].value.messages[0].image.caption
              )
            : "";
          console.log("Image Data in Binary->", mediaData);
          console.dir(body.entry[0].changes[0].value.messages[0]);
          console.log(
            "--------------------------------------------------------------------------------------"
          );
        } catch (error) {
          // handle error
        }
      }
    }

    // Respond with a 200 OK status code to acknowledge receipt of the webhook
    res.status(200).end();
  } else if (req.method === "GET") {
    // required verification from Meta
    if (
      req.query["hub.mode"] === "subscribe" &&
      req.query["hub.verify_token"] === process.env.VERIFY_TOKEN
    ) {
      res.status(200).send(req.query["hub.challenge"]);
    } else {
      res.status(403).send("Invalid verify token");
    }
  } else {
    // Respond with a 405 Method Not Allowed status code for non-POST/GET requests
    res.status(405).end();
  }
}
