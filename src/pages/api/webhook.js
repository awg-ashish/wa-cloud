import express from "express";
import axios from "axios";

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

        //receiving messages
        console.log(body.entry[0].changes[0].value);
        if (body.entry) {
            console.log("-------------------------------------------------");
            console.dir(body.entry[0].changes[0].value.messages[0]);
            console.log("-------------------------------------------------");
            console.log("Field->", body.entry[0].changes[0].field);
            console.log(
                "Message Id->",
                body?.entry[0].changes[0].value.messages[0].id
            );
            console.log(
                "Time Sent->",
                Date(body?.entry[0].changes[0].value.messages[0].timestamp)
            );
            console.log(
                "Type->",
                body?.entry[0].changes[0].value.messages[0].type
            );
            console.log(
                "Name->",
                body?.entry[0].changes[0].value.contacts[0].profile.name
            );
            console.log(
                "Phone Number->",
                body?.entry[0].changes[0].value.contacts[0].wa_id
            );
            console.log(
                "messageBody->",
                body?.entry[0].changes[0].value.messages[0].text?.body
            );
            console.log(
                "Media Id->",
                body?.entry[0].changes[0].value.messages[0].image?.id
            );
        }

        // Getting the media id for media messages
        const mediaId = body?.entry[0].changes[0].value.messages[0].image?.id;
        if (mediaId) {
            const mediaUrl = await fetchMedia(
                mediaId,
                process.env.WHATSAPP_TOKEN
            );
            console.log("Media URL -> ", mediaUrl);
            //// Now you can use the media URL to download the media file
            const config = {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                },
                responseType: "arraybuffer", // specify the response type as arraybuffer
            };

            try {
                const response = await axios.get(mediaUrl, config);
                const mediaData = response.data; // binary data of media
                // // Now you can use the mediaData to display the media or save it in the database
                console.log(mediaData);
            } catch (error) {
                // handle error
            }
        }

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
