require("dotenv").config();
const mongoose = require("mongoose");
const { callbackify } = require("util");
require("../../components/shoe/shoe-model");
require("../../components/user/user-model");


const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

const SIG_MESSAGE = {
  SIGINT: process.env.SIGINT_MESSAGE,
  SIGTERM: process.env.SIGTERM_MESSAGE,
  SIGUSR2: process.env.SIGUSR2_MESSAGE,
};

const MONGOOSE_STATUS = {
  CONNECTED: process.env.MONGOOSE_CONNECTED_STATUS,
  DISCONNECTED: process.env.MONGOOSE_DISCONNECTED_STATUS,
  ERROR: process.env.MONGOOSE_ERROR_STATUS,
};

const PROCESS_SIGNAL = {
  SIGINT: process.env.PROCESS_SIGNAL_SIGINT,
  SIGTERM: process.env.PROCESS_SIGNAL_SIGTERM,
  SIGUSR2: process.env.PROCESS_SIGNAL_SIGUSR2,
};

const MONGOOSE_CONNECTION = {
  CONNECTED: process.env.MONGOOSE_CONNECTED_MESSAGE,
  DISCONNECTED: process.env.MONGOOSE_DISCONNECTED_MESSAGE,
  ERROR: process.env.MONGOOSE_ERROR_MESSAGE
}


const mongoose_connection_closeWithCallBack = callbackify(function () {
  return mongoose.connection.close();
});

const connectionString = `${DB_URL}/${DB_NAME}`;
mongoose.connect(connectionString);

mongoose.connection.on(MONGOOSE_STATUS.CONNECTED, function () {
  console.log(`${MONGOOSE_CONNECTION.CONNECTED} ${DB_NAME}`);
});

mongoose.connection.on(MONGOOSE_STATUS.DISCONNECTED, function () {
  console.log(MONGOOSE_CONNECTION.DISCONNECTED);
});

mongoose.connection.on(MONGOOSE_STATUS.ERROR, function (error) {
  console.log(`${MONGOOSE_CONNECTION.ERROR} ${error}`);
});

process.on(PROCESS_SIGNAL.SIGINT, function () {
  mongoose_connection_closeWithCallBack(function () {
    console.log(SIG_MESSAGE.SIGINT);
    process.exit(process.env.PROCESS_EXIT_ID);
  });
});

process.on(PROCESS_SIGNAL.SIGTERM, function () {
  mongoose_connection_closeWithCallBack(function () {
    console.log(SIG_MESSAGE.SIGTERM);
    process.exit(process.env.PROCESS_EXIT_ID);
  });
});

process.once(PROCESS_SIGNAL.SIGUSR2, function () {
  mongoose_connection_closeWithCallBack(function () {
    console.log(SIG_MESSAGE.SIGUSR2);
    process.kill(process.pid, PROCESS_SIGNAL.SIGUSR2);
  });
});
