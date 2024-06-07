require("dotenv").config();

const axios = require("axios");

const deleteRabbitMQQueues = async (rabbitMQHost, username, password) => {
  try {
    // Encode credentials for Basic Auth
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    // Get the list of all queues
    const response = await axios.get(`https://${rabbitMQHost}/api/queues`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const queues = response.data;

    console.log(`Found total queues :  ${queues.length}`);
    // Filter queues that start with 'amq.gen--'
    const queuesToDelete = queues.filter((queue) =>
      queue.name.startsWith("amq.gen-"),
    );

    console.log(`Found queues to delte : ${queuesToDelete.length}`);
    for (const queue of queuesToDelete) {
      try {
        console.log(`Deleting queue: ${queue.name}`);

        // Delete the queue
        await axios.delete(
          `https://${rabbitMQHost}/api/queues/%2F/${encodeURIComponent(queue.name)}`,
          {
            headers: {
              Authorization: `Basic ${auth}`,
            },
          },
        );
      } catch (error) {
        console.error(`Failed to delete queue: ${queue.name}`, error);
      }
    }
  } catch (error) {
    console.error("Error fetching or deleting queues:", error);
  }
};

const { RABBIT_MQ_USER, RABBIT_MQ_PASSWORD, RABBIT_MQ_ENDPOINT } = process.env;
deleteRabbitMQQueues(RABBIT_MQ_ENDPOINT, RABBIT_MQ_USER, RABBIT_MQ_PASSWORD)
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch(console.error());
