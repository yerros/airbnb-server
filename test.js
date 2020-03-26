const webpush = require("web-push");
const publicVapidKey =
  "BFqjre-1gkB_XlceOyYa2zO-7X-YoWvPPVlPtK_l-D_UlJQpF1meF1ncONgjmFTQU3zfdpw8zGjVtD0LBn5q_uA";
const privateVapidKey = "6dcnr0lh0i4tArRvhmw89-1-BxK9Q-flNWJnmRHbu5E";

webpush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);

const subscription = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/cheCd1UQrTw:APA91bHAfa5HZx5SJ0N8391bKvzsW-KictzicneH-S5C0LY8Aq6gfOerLvXGrA5lsNESR0M7JaPjFQqmbzEKUZD34h8voukSFHDFPOQuo9liwvzOrTsDTsCWxWD75aDod6inoTEhC4Fy",
  expirationTime: null,
  keys: {
    p256dh:
      "BPivntXXuXXosOrM5Pf8Fv437zRQ9M0npfY46kI4jtrsnxILnqHTQKnaOJjSZmmN__yuSsz9Mz3XxRkAI5RWnLU",
    auth: "I8EkyhOUOeN21Vaq3NYwAA"
  }
};

const payload = JSON.stringify({ title: "Baru", body: "lorem ipsum" });

// Pass object into sendNotification
webpush
  .sendNotification(subscription, payload)
  .catch(err => console.error(err));
